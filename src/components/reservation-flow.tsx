"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type ReservationLabels = Record<string, string>;

type Props = {
  labels: ReservationLabels;
  locale: string;
};

type CalendarCell = {
  key: string;
  day: number;
  inMonth: boolean;
};

const berlinToday = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return values.year + "-" + values.month + "-" + values.day;
};

const initialDate = berlinToday();
const initialMonth = new Date(initialDate + "T12:00:00");

const pad = (value: number) => String(value).padStart(2, "0");

const dateKey = (date: Date) =>
  date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());

const formatDateForLocale = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(value + "T12:00:00"),
  );

const timeLabel = (minutes: number) => pad(Math.floor(minutes / 60)) + ":" + pad(minutes % 60);

const calendarCells = (month: Date): CalendarCell[] => {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leading = (firstDay.getDay() + 6) % 7;
  const cells: CalendarCell[] = [];

  for (let index = 0; index < leading; index += 1) {
    cells.push({ key: "empty-" + index, day: 0, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const value = new Date(month.getFullYear(), month.getMonth(), day);
    cells.push({ key: dateKey(value), day, inMonth: true });
  }

  return cells;
};

const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function ReservationFlow({ labels, locale }: Props) {
  const [step, setStep] = useState(1);
  const [visibleMonth, setVisibleMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectionPhase, setSelectionPhase] = useState<"date" | "guests">("date");
  const [guests, setGuests] = useState(2);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [largePartyOpen, setLargePartyOpen] = useState(false);
  const [largePartySubmitted, setLargePartySubmitted] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [serverTimes, setServerTimes] = useState<string[] | null>(null);

  const duration = guests <= 2 ? 60 : 90;
  const monthCells = useMemo(() => calendarCells(visibleMonth), [visibleMonth]);
  const todayKey = berlinToday();
  const selectedDateObject = new Date(selectedDate + "T12:00:00");
  const dayOfWeek = selectedDateObject.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const openingStart = isWeekend ? 17 * 60 : 12 * 60;
  const latestStart = 21 * 60 - duration;
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let minutes = openingStart; minutes <= latestStart; minutes += 30) {
      slots.push(timeLabel(minutes));
    }
    return slots;
  }, [openingStart, latestStart]);

  const selectedDateLabel = formatDateForLocale(selectedDate, locale);

  useEffect(() => {
    if (step !== 2) return;
    const controller = new AbortController();
    setServerTimes(null);
    fetch("/api/reservations/availability?date=" + encodeURIComponent(selectedDate) + "&guests=" + guests, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = (await response.json()) as { times?: string[] };
        return Array.isArray(payload.times) ? payload.times : null;
      })
      .then((times) => { if (times) setServerTimes(times); })
      .catch(() => undefined);
    return () => controller.abort();
  }, [guests, selectedDate, step]);
  const durationLabel = duration === 60 ? labels.hour : labels.hours;
  const displayedTimeSlots = serverTimes ?? timeSlots;

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const chooseDate = (value: string) => {
    setSelectedDate(value);
    setSelectedTime(null);
  };

  const continueToGuests = () => setSelectionPhase("guests");
  const backToDate = () => setSelectionPhase("date");

  const toggleRequest = (request: string) => {
    setSpecialRequests((current) =>
      current.includes(request) ? current.filter((item) => item !== request) : [...current, request],
    );
  };

  const goToDetails = () => {
    if (selectedTime) setStep(3);
  };

  const confirmPreview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTime || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          guests,
          name: fullName,
          email,
          phone,
          specialRequests,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setSubmitError(payload.error ?? labels.submitError);
        return;
      }
      setStep(4);
    } catch {
      setSubmitError(labels.submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="reservation-main" aria-labelledby="reservation-title">
      <div className="reservation-layout">
        <aside className="reservation-intro">
          <h1 id="reservation-title" className="reservation-title">
            {step === 1 ? labels.title : step === 2 ? labels.selectTime : step === 3 ? labels.detailsTitle : labels.confirmedTitle}
          </h1>
        </aside>

        <div className="reservation-panel">
          {step === 1 ? (
            <div className="reservation-step reservation-step-enter">
              {selectionPhase === "date" ? (
                <>
                  <div className="reservation-section-heading reservation-section-heading-stacked">
                    <strong>{selectedDateLabel}</strong>
                  </div>
                  <div className="reservation-calendar">
                    <div className="reservation-calendar-header">
                      <button type="button" className="reservation-icon-button" onClick={() => moveMonth(-1)} aria-label={labels.monthPrev}>
                        ←
                      </button>
                      <strong>
                        {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(visibleMonth)}
                      </strong>
                      <button type="button" className="reservation-icon-button" onClick={() => moveMonth(1)} aria-label={labels.monthNext}>
                        →
                      </button>
                    </div>
                    <div className="reservation-weekdays" aria-hidden="true">
                      {weekdays.map((day) => <span key={day}>{locale === "en" ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][weekdays.indexOf(day)] : day}</span>)}
                    </div>
                    <div className="reservation-calendar-grid" role="grid" aria-label={labels.chooseDate}>
                      {monthCells.map((cell) =>
                        cell.inMonth ? (
                          <button
                            type="button"
                            key={cell.key}
                            className={selectedDate === cell.key ? "reservation-date reservation-date-selected" : "reservation-date"}
                            onClick={() => chooseDate(cell.key)}
                            aria-pressed={selectedDate === cell.key}
                          >
                            {cell.day}
                          </button>
                        ) : (
                          <span key={cell.key} className="reservation-date reservation-date-empty" aria-hidden="true" />
                        ),
                      )}
                    </div>
                  </div>
                  <div className="reservation-step-actions reservation-step-actions-end">
                    <button type="button" className="reservation-primary" onClick={continueToGuests}>
                      {labels.continue}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="reservation-section-heading">
                    <div>
                      <strong>{selectedDateLabel}</strong>
                    </div>
                    <button type="button" className="reservation-inline-link reservation-change-date" onClick={backToDate}>
                      {labels.changeDate}
                    </button>
                  </div>
                  <fieldset className="reservation-guest-fieldset">
                    <legend>{labels.guests}</legend>
                    <div className="reservation-guest-grid">
                      {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                        <button
                          type="button"
                          key={value}
                          className={guests === value ? "reservation-guest reservation-guest-selected" : "reservation-guest"}
                          onClick={() => setGuests(value)}
                          aria-pressed={guests === value}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <p className="reservation-helper">{guests} {labels.chooseGuests} · {durationLabel}</p>
                    <button
                      type="button"
                      className="reservation-inquiry-toggle"
                      onClick={() => {
                        setLargePartyOpen((current) => !current);
                        setLargePartySubmitted(false);
                      }}
                      aria-expanded={largePartyOpen}
                    >
                      {labels.largePartyPrompt}
                      <span aria-hidden="true">{largePartyOpen ? "−" : "+"}</span>
                    </button>
                    {largePartyOpen ? (
                      <div className="reservation-inquiry">
                        {largePartySubmitted ? (
                          <div className="reservation-inquiry-success" role="status">
                            <strong>{labels.largePartySuccess}</strong>
                            <button type="button" className="reservation-inline-link" onClick={() => setLargePartyOpen(false)}>
                              {labels.closeInquiry}
                            </button>
                          </div>
                        ) : (
                          <form
                            className="reservation-inquiry-form"
                            onSubmit={async (event) => {
                              event.preventDefault();
                              if (inquirySubmitting) return;
                              setInquirySubmitting(true);
                              setInquiryError("");
                              try {
                                const response = await fetch("/api/reservation-inquiries", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    name: inquiryName,
                                    email: inquiryEmail,
                                    phone: inquiryPhone,
                                    message: inquiryMessage,
                                  }),
                                });
                                const payload = (await response.json()) as { error?: string };
                                if (!response.ok) {
                                  setInquiryError(payload.error ?? labels.submitError);
                                  return;
                                }
                                setLargePartySubmitted(true);
                              } catch {
                                setInquiryError(labels.submitError);
                              } finally {
                                setInquirySubmitting(false);
                              }
                            }}
                          >
                            <p>{labels.moreThanTen}</p>
                            <div className="reservation-inquiry-fields">
                              <label>
                                <span>{labels.largePartyName}</span>
                                <input required value={inquiryName} onChange={(event) => setInquiryName(event.target.value)} autoComplete="name" />
                              </label>
                              <label>
                                <span>{labels.largePartyEmail}</span>
                                <input required type="email" value={inquiryEmail} onChange={(event) => setInquiryEmail(event.target.value)} autoComplete="email" />
                              </label>
                              <label>
                                <span>{labels.largePartyPhone}</span>
                                <input required type="tel" value={inquiryPhone} onChange={(event) => setInquiryPhone(event.target.value)} autoComplete="tel" />
                              </label>
                              <label className="reservation-inquiry-message">
                                <span>{labels.largePartyMessage}</span>
                                <textarea required value={inquiryMessage} onChange={(event) => setInquiryMessage(event.target.value)} rows={3} />
                              </label>
                            </div>
                            {inquiryError ? <p className="reservation-submit-error" role="alert">{inquiryError}</p> : null}
                            <button type="submit" className="reservation-primary" disabled={inquirySubmitting}>{inquirySubmitting ? labels.submitting : labels.largePartySubmit}</button>
                          </form>
                        )}
                      </div>
                    ) : null}
                  </fieldset>
                  <div className="reservation-step-actions reservation-step-actions-end">
                    <button type="button" className="reservation-secondary" onClick={backToDate}>
                      {labels.back}
                    </button>
                    <button type="button" className="reservation-primary" onClick={() => setStep(2)}>
                      {labels.continue}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="reservation-step reservation-step-enter">
              <label className="reservation-time-picker">
                <span>{labels.timePlaceholder}</span>
                <select value={selectedTime ?? ""} onChange={(event) => setSelectedTime(event.target.value)}>
                  <option value="" disabled>{labels.timePlaceholder}</option>
                  {displayedTimeSlots.map((time) => <option key={time} value={time}>{time}</option>)}
                </select>
              </label>
              <div className="reservation-step-actions">
                <button type="button" className="reservation-secondary" onClick={() => setStep(1)}>
                  {labels.back}
                </button>
                <button type="button" className="reservation-primary" onClick={goToDetails} disabled={!selectedTime}>
                  {labels.continue}
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <form className="reservation-step reservation-step-enter" onSubmit={confirmPreview}>
              <div className="reservation-summary-card">
                <div>
                  <strong>{selectedDateLabel}</strong>
                </div>
                <dl>
                  <div><dt>{labels.selectedTime ?? "Time"}</dt><dd>{selectedTime}</dd></div>
                  <div><dt>{labels.selectedGuests ?? labels.guests}</dt><dd>{guests}</dd></div>
                  <div><dt>{labels.selectedDuration ?? labels.duration}</dt><dd>{durationLabel}</dd></div>
                </dl>
              </div>

              <div className="reservation-fields">
                <label>
                  <span>{labels.fullName}</span>
                  <input required value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" />
                </label>
                <label>
                  <span>{labels.email}</span>
                  <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
                </label>
                <label>
                  <span>{labels.phone}</span>
                  <input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
                </label>
              </div>

              <fieldset className="reservation-request-fieldset">
                <legend>{labels.specialRequests} <span>({labels.optional})</span></legend>
                <div className="reservation-request-grid">
                  {[["children", labels.children], ["dog", labels.dog]].map(([value, text]) => (
                    <button
                      type="button"
                      key={value}
                      className={specialRequests.includes(value) ? "reservation-request reservation-request-selected" : "reservation-request"}
                      onClick={() => toggleRequest(value)}
                      aria-pressed={specialRequests.includes(value)}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </fieldset>

              <p className="reservation-allergy-note">{labels.allergyNotice}</p>

              {submitError ? <p className="reservation-submit-error" role="alert">{submitError}</p> : null}

              <div className="reservation-step-actions">
                <button type="button" className="reservation-secondary" onClick={() => setStep(2)} disabled={isSubmitting}>
                  {labels.back}
                </button>
                <button type="submit" className="reservation-primary" disabled={isSubmitting}>
                  {isSubmitting ? labels.submitting : labels.confirm}
                </button>
              </div>
            </form>
          ) : null}

          {step === 4 ? (
            <div className="reservation-step reservation-step-enter reservation-confirmation">
              <div className="reservation-success-icon" aria-hidden="true">✓</div>
              <p className="reservation-confirmation-message">{labels.confirmedMessage}</p>
              <dl className="reservation-confirmation-summary">
                <div><dt>{labels.date}</dt><dd>{selectedDateLabel}</dd></div>
                <div><dt>{labels.selectedTime ?? "Time"}</dt><dd>{selectedTime}</dd></div>
                <div><dt>{labels.guests}</dt><dd>{guests}</dd></div>
                <div><dt>{labels.duration}</dt><dd>{durationLabel}</dd></div>
                <div><dt>{labels.guestName}</dt><dd>{fullName}</dd></div>
              </dl>
              <div className="reservation-confirmation-actions">
                <a className="reservation-secondary" href="#" onClick={(event) => event.preventDefault()}>{labels.addCalendar}</a>
                <a className="reservation-secondary" href="https://maps.google.com/?q=Leo%27s+Juice+%26+Burger+L%C3%BCbeck-K%C3%BCcknitz" target="_blank" rel="noreferrer">{labels.directions}</a>
                <a className="reservation-primary" href="tel:+494514857170">{labels.callRestaurant}</a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

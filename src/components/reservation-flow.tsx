"use client";

import { useMemo, useState } from "react";

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

const initialDate = "2026-10-28";
const initialMonth = new Date(2026, 9, 1);

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
  const [guests, setGuests] = useState(2);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);

  const duration = guests <= 3 ? 60 : 90;
  const monthCells = useMemo(() => calendarCells(visibleMonth), [visibleMonth]);
  const selectedDateObject = new Date(selectedDate + "T12:00:00");
  const dayOfWeek = selectedDateObject.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const openingStart = isWeekend ? 17 * 60 : 12 * 60;
  const latestStart = 21 * 60 - duration;
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let minutes = openingStart; minutes <= latestStart; minutes += 15) {
      slots.push(timeLabel(minutes));
    }
    return slots;
  }, [openingStart, latestStart]);

  const stepLabel = labels.step.replace("{number}", String(step));
  const selectedDateLabel = formatDateForLocale(selectedDate, locale);
  const durationLabel = duration === 60 ? labels.hour : labels.hours;

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const chooseDate = (value: string) => {
    setSelectedDate(value);
    setSelectedTime(null);
  };

  const toggleRequest = (request: string) => {
    setSpecialRequests((current) =>
      current.includes(request) ? current.filter((item) => item !== request) : [...current, request],
    );
  };

  const goToDetails = () => {
    if (selectedTime) setStep(3);
  };

  const confirmPreview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep(4);
  };

  return (
    <section className="reservation-main" aria-labelledby="reservation-title">
      <div className="reservation-layout">
        <aside className="reservation-intro">
          <p className="reservation-eyebrow">{labels.eyebrow}</p>
          <h1 id="reservation-title" className="reservation-title">
            {step === 1 ? labels.title : step === 2 ? labels.selectTime : step === 3 ? labels.detailsTitle : labels.confirmedTitle}
          </h1>
          {step < 4 ? <p className="reservation-intro-copy">{labels.intro}</p> : null}
          <div className="reservation-preview-note">{labels.previewNotice}</div>
          {step < 4 ? (
            <div className="reservation-progress" aria-label={stepLabel}>
              <span className="reservation-progress-number">{stepLabel}</span>
              <span className="reservation-progress-track" aria-hidden="true">
                <span style={{ width: (step / 4) * 100 + "%" }} />
              </span>
            </div>
          ) : null}
        </aside>

        <div className="reservation-panel">
          {step === 1 ? (
            <div className="reservation-step reservation-step-enter">
              <div className="reservation-section-heading">
                <div>
                  <span className="reservation-label">{labels.date}</span>
                  <strong>{selectedDateLabel}</strong>
                </div>
                <span className="reservation-duration-chip">
                  {labels.duration}: {durationLabel}
                </span>
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
              </fieldset>

              <div className="reservation-step-actions reservation-step-actions-end">
                <button type="button" className="reservation-primary" onClick={() => setStep(2)}>
                  {labels.continue}
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="reservation-step reservation-step-enter">
              <div className="reservation-summary-line">
                <span>{selectedDateLabel}</span>
                <span>{guests} {labels.chooseGuests}</span>
                <span>{durationLabel}</span>
              </div>
              <div className="reservation-section-heading reservation-section-heading-stacked">
                <span className="reservation-label">{labels.selectTime}</span>
                <strong>{labels.openingHours}</strong>
              </div>
              <p className="reservation-opening-note">{labels.openingHoursNote}</p>
              <div className="reservation-time-grid" role="listbox" aria-label={labels.selectTime}>
                {timeSlots.map((time) => (
                  <button
                    type="button"
                    key={time}
                    className={selectedTime === time ? "reservation-time reservation-time-selected" : "reservation-time"}
                    onClick={() => setSelectedTime(time)}
                    aria-selected={selectedTime === time}
                    role="option"
                  >
                    {time}
                  </button>
                ))}
              </div>
              <p className="reservation-duration-note">◷ {labels.duration}: {durationLabel}</p>
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
                  <span className="reservation-label">{labels.summary}</span>
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
                  {[["birthday", labels.birthday], ["children", labels.children], ["highChair", labels.highChair], ["dog", labels.dog]].map(([value, text]) => (
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

              <div className="reservation-step-actions">
                <button type="button" className="reservation-secondary" onClick={() => setStep(2)}>
                  {labels.back}
                </button>
                <button type="submit" className="reservation-primary">
                  {labels.confirm}
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

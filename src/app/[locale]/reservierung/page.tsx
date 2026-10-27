import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ReservationFlow } from "@/components/reservation-flow";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ReservationPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const home = await getTranslations({ locale, namespace: "HomePage" });
  const reservation = await getTranslations({ locale, namespace: "Reservation" });

  return (
    <main className="site-shell reservation-shell">
      <SiteHeader
        locale={locale}
        bookingHref={"/" + locale + "/reservierung"}
        labels={{
          home: home("navigation.home"),
          menu: home("navigation.menu"),
          gallery: home("navigation.gallery"),
          contact: home("navigation.contact"),
          location: home("location"),
          booking: home("reserve"),
          menuButton: home("navigation.openMenu"),
          language: home("navigation.language"),
          mainNavigation: home("navigation.mainNavigation"),
          mobileNavigation: home("navigation.mobileNavigation"),
        }}
      />
      <ReservationFlow
        locale={locale}
        labels={{
          eyebrow: reservation("eyebrow"),
          step: reservation("step"),
          title: reservation("title"),
          intro: reservation("intro"),
          date: reservation("date"),
          guests: reservation("guests"),
          duration: reservation("duration"),
          hour: reservation("hour"),
          hours: reservation("hours"),
          moreThanTen: reservation("moreThanTen"),
          callRestaurant: reservation("callRestaurant"),
          continue: reservation("continue"),
          back: reservation("back"),
          selectTime: reservation("selectTime"),
          openingHours: reservation("openingHours"),
          openingHoursNote: reservation("openingHoursNote"),
          detailsTitle: reservation("detailsTitle"),
          fullName: reservation("fullName"),
          email: reservation("email"),
          phone: reservation("phone"),
          specialRequests: reservation("specialRequests"),
          birthday: reservation("birthday"),
          children: reservation("children"),
          highChair: reservation("highChair"),
          dog: reservation("dog"),
          allergyNotice: reservation("allergyNotice"),
          summary: reservation("summary"),
          confirm: reservation("confirm"),
          previewNotice: reservation("previewNotice"),
          confirmedTitle: reservation("confirmedTitle"),
          confirmedMessage: reservation("confirmedMessage"),
          addCalendar: reservation("addCalendar"),
          directions: reservation("directions"),
          guestName: reservation("guestName"),
          selectedTime: reservation("selectedTime"),
          selectedGuests: reservation("selectedGuests"),
          selectedDuration: reservation("selectedDuration"),
          largePartyPrompt: reservation("largePartyPrompt"),
          largePartyName: reservation("largePartyName"),
          largePartyEmail: reservation("largePartyEmail"),
          largePartyPhone: reservation("largePartyPhone"),
          largePartyMessage: reservation("largePartyMessage"),
          largePartySubmit: reservation("largePartySubmit"),
          largePartySuccess: reservation("largePartySuccess"),
          closeInquiry: reservation("closeInquiry"),
          changeDate: reservation("changeDate"),
          timePlaceholder: reservation("timePlaceholder"),
          monthPrev: reservation("monthPrev"),
          monthNext: reservation("monthNext"),
          chooseDate: reservation("chooseDate"),
          chooseGuests: reservation("chooseGuests"),
          optional: reservation("optional"),
        }}
      />
    </main>
  );
}

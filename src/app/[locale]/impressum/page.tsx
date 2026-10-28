import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";

export default async function LegalNoticePage({ params }: PageProps<"/[locale]/impressum">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const legal = await getTranslations({ locale, namespace: "LegalNotice" });

  return (
    <main className="site-shell legal-page">
      <SiteHeader
        locale={locale}
        bookingHref={`/${locale}/reservierung`}
        labels={{
          home: t("navigation.home"), menu: t("navigation.menu"), gallery: t("navigation.gallery"), contact: t("navigation.contact"),
          location: t("location"), booking: t("reserve"), menuButton: t("navigation.openMenu"), language: t("navigation.language"),
          mainNavigation: t("navigation.mainNavigation"), mobileNavigation: t("navigation.mobileNavigation"), voucher: t("footer.voucher"),
        }}
      />
      <article className="legal-content">
        <p className="legal-kicker">{legal("intro")}</p>
        <h1>{legal("title")}</h1>
        <section><h2>{legal("company")}</h2><p>{legal("address")}<br />{legal("city")}<br />{legal("country")}</p><p><strong>{legal("representedBy")}</strong><br />{legal("managingDirector")}</p></section>
        <section><h2>{legal("contact")}</h2><p>{legal("telephone")}<br /><a href="mailto:eva@juiceandburger.de">{legal("email")}</a></p></section>
        <section><h2>{legal("register")}</h2><p>{legal("registerCourt")}<br />{legal("registerNumber")}</p></section>
        <section><h2>{legal("dispute")}</h2><p>{legal("disputeText")}</p></section>
      </article>
      <footer className="site-footer legal-footer"><div className="site-footer-bottom"><span>© 2026 Leo’s Juice &amp; Burger</span><div className="site-footer-legal"><a href={`/${locale}`}>{t("footer.home")}</a><a href={`/${locale}/impressum`} aria-current="page">{t("footer.imprint")}</a><a href={"/" + locale + "/datenschutz"}>{t("footer.privacy")}</a></div></div></footer>
    </main>
  );
}

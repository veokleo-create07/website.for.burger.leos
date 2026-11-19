import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";

export default async function LocalePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "HomePage" });
  return (
    <main className="site-shell" id="start">
      <div className="hero-card">
        <SiteHeader
          locale={locale}
          bookingHref={"/" + locale + "/reservierung"}
          labels={{
            home: t("navigation.home"),
            menu: t("navigation.menu"),
            gallery: t("navigation.gallery"),
            contact: t("navigation.contact"),
            location: t("location"),
            booking: t("reserve"),
            menuButton: t("navigation.openMenu"),
            language: t("navigation.language"),
            mainNavigation: t("navigation.mainNavigation"),
            mobileNavigation: t("navigation.mobileNavigation"),
            voucher: t("footer.voucher"),
          }}
        />

        <section className="hero-simple" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-simple-title">
            {t("simpleTitle")}
          </h1>
          <a className="hero-button hero-button-primary" href={"/" + locale + "/reservierung"}>
            {t("reserve")}
          </a>
        </section>
      </div>

      <footer className="site-footer" id="footer">
        <div className="site-footer-main">
          <a className="site-footer-brand" href={"/" + locale} aria-label={t("footer.brand")}>
            <Image
              src="/images/leo-logo.png"
              alt=""
              width={800}
              height={800}
            />
            <span>{t("footer.location")}</span>
          </a>

          <nav className="site-footer-nav" aria-label={t("footer.navigationLabel")}>
            <a href={"/" + locale + "#start"}>{t("footer.home")}</a>
            <a href={"/" + locale + "/reservierung"}>{t("footer.reserve")}</a>
          </nav>

          <div className="site-footer-contact">
            <p>{t("footer.contact")}</p>
            <a href="https://maps.app.goo.gl/o1ea7zNGKqw8NxTN7?g_st=ic" target="_blank" rel="noreferrer">
              {t("footer.address")}<br />{t("footer.city")}
            </a>
            <a href="tel:+4945170323040">{t("footer.phone")}</a>
            <p className="site-footer-hours"><strong>{t("visit.hours")}</strong><br />{t("visit.closed")}</p>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>© 2026 {t("footer.brand")}</span>
          <div className="site-footer-legal">
            <a href={"/" + locale + "/impressum"}>{t("footer.imprint")}</a>
            <a href={"/" + locale + "/datenschutz"}>{t("footer.privacy")}</a>
          </div>
        </div>
      </footer>

    </main>
  );
}

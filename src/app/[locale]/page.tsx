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

        <section className="hero-stage" aria-labelledby="hero-title">
          <h1 className="hero-background-title" id="hero-title" data-locale={locale}>
            <span className="hero-title-mask">
              <span className="hero-title-word hero-title-word--first">{t("headline.first")}</span>
            </span>
            <span className="hero-title-mask">
              <span className="hero-title-word hero-title-word--second">{t("headline.second")}</span>
            </span>
            {t("headline.third") ? (
              <span className="hero-title-mask">
                <span className="hero-title-word hero-title-word--third">{t("headline.third")}</span>
              </span>
            ) : null}
          </h1>

          <div className="hero-burger" aria-hidden="true">
            <div className="hero-burger-motion">
              <div className="hero-burger-float">
                <Image
                  src="/images/burger-cutout.png"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 767px) 88vw, 35vw"
                />
              </div>
            </div>
          </div>

          <div className="hero-sticker hero-sticker--fresh" aria-hidden="true">
            Fresh<br />Daily
          </div>
          <div className="hero-sticker hero-sticker--love" aria-hidden="true">
            Made With<br />Love
          </div>

          <div className="hero-wordmark" aria-hidden="true">
            Leo's
          </div>

          <div className="hero-bottom">
            <div className="hero-bottom-left">
              <p className="hero-description">{t("description")}</p>
              <div className="hero-actions">
                <a className="hero-button hero-button-primary" href={"/" + locale + "/reservierung"}>
                  {t("reserve")}
                </a>
              </div>
            </div>
            <p className="hero-description hero-bottom-right">{t("supportingRight")}</p>
          </div>
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

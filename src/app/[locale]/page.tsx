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
  const giftVoucherHref = "https://www.bon-bon.de/gutschein/leos-juice-burger-luebeck/";

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
                <a className="hero-button hero-button-secondary" href="https://www.restablo.de/restaurant/leos-juice-burger-luebeck-kuecknitz.html" target="_blank" rel="noreferrer">
                  {t("viewMenu")}
                </a>
              </div>
            </div>
            <p className="hero-description hero-bottom-right">{t("supportingRight")}</p>
          </div>
        </section>
      </div>

      <section className="favorites-section" id="favoriten" aria-labelledby="favorites-title">
        <div className="favorites-heading">
          <h2 id="favorites-title">{t("favorites.title")}</h2>
        </div>

        <div className="favorites-list">
          {[
            { key: "triple", className: "favorites-item--triple" },
            { key: "chili", className: "favorites-item--chili" },
            { key: "crunchy", className: "favorites-item--crunchy" },
          ].map((item) => (
            <article className={"favorites-item " + item.className} key={item.key}>
              <div className="favorites-image-wrap">
                <Image
                  src="/images/burger-cutout.png"
                  alt={t("favorites.items." + item.key + ".imageAlt")}
                  fill
                  sizes="(max-width: 767px) 76vw, 30vw"
                />
              </div>
              <h3>{t("favorites.items." + item.key + ".name")}</h3>
            </article>
          ))}
        </div>

        <a className="hero-button hero-button-primary favorites-cta" href="https://www.restablo.de/restaurant/leos-juice-burger-luebeck-kuecknitz.html" target="_blank" rel="noreferrer">
          {t("favorites.cta")}
        </a>
      </section>

      <section className="voucher-section" id="gutscheine" aria-labelledby="voucher-title">
        <div className="voucher-copy">
          <h2 id="voucher-title">{t("voucher.title")}</h2>
          <p>{t("voucher.description")}</p>
          <a className="hero-button voucher-cta" href={giftVoucherHref} target="_blank" rel="noreferrer">
            {t("voucher.cta")}
          </a>
        </div>

        <a
          className="voucher-art"
          href={giftVoucherHref}
          target="_blank"
          rel="noreferrer"
          aria-label={t("voucher.alt")}
        >
          <Image
            className="voucher-image"
            src="/images/gift-voucher.jpg"
            alt={t("voucher.alt")}
            fill
            sizes="(max-width: 767px) 92vw, 48vw"
          />
        </a>
      </section>

      <section className="visit-section" id="kontakt" aria-labelledby="visit-title">
        <span className="visit-accent visit-accent--left" aria-hidden="true">///</span>
        <span className="visit-accent visit-accent--right" aria-hidden="true">///</span>
        <div className="visit-content">
          <h2 id="visit-title">{t("visit.title")}</h2>
          <p className="visit-description">{t("visit.description")}</p>
          <div className="visit-actions">
            <a className="hero-button hero-button-primary" href={"/" + locale + "/reservierung"}>
              {t("visit.reserve")}
            </a>
            <a
              className="hero-button hero-button-secondary"
              href="https://maps.app.goo.gl/o1ea7zNGKqw8NxTN7?g_st=ic"
              target="_blank"
              rel="noreferrer"
            >
              {t("visit.directions")}
            </a>
          </div>
          <div className="visit-details">
            <p><strong>{t("visit.location")}</strong></p>
            <p>{t("visit.address")}<br />{t("visit.city")}</p>
            <p>{t("visit.hours")}<br />{t("visit.closed")}</p>
            <p><a href="tel:+4945170323040">{t("visit.phone")}</a></p>
          </div>
        </div>
      </section>


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
            <a href="https://www.restablo.de/restaurant/leos-juice-burger-luebeck-kuecknitz.html" target="_blank" rel="noreferrer">{t("footer.order")}</a>
            <a href={giftVoucherHref} target="_blank" rel="noreferrer">{t("footer.voucher")}</a>
          </nav>

          <div className="site-footer-contact">
            <p>{t("footer.contact")}</p>
            <a href="https://maps.app.goo.gl/o1ea7zNGKqw8NxTN7?g_st=ic" target="_blank" rel="noreferrer">
              {t("footer.address")}<br />{t("footer.city")}
            </a>
            <a href="tel:+4945170323040">{t("footer.phone")}</a>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>© 2026 {t("footer.brand")}</span>
          <div className="site-footer-legal">
            <a href="#footer">{t("footer.imprint")}</a>
            <a href="#footer">{t("footer.privacy")}</a>
          </div>
        </div>
      </footer>

    </main>
  );
}

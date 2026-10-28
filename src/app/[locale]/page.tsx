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
  const giftVoucherHref = process.env.NEXT_PUBLIC_GIFT_VOUCHER_URL || "#gutscheine";

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
                <a className="hero-button hero-button-secondary" href="#speisekarte">
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
          <p className="favorites-kicker">{t("favorites.kicker")}</p>
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

        <a className="hero-button hero-button-primary favorites-cta" href="#speisekarte">
          {t("favorites.cta")}
        </a>
      </section>

      <section className="voucher-section" id="gutscheine" aria-labelledby="voucher-title">
        <div className="voucher-copy">
          <p className="voucher-kicker">{t("voucher.kicker")}</p>
          <h2 id="voucher-title">{t("voucher.title")}</h2>
          <p>{t("voucher.description")}</p>
          <a className="hero-button voucher-cta" href={giftVoucherHref}>
            {t("voucher.cta")}
          </a>
        </div>

        <div className="voucher-art" aria-label={t("voucher.alt")} role="img">
          <div className="voucher-card">
            <Image
              className="voucher-logo"
              src="/images/leo-logo.png"
              alt=""
              width={800}
              height={800}
            />
            <span className="voucher-card-title">{t("voucher.cardTitle")}</span>
            <span className="voucher-card-subtitle">{t("voucher.cardSubtitle")}</span>
            <span className="voucher-card-line" />
            <span className="voucher-card-note">{t("voucher.cardNote")}</span>
          </div>
          <span className="voucher-spark voucher-spark--one" aria-hidden="true">✦</span>
          <span className="voucher-spark voucher-spark--two" aria-hidden="true">✦</span>
        </div>
      </section>
    </main>
  );
}

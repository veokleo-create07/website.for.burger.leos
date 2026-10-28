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
    </main>
  );
}

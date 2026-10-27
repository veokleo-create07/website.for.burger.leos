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
          <div className="hero-copy">
            <h1 className="hero-title" id="hero-title">
              <span className="hero-title-line hero-title-line--first">
                <span className="hero-word hero-word--first">{t("headline.first")}</span>
              </span>
              <span className="hero-title-line hero-title-line--second hero-title-accent">
                <span className="hero-word hero-word--second">{t("headline.second")}</span>{" "}
                <span className="hero-word hero-word--third hero-title-last">{t("headline.third")}</span>
              </span>
            </h1>
          </div>

          <div className="hero-burger" aria-hidden="true">
            <span className="hero-burger-shadow" />
            <Image
              src="/images/burger-cutout.png"
              alt=""
              fill
              priority
              sizes="(max-width: 767px) 82vw, 74vw"
            />
          </div>
          <span className="hero-doodle hero-doodle--orange" aria-hidden="true" />
          <span className="hero-doodle hero-doodle--olive" aria-hidden="true" />

          <div className="hero-bottom">
            <p className="hero-description">{t("description")}</p>
            <div className="hero-actions">
              <a className="hero-button hero-button-primary" href="#reservierung">
                {t("reserve")}
              </a>
              <a className="hero-button hero-button-secondary" href="#speisekarte">
                {t("viewMenu")}
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

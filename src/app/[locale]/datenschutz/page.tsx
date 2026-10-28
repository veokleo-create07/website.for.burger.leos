import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";

type PrivacySection = { title: string; paragraphs: string[] };

export default async function PrivacyPage({ params }: PageProps<"/[locale]/datenschutz">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const home = await getTranslations({ locale, namespace: "HomePage" });
  const privacy = await getTranslations({ locale, namespace: "PrivacyPolicy" });
  const sections = privacy.raw("sections") as PrivacySection[];

  return (
    <main className="site-shell legal-page">
      <SiteHeader
        locale={locale}
        bookingHref={`/${locale}/reservierung`}
        labels={{
          home: home("navigation.home"), menu: home("navigation.menu"), gallery: home("navigation.gallery"), contact: home("navigation.contact"),
          location: home("location"), booking: home("reserve"), menuButton: home("navigation.openMenu"), language: home("navigation.language"),
          mainNavigation: home("navigation.mainNavigation"), mobileNavigation: home("navigation.mobileNavigation"), voucher: home("footer.voucher"),
        }}
      />
      <article className="legal-content privacy-content">
        <h1>{privacy("title")}</h1>
        <p className="privacy-intro">{privacy("intro")}</p>
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph.split("\\n").map((line, lineIndex) => <span key={lineIndex}>{line}{lineIndex < paragraph.split("\\n").length - 1 ? <br /> : null}</span>)}</p>
            ))}
          </section>
        ))}
      </article>
      <footer className="site-footer legal-footer">
        <div className="site-footer-bottom">
          <span>© 2026 Leo’s Juice &amp; Burger</span>
          <div className="site-footer-legal">
            <a href={`/${locale}`}>{home("footer.home")}</a>
            <a href={`/${locale}/impressum`}>{home("footer.imprint")}</a>
            <a href={`/${locale}/datenschutz`} aria-current="page">{home("footer.privacy")}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

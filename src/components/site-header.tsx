import Image from "next/image";
import { LanguageSwitcher } from "@/components/language-switcher";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

type Props = {
  locale: Locale;
  labels: {
    home: string;
    menu: string;
    gallery: string;
    contact: string;
    location: string;
    booking: string;
    menuButton: string;
    language: string;
    mainNavigation: string;
    mobileNavigation: string;
  };
  bookingHref?: string;
};

export function SiteHeader({ locale, labels, bookingHref }: Props) {
  const links = [
    { label: labels.home, href: `/${locale}`, current: true },
    { label: labels.menu, href: `/${locale}#speisekarte` },
    { label: labels.gallery, href: `/${locale}#galerie` },
    { label: labels.contact, href: `/${locale}#kontakt` },
  ];

  return (
    <header className="site-header">
      <a className="brand-link" href={`/${locale}`} aria-label="Leo’s Juice & Burger">
        <Image
          className="brand-logo"
          src="/images/leo-logo.png"
          alt=""
          width={800}
          height={800}
          priority
        />
      </a>

      <nav className="desktop-nav" aria-label={labels.mainNavigation}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={link.current ? "site-link site-link-active" : "site-link"}
            aria-current={link.current ? "page" : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="header-tools">
        <a
          className="location-link"
          href="https://maps.app.goo.gl/o1ea7zNGKqw8NxTN7?g_st=ic"
          target="_blank"
          rel="noreferrer"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 18s6-5.6 6-10a6 6 0 1 0-12 0c0 4.4 6 10 6 10Z" />
            <circle cx="10" cy="8" r="2" />
          </svg>
          <span>{labels.location}</span>
        </a>
        <span className="header-divider" aria-hidden="true" />
        <LanguageSwitcher locale={locale} label={labels.language} />
        <a className="header-booking" href={bookingHref ?? "#reservierung"}>
          {labels.booking}
        </a>
        <details className="mobile-menu">
          <summary aria-label={labels.menuButton}>
            <span />
            <span />
            <span />
          </summary>
          <nav className="mobile-menu-links" aria-label={labels.mobileNavigation}>
            {links.map((link) => (
              <a key={link.label} href={link.href} aria-current={link.current ? "page" : undefined}>
                {link.label}
              </a>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}

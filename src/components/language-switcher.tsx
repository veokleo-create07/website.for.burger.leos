import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  return (
    <nav aria-label={label} className="language-switcher">
      <Link href="/" locale="de" lang="de" aria-current={locale === "de" ? "page" : undefined}>
        De
      </Link>
      <Link href="/" locale="en" lang="en" aria-current={locale === "en" ? "page" : undefined}>
        En
      </Link>
    </nav>
  );
}

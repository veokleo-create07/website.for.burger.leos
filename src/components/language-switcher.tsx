import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <div aria-label="Language" className="flex gap-2">
      <Link href="/" locale="de" aria-current={locale === "de" ? "page" : undefined}>
        DE
      </Link>
      <Link href="/" locale="en" aria-current={locale === "en" ? "page" : undefined}>
        EN
      </Link>
    </div>
  );
}

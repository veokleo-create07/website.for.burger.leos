import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { routing } from "@/i18n/routing";

export default async function LocalePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <main>
      <LanguageSwitcher locale={locale} />
    </main>
  );
}

import { useEffect } from "react";
import { useLocale, type Lang } from "@/lib/i18n";
import { LandingPage } from "@/routes/index";

export function LandingLocale({ lang }: { lang: Lang }) {
  const { lang: current, setLang } = useLocale();
  useEffect(() => {
    if (current !== lang) setLang(lang);
  }, [current, lang, setLang]);
  return <LandingPage />;
}

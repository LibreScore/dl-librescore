import i18n from "i18next";
import ar from "./ar.json";
import cs from "./cs.json";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import hu from "./hu.json";
import id from "./id.json";
import it from "./it.json";
import ja from "./ja.json";
import ko from "./ko.json";
import ms from "./ms.json";
import nl from "./nl.json";
import pl from "./pl.json";
import pt from "./pt.json";
import ru from "./ru.json";
import tr from "./tr.json";
import zh_Hans from "./zh-Hans.json";
import zh_Hant from "./zh_Hant.json";

function getLocale(): string {
  let languageMap = [
    "ar",
    "cs",
    "de",
    "en",
    "es",
    "fr",
    "hu",
    "id",
    "it",
    "ja",
    "ko",
    "ms",
    "nl",
    "pl",
    "pt",
    "ru",
    "tr",
    "zh-Hans",
    "zh_Hant",
  ];

  let locale: string = "en";
  if (typeof window !== "undefined") {
    let localeOrder = navigator.languages?.concat(
      Intl.DateTimeFormat().resolvedOptions().locale,
    ) ?? ["en"];
    let localeArray = Object.values(languageMap).map((arr) => arr[0]);

    localeOrder.some((localeItem) => {
      if (localeArray.includes(localeItem)) {
        locale = localeItem;
        return true;
      } else if (localeArray.includes(localeItem.substring(0, 2))) {
        locale = localeItem.substring(0, 2);
        return true;
      } else if (
        localeArray.some((locale) =>
          locale.startsWith(localeItem.substring(0, 2)),
        )
      ) {
        locale = localeArray.find((locale) =>
          locale.startsWith(localeItem.substring(0, 2)),
        )!;
        return true;
      }
    });
    if (locale === "en") {
      if (
        [
          "ab",
          "be",
          "et",
          "hy",
          "kk",
          "ky",
          "lv",
          "os",
          "ro-MD",
          "ru",
          "tg",
          "tk",
          "uk",
          "uz",
        ].some((e) => localeOrder[0].startsWith(e)) &&
        localeArray.includes("ru")
      ) {
        locale = "ru";
      } else {
        locale = "en";
      }
    }
  }
  return locale;
}

export default i18n.init({
  compatibilityJSON: "v3",
  lng: getLocale(),
  fallbackLng: "en",
  resources: {
    ar: { translation: ar },
    cs: { translation: cs },
    de: { translation: de },
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    hu: { translation: hu },
    id: { translation: id },
    it: { translation: it },
    ja: { translation: ja },
    ko: { translation: ko },
    ms: { translation: ms },
    nl: { translation: nl },
    pl: { translation: pl },
    pt: { translation: pt },
    ru: { translation: ru },
    tr: { translation: tr },
    "zh-Hans": { translation: zh_Hans },
    zh_Hant: { translation: zh_Hant },
  },
  interpolation: {
    // Fix output path `path/to/file` being displayed as `path&#x2F;to&#x2F;file` in cli (verbose mode)
    escapeValue: false,
  },
});

export const i18next = i18n;

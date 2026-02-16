import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

const LANG_KEY = "lang";

export const useLanguage = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        Cookies.set(LANG_KEY, lang);
    };

    return {
        language: i18n.language as "en" | "uk",
        changeLanguage,
    };
};

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const KEY = "theme";

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(() =>
        localStorage.getItem(KEY) === "dark" ? "dark" : "light"
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(KEY, theme);
    }, [theme]);

    const toggleTheme = () =>
        setTheme((prev) => (prev === "light" ? "dark" : "light"));

    return { theme, setTheme, toggleTheme };
};

import { useCallback } from "react";

export type Theme = "light" | "dark";

const DURATION = 500;

export const useThemeReveal = (
    theme: Theme,
    setTheme: (t: Theme) => void
) => {
    return useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            if (document.querySelector(".theme-reveal")) return;

            const { clientX: x, clientY: y } = event;

            const r = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            const bg = getComputedStyle(document.documentElement)
                .getPropertyValue("--color-bg")
                .trim();

            const overlay = document.createElement("div");
            overlay.className = "theme-reveal";
            overlay.style.setProperty("--x", `${x}px`);
            overlay.style.setProperty("--y", `${y}px`);
            overlay.style.setProperty("--r", `${r}px`);
            overlay.style.setProperty("--reveal-color", bg);

            document.body.appendChild(overlay);

            // 🔁 примусовий cleanup (останній запобіжник)
            const killSwitch = window.setTimeout(() => {
                overlay.remove();
            }, DURATION * 3);

            // ⏭ frame 1 → старт
            requestAnimationFrame(() => {
                overlay.classList.add("expand");

                // ⏭ frame 2 → після expand
                window.setTimeout(() => {
                    setTheme(theme === "light" ? "dark" : "light");

                    requestAnimationFrame(() => {
                        overlay.classList.remove("expand");
                        overlay.classList.add("collapse");
                    });
                }, DURATION);
            });

            // м’який cleanup
            overlay.addEventListener(
                "transitionend",
                () => {
                    clearTimeout(killSwitch);
                    overlay.remove();
                },
                { once: true }
            );
        },
        [theme, setTheme]
    );
};

import {render, screen} from "@testing-library/react";
import {AppFooter} from "../../../components/main/AppFooter";
import {MemoryRouter} from "react-router-dom";
import {describe, expect, it, vi} from "vitest";
import Cookies from "js-cookie";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("js-cookie", () => ({
    default: {
        get: vi.fn(),
    },
}));

const renderFooter = () => {
    return render(
        <MemoryRouter>
            <AppFooter />
        </MemoryRouter>
    );
};

const setMockState = (role: string | undefined, userId: string | undefined) => {
    (Cookies.get as any).mockImplementation((key: string) => {
        if (key === "role") return role;
        if (key === "userId") return userId;
        return undefined;
    });
};

describe("AppFooter", () => {
    it("відображає базову інформацію: лого та контакти", () => {
        renderFooter();
        expect(screen.getByAltText("Star for Life")).toBeInTheDocument();
        expect(screen.getByText("team@starforlife.org.ua")).toBeInTheDocument();
    });

    it("відображає посилання на соцмережі", () => {
        renderFooter();
        const links = screen.getAllByRole("link");
        const hasInstagram = links.some(l => l.getAttribute("href")?.includes("instagram"));
        const hasFacebook = links.some(l => l.getAttribute("href")?.includes("facebook"));

        expect(hasInstagram).toBe(true);
        expect(hasFacebook).toBe(true);
    });

    it("відображає посилання на кабінет журі, якщо роль JURY", () => {
        (Cookies.get as any).mockImplementation((key: string) => {
            if (key === "userId") return "123";
            if (key === "role") return "JURY";
        });

        renderFooter();

        const juryLink = screen.getByRole("link", { name: /header.mySubmissions/i });
        expect(juryLink).toBeInTheDocument();
        expect(juryLink).toHaveAttribute("href", "/jury/submissions");
    });

    it("відображає копірайт з поточним роком", () => {
        renderFooter();
        expect(screen.getByText(/2026/)).toBeInTheDocument();
    });

    it("відображає адмінську версію турнірів та адмін-панель", () => {
        setMockState("ADMIN", "123");
        renderFooter();

        expect(screen.getByText("header.manageTournaments")).toBeInTheDocument();

        expect(screen.getByRole("link", { name: /header.adminPanel/i })).toBeInTheDocument();
    });

    it("відображає користувацьку версію турнірів (logged in)", () => {
        setMockState("USER", "123");
        renderFooter();

        expect(screen.getByText("header.myCurrentTournaments")).toBeInTheDocument();
        expect(screen.getByText("header.myTeam")).toBeInTheDocument();
    });

    it("відображає кнопку логіну для неавторизованого користувача", () => {
        setMockState("USER", undefined);
        renderFooter();


        expect(screen.getByText("header.login")).toBeInTheDocument();
    });
});
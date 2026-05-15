import {render, screen, within} from "@testing-library/react";
import {AppHeader} from "../../../components/main/AppHeader";
import {MemoryRouter} from "react-router-dom";
import {beforeEach, describe, expect, it, vi} from "vitest";
import Cookies from "js-cookie";
import AuthService from "../../../services/auth/AuthService";
import userEvent from "@testing-library/user-event";

const mockChangeLanguage = vi.fn();

// --- Mocks ---
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "uk", changeLanguage: mockChangeLanguage },
    }),
}));

vi.mock("js-cookie", () => ({
    default: { get: vi.fn(), remove: vi.fn(), set: vi.fn() },
}));

vi.mock("../../i18n/useLanguage.ts", () => ({
    useLanguage: () => ({
        language: "uk",
        changeLanguage: mockChangeLanguage,
    }),
}));

vi.mock('../../../context/NotificationContext.tsx', () => ({
    useNotification: () => ({ unseenCount: 5 }),
}));

const renderHeader = () => render(<MemoryRouter><AppHeader /></MemoryRouter>);

const setAuthState = (role?: string, userId?: string) => {
    (Cookies.get as any).mockImplementation((key: string) => {
        if (key === "userId") return userId;
        if (key === "role") return role;
        return undefined;
    });
};

describe("AppHeader", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockChangeLanguage.mockClear();
        vi.spyOn(AuthService, 'logout').mockImplementation(() => Promise.resolve());

        (Cookies.get as any).mockImplementation(() => undefined);
    });

    it("відображає кнопку входу для неавторизованого користувача", () => {
        setAuthState(undefined, undefined);
        renderHeader();
        expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    });

    it("відображає аватар та сповіщення для авторизованого користувача", async () => {
        setAuthState("USER", "123");
        renderHeader();

        const notificationIcons = screen.getAllByTestId("NotificationsIcon");
        expect(notificationIcons.length).toBeGreaterThan(0);
        expect(notificationIcons[0]).toBeInTheDocument();

        const badges = await screen.findAllByText("5");
        expect(badges.length).toBeGreaterThan(0);
        expect(badges[0]).toBeInTheDocument();
    });

    it("відображає панель адміністратора тільки для ролі ADMIN", () => {
        setAuthState("ADMIN", "123");
        renderHeader();

        const adminLink = screen.getByRole("link", { name: /header.adminPanel/i });
        expect(adminLink).toHaveAttribute("href", "/admin/jury/managment");
    });

    it("відображає 'Мої роботи' для ролі JURY", () => {
        setAuthState("JURY", "123");
        renderHeader();

        const juryLink = screen.getByRole("link", { name: /header.mySubmissions/i });
        expect(juryLink).toHaveAttribute("href", "/jury/submissions");
    });

    it("відкриває меню мов та змінює мову", async () => {
        const user = userEvent.setup();
        renderHeader();

        await user.click(screen.getByText("UK"));

        const ukrItem = await screen.findByRole("menuitem", { name: /🇺🇦 УКР/i });
        expect(ukrItem).toBeInTheDocument();

        await user.click(screen.getByRole("menuitem", { name: /🇺🇸 ENG/i }));

        expect(mockChangeLanguage).toHaveBeenCalledWith("en");
    });

    it("змінює мову на УКР", async () => {
        const user = userEvent.setup();
        renderHeader();

        await user.click(screen.getByText("UK"));
        const ukrItem = await screen.findByRole("menuitem", { name: /🇺🇦 УКР/i });
        await user.click(ukrItem);

        expect(mockChangeLanguage).toHaveBeenCalledWith("uk");
    });

    it("відкриває меню турнірів та переходить за посиланням", async () => {
        const user = userEvent.setup();
        setAuthState("ADMIN", "123");
        renderHeader();

        const tournamentButton = screen.getByRole("button", { name: /header.tournaments/i });
        await user.click(tournamentButton);

        const menuItem = await screen.findByRole("menuitem", { name: /header.manageTournaments/i });
        await user.click(menuItem);
    });

    it("відкриває мобільний drawer та відображає пункти меню", async () => {
        const user = userEvent.setup();
        setAuthState("USER", "123");
        renderHeader();

        const burgerButton = screen.getByLabelText(/open drawer/i);
        await user.click(burgerButton);

        const drawer = screen.getByRole("presentation");

        const tournamentItem = within(drawer).getByText(/header.tournaments/i);

        expect(tournamentItem).toBeInTheDocument();
    });

    it("відкриває меню профілю та натискає вихід", async () => {
        const user = userEvent.setup();
        setAuthState("USER", "123");

        renderHeader();

        await user.click(screen.getByRole("button", { name: /profile-menu/i }));
        const logoutButton = screen.getByRole("menuitem", { name: /header.logout/i });

        await user.click(logoutButton);
        expect(AuthService.logout).toHaveBeenCalled();
    });
});
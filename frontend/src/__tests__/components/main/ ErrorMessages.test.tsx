import {render, screen} from "@testing-library/react";
import {ErrorMessages} from "../../../components/main/ErrorMessages";
import {describe, expect, it, vi} from "vitest";

// Changed jest.mock to vi.mock
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("ErrorMessages", () => {
    it("не рендерить нічого якщо errors порожній", () => {
        const { container } = render(<ErrorMessages errors={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it("рендерить список помилок", () => {
        const errors = ["Error 1", "Error 2"];

        render(<ErrorMessages errors={errors} />);

        // заголовок
        expect(screen.getByText("common.errors")).toBeInTheDocument();

        // самі помилки
        errors.forEach((error) => {
            expect(screen.getByText(error)).toBeInTheDocument();
        });
    });

    it("рендерить правильну кількість елементів списку", () => {
        const errors = ["A", "B", "C"];

        render(<ErrorMessages errors={errors} />);

        const items = screen.getAllByRole("listitem");
        expect(items).toHaveLength(errors.length);
    });
});
import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    define: {
        global: "window",
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./src/setupTests.ts",

        // 👇 ADD THIS
        coverage: {
            reporter: ["text", "html"],
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                "src/main.tsx",
                "src/vite-env.d.ts",
                "src/entities/**/*",
                "src/services/**/*",
                "src/themes/*",
                "src/security/*",
                "src/App.tsx",
                "src/locales/*",
                "src/i18n/index.ts",
            ],
        },
    },
    server: {
        allowedHosts: ['frontend', 'localhost']
    },
});

import { defineConfig } from "vitest/config";
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
            all: true, // 🔥 include ALL files, even without tests
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                "src/main.tsx",
                "src/vite-env.d.ts",
            ],
        },
    },
    server: {
        allowedHosts: ['frontend', 'localhost']
    },
});

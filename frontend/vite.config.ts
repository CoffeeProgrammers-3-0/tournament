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
    },
    server: {
        allowedHosts: [
            'frontend',
            'localhost'
        ]
    },
});
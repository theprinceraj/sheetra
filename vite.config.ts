import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
    plugins: [
        tsConfigPaths({
            projects: ["./tsconfig.json"],
        }),
        tailwindcss(),
        tanstackStart({
            spa: {
                enabled: true,
            },
        }),
        nitro({ preset: "vercel" }),
        // react's vite plugin must come after start's vite plugin
        viteReact(),
    ],
});

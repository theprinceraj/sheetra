/// <reference types="vite/client" />
import type { ReactNode } from "react";
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "Sheetra - Convert GSTR to Excel Easily",
            },
        ],
        links: [{ rel: "stylesheet", href: appCss }],
        scripts: [{ src: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/+esm", type: "module" }],
    }),
    component: RootComponent,
    notFoundComponent(props) {
        return <div>NotFound</div>;
    },
});

function RootComponent() {
    return (
        <RootDocument>
            <Outlet />
        </RootDocument>
    );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <div className="bg-gray-700 w-screen h-screen">{children}</div>
                <Scripts />
            </body>
        </html>
    );
}

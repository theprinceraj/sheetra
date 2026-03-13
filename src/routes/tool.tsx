// src/routes/tool.tsx
import { Outlet, createFileRoute } from "@tanstack/react-router";

function ToolLayoutComponent() {
    return (
        <div className="max-h-screen h-screen lg:flex lg:flex-col lg:items-center lg:justify-start">
            <header className="navbar bg-neutral backdrop-blur-xl shadow-sm">
                <div className="navbar-start w-1/3">
                    <a href="/" className="p-4 mx-1 lg:mx-4 bg-transparent md:text-xl font-bold">SHEETRA</a>
                </div>
                <div className="navbar-end w-2/3">
                    <h1 className="text-sm font-semibold md:text-xl">GSTR1 to Excel Converter</h1>
                </div>
            </header>
            <div className="w-full">
                <Outlet />
            </div>
        </div>
    );
}

export const Route = createFileRoute("/tool")({
    component: ToolLayoutComponent,
});

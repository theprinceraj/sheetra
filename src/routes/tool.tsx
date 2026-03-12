// src/routes/tool.tsx
import { Outlet, createFileRoute } from "@tanstack/react-router";

function ToolLayoutComponent() {
    return (
        <div className="min-h-screen md:px-30 lg:px-80 lg:flex lg:flex-col lg:items-center lg:justify-center">
            <header className="py-4 bg-amber-100 rounded-lg inset-shadow-sm w-full text-center">
                <h1 className="text-3xl font-bold">Tool Page</h1>
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

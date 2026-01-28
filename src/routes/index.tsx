import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    const router = useRouter();
    const state = Route.useLoaderData();

    return (
        <div className="bg-gray-700 w-screen h-screen flex justify-center items-center">
            <button
                className="text-2xl text-white bg-amber-700 px-4 py-2 rounded-2xl shadow outline-white outline-2 hover:bg-amber-800 transition hover:cursor-pointer"
                onClick={() => router.navigate({ to: "/tool" })}>
                Goto Tool
            </button>
        </div>
    );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pipeline } from "../../lib/pipeline";

export const Route = createFileRoute("/tool/")({
    component: RouteComponent,
});

function RouteComponent() {
    const [pipeline] = useState(new Pipeline([], []));

    const handleUploadClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        await pipeline.processFile(file);
    };

    return (
        <>
            <div className="p-4">
                <div className="block bg-amber-100 p-4 rounded-lg inset-shadow-sm w-full text-center">
                    <h1 className="text-3xl font-bold">Tool Page</h1>
                </div>
                <div className="mt-4 bg-amber-50 p-4 rounded-lg inset-shadow-sm flex justify-center items-center">
                    <label
                        htmlFor="gstr1-file"
                        className="font-bold bg-amber-500 px-4 py-2 rounded-lg inset-shadow-amber-50 transition hover:text-white hover:bg-amber-700 hover:cursor-pointer">
                        Upload GSTR1 File
                    </label>
                    <input
                        id="gstr1-file"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleUploadClick}
                    />
                </div>
                <div className="mt-4 bg-amber-50 p-4 rounded-lg inset-shadow-sm flex flex-col justify-center items-center">
                    <h2 className="text-2xl font-bold">Result</h2>

                    <div
                        id="result-container"
                        className="mt-2 p-2 border border-amber-200 rounded-lg bg-white w-full h-64 overflow-auto">
                        {/* Result content will be populated here */}
                    </div>

                    <div
                        id="images-container"
                        className="mt-2 p-2 border border-amber-200 rounded-lg bg-white w-full h-64 overflow-auto">
                        {/* Rendered images will be displayed here */}
                    </div>
                </div>
            </div>
        </>
    );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pipeline } from "../../lib/pipeline";
import { PipelineOutput } from "../../types";

function RouteComponent() {
    const [pipeline, setPipeline] = useState<Pipeline | null>(null);
    const [pipelineOutput, setPipelineOutput] = useState<PipelineOutput | null>(null);
    const [downloadHref, setDownloadHref] = useState<string>("");
    const [isPreparing, setIsPreparing] = useState<boolean>(true);

    useEffect(() => {
        const init = async () => {
            try {
                const instance = await Pipeline.create("new");
                setPipeline(instance);
            } catch (err) {
                console.error("Pipeline Init Error:", err);
            } finally {
                setIsPreparing(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        return () => {
            if (downloadHref) URL.revokeObjectURL(downloadHref);
        };
    }, [downloadHref]);

    const handleUploadClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !pipeline) return;

        setDownloadHref("");

        const output = await pipeline.processFile(file);
        setPipelineOutput(output);

        if (output.excelBuffer) {
            const blob = new Blob([new Uint8Array(output.excelBuffer)], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const href = URL.createObjectURL(blob);
            setDownloadHref(href);
        }
    };

    if (isPreparing) {
        return <div className="p-4 text-white text-center">Loading Workbook Template...</div>;
    }

    return (
        <>
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
                {downloadHref && (
                    <a
                        href={downloadHref}
                        download="processed-report.xlsx"
                        className="ml-4 font-bold bg-amber-500 px-4 py-2 rounded-lg inset-shadow-amber-50 transition hover:text-white hover:bg-amber-700 hover:cursor-pointer">
                        Download
                    </a>
                )}
            </div>
            <div className="mt-4 bg-amber-50 p-4 rounded-lg inset-shadow-sm flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold">Result</h2>

                <div
                    id="result-container"
                    className="mt-2 p-2 border border-amber-200 rounded-lg bg-white w-full h-64 overflow-auto">
                    {/* Result content will be populated here */}
                    {pipelineOutput && <pre>{JSON.stringify(pipelineOutput, null, 2)}</pre>}
                </div>

                <div
                    id="images-container"
                    className="mt-2 p-2 border border-amber-200 rounded-lg bg-white w-full h-64 overflow-auto">
                    {/* Rendered images will be displayed here */}
                </div>
            </div>
        </>
    );
}

export const Route = createFileRoute("/tool/")({
    component: RouteComponent,
});

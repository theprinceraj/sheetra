import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Pipeline } from "../../lib/pipeline";
import { PipelineOutput } from "../../types";

function RouteComponent() {
    const pipelineRef = useRef<Pipeline | null>(null);
    const [pipelineOutput, setPipelineOutput] = useState<PipelineOutput | null>(null);
    const [downloadHref, setDownloadHref] = useState<string>("");
    const [isPreparing, setIsPreparing] = useState<boolean>(false);
    const [initError, setInitError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [processError, setProcessError] = useState<string | null>(null);

    useEffect(() => {
        if (!pipelineRef.current) {
            pipelineRef.current = new Pipeline("new");
        }
        return () => {
            if (downloadHref) URL.revokeObjectURL(downloadHref);
            // Cleanup workers when component unmounts
            if (pipelineRef.current) {
                pipelineRef.current.terminate();
                pipelineRef.current = null;
            }
        };
    }, [downloadHref]);

    const handleUploadClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !pipelineRef.current) return;

        setDownloadHref("");
        setIsProcessing(true);
        setProcessError(null);

        try {
            const output = await pipelineRef.current.processFile(file);
            setPipelineOutput(output);

            if (output.excelBuffer) {
                const blob = new Blob([new Uint8Array(output.excelBuffer)], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                const href = URL.createObjectURL(blob);
                setDownloadHref(href);
            }
        } catch (e) {
            console.error("Processing Error:", e);
            setProcessError("Failed to process file. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isPreparing) {
        return <div className="p-4 text-white text-center">Loading Workbook Template...</div>;
    }

    if (initError) {
        return <div className="p-4 text-white text-center bg-red-500">{initError}</div>;
    }

    return (
        <>
            {processError && (
                <div className="mt-4 p-4 bg-red-500 text-white rounded-lg text-center font-semibold">
                    {processError}
                </div>
            )}
            <div className="flex flex-col-reverse lg:flex-col">
                <div className="flex justify-center items-center gap-4">
                    <label
                        htmlFor="gstr1-file"
                        className={`btn bg-primary ${isProcessing ? "opacity-90 cursor-not-allowed" : ""}`}>
                        Upload GSTR1 File
                    </label>
                    <input
                        id="gstr1-file"
                        type="file"
                        accept="application/pdf"
                        className="btn hidden"
                        onChange={handleUploadClick}
                        disabled={isProcessing}
                    />
                    {isProcessing && (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                            <span className="font-semibold text-base-content">Processing...</span>
                        </div>
                    )}
                    {downloadHref && (
                        <a href={downloadHref} download="processed-report.xlsx" className="btn bg-accent">
                            Download
                        </a>
                    )}
                </div>
                <div className="p-4 flex flex-col justify-center items-center gap-2 [&>div]:rounded-lg [&>div]:bg-white [&>div]:w-full">
                    <h2 className="text-2xl font-bold text-base-content">Result</h2>
                    <div id="result-container" className="hidden p-2 h-32 text-base-300 overflow-auto">
                        {/* Result content will be populated here */}
                        {pipelineOutput && (
                            <pre>
                                {JSON.stringify({ ...pipelineOutput, excelBuffer: "[Valid Excel Buffer]" }, null, 2)}
                            </pre>
                        )}
                    </div>

                    <div id="images-container" className="p-2 min-h-92 md:min-h-[73vh] text-base-300 overflow-auto">
                        {/* Rendered images will be displayed here */}
                    </div>
                </div>
            </div>
        </>
    );
}

export const Route = createFileRoute("/tool/")({
    component: RouteComponent,
});

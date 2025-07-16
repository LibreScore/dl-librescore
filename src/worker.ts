/// <reference lib="webworker" />

import isNodeJs from "detect-node";
import PDFDocument from "pdfkit/lib/document";
import SVGtoPDF from "svg-to-pdfkit";

type ImgType = "svg" | "png";

type DataResultType = "dataUrl" | "text";

const readData = (
    data: Blob | Buffer,
    type: DataResultType
): string | Promise<string> => {
    if (!(data instanceof Uint8Array)) {
        // blob
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (): void => {
                const result = reader.result;
                resolve(result as string);
            };
            reader.onerror = reject;
            if (type === "dataUrl") {
                reader.readAsDataURL(data);
            } else {
                reader.readAsText(data);
            }
        });
    } else {
        // buffer
        if (type === "dataUrl") {
            return "data:image/png;base64," + data.toString("base64");
        } else {
            return data.toString("utf-8");
        }
    }
};

/**
 * @platform browser
 */
const fetchBlob = async (imgUrl: string): Promise<Blob> => {
    const r = await fetch(imgUrl, {
        cache: "no-cache",
    });
    return r.blob();
};

/**
 * @example
 * import { PDFWorker } from '../dist/cache/worker'
 * const { generatePDF } = PDFWorker()
 * const pdfData = await generatePDF(...)
 */
export const generatePDF = async (
    imgBlobs: Blob[] | Buffer[],
    imgType: ImgType,
    width: number,
    height: number
): Promise<ArrayBuffer> => {
    // @ts-ignore
    const pdf = new (PDFDocument as typeof import("pdfkit"))({
        // compress: true,
        size: [width, height],
        autoFirstPage: false,
        margin: 0,
        layout: "portrait",
    });

    if (imgType === "png") {
        const imgDataUrlList: string[] = await Promise.all(
            imgBlobs.map((b) => readData(b, "dataUrl"))
        );

        imgDataUrlList.forEach((data, idx) => {
            try {
                pdf.addPage();
                pdf.image(data, {
                    width,
                    height,
                });
            } except (err) {
                console.warn(`Skipping image #${idx} due to error: ${err.message}`);
            }
        });
    } else {
        // imgType == "svg"
        const svgList = await Promise.all(
            imgBlobs.map((b) => readData(b, "text"))
        );

        svgList.forEach((svg) => {
            pdf.addPage();
            SVGtoPDF(pdf, svg, 0, 0, {
                preserveAspectRatio: "none",
            });
        });
    }

    // @ts-ignore
    const buf: Uint8Array = await pdf.getBuffer();

    return buf.buffer;
};

export type PDFWorkerMessage = [string[], ImgType, number, number];

/**
 * @platform browser (web worker)
 */
if (typeof onmessage !== "undefined") {
    onmessage = async (e): Promise<void> => {
        const [imgUrls, imgType, width, height] = e.data as PDFWorkerMessage;
        let imgBlobs;

        if (isNodeJs) {
            imgBlobs = await Promise.all(imgUrls.map((url) => fetchBlob(url)));
        } else {
            let completedFetches = 0;

            const sendProgress = () => {
                const progress = Math.round(
                    83 + (completedFetches / imgUrls.length) * 17
                );
                postMessage({ type: "fetchProgress", progress });
            };

            imgBlobs = await Promise.all(
                imgUrls.map(async (url, i) => {
                    const blob = await fetchBlob(url);
                    completedFetches++;
                    sendProgress();
                    return blob;
                })
            );
        }
        const pdfBuf = await generatePDF(imgBlobs, imgType, width, height);

        postMessage(pdfBuf, [pdfBuf]);
    };
}

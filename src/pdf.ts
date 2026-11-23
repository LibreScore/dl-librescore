import isNodeJs from "detect-node";
import { PDFWorker } from "../dist/cache/worker";
import { PDFWorkerHelper } from "./worker-helper";
import { getFileUrl } from "./file";
import { ScoreInfo, SheetInfo, Dimensions } from "./scoreinfo";
import { fetchBuffer } from "./utils";

type _ExFn = (
    imgURLs: string[],
    imgType: "svg" | "png",
    dimensions: Dimensions,
    setText?: (str: string) => void
) => Promise<ArrayBuffer>;

const _exportPDFBrowser: _ExFn = async (
    imgURLs,
    imgType,
    dimensions,
    setText
) => {
    const worker = new PDFWorkerHelper();
    const pdfArrayBuffer = await worker.generatePDF(
        imgURLs,
        imgType,
        dimensions.width,
        dimensions.height,
        setText
    );
    worker.terminate();
    return pdfArrayBuffer;
};

const _exportPDFNode: _ExFn = async (imgURLs, imgType, dimensions) => {
    const imgBufs = await Promise.all(imgURLs.map((url) => fetchBuffer(url)));

    const { generatePDF } = PDFWorker();
    const pdfArrayBuffer = (await generatePDF(
        imgBufs,
        imgType,
        dimensions.width,
        dimensions.height
    )) as ArrayBuffer;

    return pdfArrayBuffer;
};

export const exportPDF = async (
    scoreinfo: ScoreInfo,
    sheet: SheetInfo,
    scoreUrl = "",
    setText: (str: string) => void
): Promise<ArrayBuffer> => {
    const imgType = sheet.imgType;
    const pageCount = sheet.pageCount;

    // Image URLs are obtained via the API, including the first page:
    // the static thumbnail URLs are no longer publicly accessible.
    const rs = Array.from({ length: pageCount }).map(async (_, i) => {
        return getFileUrl(
            scoreinfo.id,
            "img",
            scoreUrl,
            i,
            undefined,
            setText,
            pageCount
        );
    });
    const sheetImgURLs = await Promise.all(rs);

    let dimensions = sheet.dimensions;
    if (!isNodeJs && (!dimensions.width || !dimensions.height)) {
        // The DOM sheet image can fail to load, leaving its dimensions
        // degenerate (0x0). Measure from the actual first-page image.
        const blob = await fetch(sheetImgURLs[0], { cache: "no-cache" })
            .then((r) => r.blob());
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        await img.decode();
        URL.revokeObjectURL(img.src);
        dimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight,
        };
    }

    const args = [sheetImgURLs, imgType, dimensions] as const;
    if (!isNodeJs) {
        return _exportPDFBrowser(...args, setText);
    } else {
        return _exportPDFNode(...args);
    }
};

let pdfBlob: Blob;
export const downloadPDF = async (
    scoreinfo: ScoreInfo,
    sheet: SheetInfo,
    saveAs: typeof import("file-saver").saveAs,
    setText: (str: string) => void
): Promise<void> => {
    const name = scoreinfo.fileName;
    if (pdfBlob) {
        return saveAs(pdfBlob, `${name}.pdf`);
    }

    const pdfArrayBuffer = await exportPDF(scoreinfo, sheet, "", setText);
    setText("100%");

    pdfBlob = new Blob([pdfArrayBuffer]);
    saveAs(pdfBlob, `${name}.pdf`);
};

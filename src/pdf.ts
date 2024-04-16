import isNodeJs from "detect-node";
import { PDFWorker } from "../dist/cache/worker";
import { PDFWorkerHelper } from "./worker-helper";
import { getFileUrl } from "./file";
import { ScoreInfo, SheetInfo, Dimensions } from "./scoreinfo";
import { fetchBuffer } from "./utils";

type _ExFn = (
    imgURLs: string[],
    imgType: "svg" | "png",
    dimensions: Dimensions
) => Promise<ArrayBuffer>;

const _exportPDFBrowser: _ExFn = async (imgURLs, imgType, dimensions) => {
    const worker = new PDFWorkerHelper();
    const pdfArrayBuffer = await worker.generatePDF(
        imgURLs,
        imgType,
        dimensions.width,
        dimensions.height
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
    scoreUrl = ""
): Promise<ArrayBuffer> => {
    const imgType = sheet.imgType;
    const pageCount = sheet.pageCount;

    const rs = Array.from({ length: pageCount }).map((_, i) => {
        if (i === 0) {
            // The url to the first page is static. We don't need to use API to obtain it.
            return sheet.thumbnailUrl;
        } else {
            // obtain image urls using the API
            return getFileUrl(scoreinfo.id, "img", scoreUrl, i);
        }
    });
    const sheetImgURLs = await Promise.all(rs);

    const args = [sheetImgURLs, imgType, sheet.dimensions] as const;
    if (!isNodeJs) {
        return _exportPDFBrowser(...args);
    } else {
        return _exportPDFNode(...args);
    }
};

let pdfBlob: Blob;
export const downloadPDF = async (
    scoreinfo: ScoreInfo,
    sheet: SheetInfo,
    saveAs: typeof import("file-saver").saveAs
): Promise<void> => {
    const name = scoreinfo.fileName;
    if (pdfBlob) {
        return saveAs(pdfBlob, `${name}.pdf`);
    }

    const pdfArrayBuffer = await exportPDF(scoreinfo, sheet);

    pdfBlob = new Blob([pdfArrayBuffer]);
    saveAs(pdfBlob, `${name}.pdf`);
};

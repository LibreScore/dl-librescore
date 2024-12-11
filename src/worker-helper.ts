import { PDFWorkerMessage } from "./worker";
import { PDFWorker } from "../dist/cache/worker";

const scriptUrlFromFunction = (fn: () => any): string => {
    const blob = new Blob(["(" + fn.toString() + ")()"], {
        type: "application/javascript",
    });
    return window.URL.createObjectURL(blob);
};

// Node.js fix
if (typeof Worker === "undefined") {
    globalThis.Worker = class {} as any; // noop shim
}

export class PDFWorkerHelper extends Worker {
    constructor() {
        const url = scriptUrlFromFunction(PDFWorker);
        super(url);
    }

    generatePDF(
        imgURLs: string[],
        imgType: "svg" | "png",
        width: number,
        height: number,
        setText?: (str: string) => void
    ): Promise<ArrayBuffer> {
        const msg: PDFWorkerMessage = [imgURLs, imgType, width, height];
        this.postMessage(msg);

        return new Promise((resolve) => {
            if (setText) {
                const onProgress = (e: MessageEvent) => {
                    if (e.data.type === "fetchProgress") {
                        // Call the setText callback with the progress percentage
                        setText(`${e.data.progress}%`);
                    } else if (e.data instanceof ArrayBuffer) {
                        // If the data is the final PDF buffer, resolve the promise
                        resolve(e.data);

                        // Remove the event listener once we have resolved the promise
                        this.removeEventListener("message", onProgress);
                    }
                };
                this.addEventListener("message", onProgress);
            } else {
                this.addEventListener("message", (e) => {
                    resolve(e.data);
                });
            }
        });
    }
}

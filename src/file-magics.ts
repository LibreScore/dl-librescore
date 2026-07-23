import isNodeJs from "detect-node";
import { hookNative } from "./anti-detection";
import type { FileType } from "./file";

const TYPE_REG = /type=(img|mp3|midi)/;
// first page has different URL
const INIT_PAGE_REG = /(score_0\.png@0|score_0\.svg)/;
const INDEX_REG = /index=(\d+)/;

export const auths = {};

// Image URLs captured directly from the player's own jmuse API responses.
// The player always uses a valid token, so its responses give us the real
// S3 image URL (no token needed) for each page — bypassing MD5/token guessing
// entirely, which is what breaks (HTTP 422) when MuseScore rotates the scheme.
export const imgUrls: Record<number, string> = {};

(() => {
    if (isNodeJs) {
        // noop in CLI
        return () => Promise.resolve("");
    }

    try {
        const p = Object.getPrototypeOf(document.body);
        Object.setPrototypeOf(document.body, null);

        hookNative(document.body, "append", () => {
            return function (...nodes: Node[]) {
                p.append.call(this, ...nodes);

                if (nodes[0].nodeName === "IFRAME") {
                    const iframe = nodes[0] as HTMLIFrameElement;
                    const w = iframe.contentWindow as Window;

                    hookNative(w, "fetch", () => {
                        return function (url, init) {
                            let token = init?.headers?.Authorization;
                            let capturedType: string | undefined;
                            let capturedIndex: string | undefined;
                            if (
                                typeof url === "string" &&
                                (token || url.match(INIT_PAGE_REG))
                            ) {
                                let m = url.match(TYPE_REG);
                                let i = url.match(INDEX_REG);
                                if (m && i) {
                                    const type = m[1];
                                    const index = i[1];
                                    auths[type + index] = token;
                                    capturedType = type;
                                    capturedIndex = index;
                                } else if (url.match(INIT_PAGE_REG)) {
                                    auths["img0"] = url;
                                }
                            }

                            const res = fetch(url, init);

                            // For image API calls, read the player's own (valid)
                            // response and cache the real image URL. This lets us
                            // skip MD5/token guessing when building the PDF.
                            if (capturedType === "img" && capturedIndex) {
                                const idx = Number(capturedIndex);
                                res.then((r) => r.clone().json())
                                    .then((data) => {
                                        const u = data?.info?.url;
                                        if (typeof u === "string") {
                                            imgUrls[idx] = u;
                                        }
                                    })
                                    .catch(() => {
                                        /* ignore: falls back to token path */
                                    });
                            }

                            return res;
                        };
                    });
                }
            };
        });

        Object.setPrototypeOf(document.body, p);
    } catch (err) {
        console.error(err);
    }
})();

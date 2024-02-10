import isNodeJs from "detect-node";
import { hookNative } from "./anti-detection";
import type { FileType } from "./file";

const TYPE_REG = /type=(img|mp3|midi)/;
// first page has different URL
const INIT_PAGE_REG = /(score_0\.png@0|score_0\.svg)/;
const INDEX_REG = /index=(\d+)/;

export const auths = {};

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
                            if (
                                typeof url === "string" &&
                                (token || url.match(INIT_PAGE_REG))
                            ) {
                                let m = url.match(TYPE_REG);
                                let i = url.match(INDEX_REG);
                                if (m && i) {
                                    // console.log(url, token, m[1], i[1]);
                                    const type = m[1];
                                    const index = i[1];
                                    auths[type + index] = token;
                                } else if (url.match(INIT_PAGE_REG)) {
                                    auths["img0"] = url;
                                }
                            }
                            return fetch(url, init);
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

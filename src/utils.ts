import isNodeJs from "detect-node";
import { isGmAvailable, _GM } from "./gm";

export const escapeFilename = (s: string): string => {
    return s.replace(/[\s<>:{}"/\\|?*~.\0\cA-\cZ]+/g, "_");
};

export const getIndexPath = (id: number): string => {
    const idStr = String(id);
    // 获取最后三位，倒序排列
    // x, y, z are the reversed last digits of the score id. Example: id 123456789, x = 9, y = 8, z = 7
    // https://developers.musescore.com/#/file-urls
    // "5449062" -> ["2", "6", "0"]
    const indexN = idStr.split("").reverse().slice(0, 3);
    return indexN.join("/");
};

const NODE_FETCH_HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.2535.85",
    "Accept-Language": "en-US;q=0.8",
};

export const getFetch = (): typeof fetch => {
    if (!isNodeJs) {
        return fetch;
    } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const axios = require("axios");
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ProxyAgent = require("proxy-agent");

        return (input: RequestInfo, init?: RequestInit) => {
            let url =
                typeof input === "string" ? input : (input as any)?.url ?? "";
            if (typeof url === "string" && !url.startsWith("http")) {
                // fix: Only absolute URLs are supported
                url = "https://musescore.com" + url;
            }

            const headers = Object.assign(
                {},
                NODE_FETCH_HEADERS,
                init?.headers || {}
            );

            const axiosConfig: any = {
                url,
                method: (init?.method as string) || "GET",
                headers,
                responseType: "arraybuffer",
                signal: (init as any)?.signal,
                httpAgent: new ProxyAgent(),
                httpsAgent: new ProxyAgent(),
                maxRedirects: 10,
            };

            if (init?.body !== undefined) {
                axiosConfig.data = init.body;
            }

            return axios
                .request(axiosConfig)
                .then((res: any) => {
                    const arrayBuffer = res.data as ArrayBuffer;
                    const buf = Buffer.from(arrayBuffer);
                    const nodeRes: any = {
                        ok: res.status >= 200 && res.status < 300,
                        status: res.status,
                        statusText: res.statusText,
                        url: res.config?.url || url,
                        headers: res.headers,
                        json: async () => {
                            const txt = buf.toString("utf8");
                            return JSON.parse(txt);
                        },
                        text: async () => buf.toString("utf8"),
                        arrayBuffer: async () => arrayBuffer,
                    };
                    return nodeRes;
                })
                .catch((err: any) => {
                    if (err.response) {
                        const res = err.response;
                        const arrayBuffer = res.data as ArrayBuffer;
                        const buf = Buffer.from(
                            arrayBuffer || new ArrayBuffer(0)
                        );
                        const nodeRes: any = {
                            ok: res.status >= 200 && res.status < 300,
                            status: res.status,
                            statusText: res.statusText,
                            url: res.config?.url || url,
                            headers: res.headers,
                            json: async () => JSON.parse(buf.toString("utf8")),
                            text: async () => buf.toString("utf8"),
                            arrayBuffer: async () => arrayBuffer,
                        };
                        return nodeRes;
                    }
                    throw err;
                });
        };
    }
};

export const fetchData = async (
    url: string,
    init?: RequestInit
): Promise<Uint8Array> => {
    const _fetch = getFetch();
    const r = await _fetch(url, init);
    const data = await r.arrayBuffer();
    return new Uint8Array(data);
};

export const fetchBuffer = async (
    url: string,
    init?: RequestInit
): Promise<Buffer> => {
    const d = await fetchData(url, init);
    return Buffer.from(d.buffer);
};

export const assertRes = (r: Response): void => {
    if (!r.ok) throw new Error(`${r.url} ${r.status} ${r.statusText}`);
};

export const useTimeout = async <T>(
    promise: T | Promise<T>,
    ms: number
): Promise<T> => {
    if (!(promise instanceof Promise)) {
        return promise;
    }

    return new Promise((resolve, reject) => {
        const i = setTimeout(() => {
            reject(new Error("timeout"));
        }, ms);
        promise.then(resolve, reject).finally(() => clearTimeout(i));
    });
};

export const getSandboxWindowAsync = async (
    targetEl: Element | undefined = undefined
): Promise<Window> => {
    if (typeof document === "undefined") return {} as any as Window;

    if (isGmAvailable("addElement")) {
        // create iframe using GM_addElement API
        const iframe = await _GM.addElement("iframe", {});
        iframe.style.display = "none";
        return iframe.contentWindow as Window;
    }

    if (!targetEl) {
        return new Promise((resolve) => {
            // You need ads in your pages, right?
            const observer = new MutationObserver(() => {
                for (let i = 0; i < window.frames.length; i++) {
                    // find iframe windows created by ads
                    const frame = frames[i];
                    try {
                        const href = frame.location.href;
                        if (href === location.href || href === "about:blank") {
                            resolve(frame);
                            return;
                        }
                    } catch {}
                }
            });
            observer.observe(document.body, { subtree: true, childList: true });
        });
    }

    return new Promise((resolve) => {
        const eventName = "onmousemove";
        const id = Math.random().toString();

        targetEl[id] = (iframe: HTMLIFrameElement) => {
            delete targetEl[id];
            targetEl.removeAttribute(eventName);

            iframe.style.display = "none";
            targetEl.append(iframe);
            const w = iframe.contentWindow;
            resolve(w as Window);
        };

        targetEl.setAttribute(
            eventName,
            `this['${id}'](document.createElement('iframe'))`
        );
    });
};

export const getUnsafeWindow = (): Window => {
    // eslint-disable-next-line no-eval
    return window.eval("window") as Window;
};

export const console: Console = (
    typeof window !== "undefined" ? window : global
).console; // Object.is(window.console, unsafeWindow.console) == false

export const windowOpenAsync = (
    targetEl: Element | undefined,
    ...args: Parameters<Window["open"]>
): Promise<Window | null> => {
    return getSandboxWindowAsync(targetEl).then((w) => w.open(...args));
};

export const attachShadow = (el: Element): ShadowRoot => {
    return Element.prototype.attachShadow.call(el, {
        mode: "closed",
    }) as ShadowRoot;
};

export const waitForDocumentLoaded = (): Promise<void> => {
    if (document.readyState !== "complete") {
        return new Promise((resolve) => {
            const cb = () => {
                if (document.readyState === "complete") {
                    resolve();
                    document.removeEventListener("readystatechange", cb);
                }
            };
            document.addEventListener("readystatechange", cb);
        });
    } else {
        return Promise.resolve();
    }
};

/**
 * Run script before the page is fully loaded
 */
export const waitForSheetLoaded = (): Promise<void> => {
    return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
            const meta =
                document.querySelector(
                    "#ELEMENT_ID_SCORE_DOWNLOAD_SECTION > section > button"
                ) && document.querySelector("#jmuse-scroller-component div");
            if (meta) {
                resolve();
                observer.disconnect();
            }
        });
        observer.observe(document, { childList: true, subtree: true });
    });
};

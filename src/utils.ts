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
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0",
    "Accept-Language": "en-US,en;q=0.8",
};

export const getFetch = (): typeof fetch => {
    if (!isNodeJs) {
        return fetch;
    } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodeFetch = require("node-fetch");
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        // Use proxy based on standard proxy environment variables
        const ProxyAgent = require("proxy-agent");
        return (input: RequestInfo, init?: RequestInit) => {
            if (typeof input === "string" && !input.startsWith("http")) {
                // fix: Only absolute URLs are supported
                input = "https://musescore.com" + input;
            }
            init = Object.assign({
                headers: NODE_FETCH_HEADERS,
                // Use the `HTTPS_PROXY` environment variable for no URL given
                // see: https://github.com/TooTallNate/node-proxy-agent#proxy-agent
                agent: new ProxyAgent(),
            }, init);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return nodeFetch(input, init);
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
        mode: "open",
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
            const meta = document.querySelector(
                "meta[property='og:type'][content='musescore:score']"
            );
            if (meta) {
                resolve();
                observer.disconnect();
            }
        });
        observer.observe(document, { childList: true, subtree: true });
    });
};

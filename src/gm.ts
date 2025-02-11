/**
 * UserScript APIs
 */
declare const GM: {
    /** https://www.tampermonkey.net/documentation.php#GM_info */
    info: Record<string, any>;

    /** https://www.tampermonkey.net/documentation.php#GM_registerMenuCommand */
    registerMenuCommand(
        name: string,
        fn: () => any,
        accessKey?: string
    ): Promise<number>;

    /** https://github.com/Tampermonkey/tampermonkey/issues/881#issuecomment-639705679 */
    addElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        properties: Record<string, any>
    ): Promise<HTMLElementTagNameMap[K]>;

    /** https://www.tampermonkey.net/documentation.php#GM_xmlhttpRequest */
    xmlHttpRequest(details: GMXMLHttpRequestOptions): { abort: () => void };
};

export interface GMXMLHttpRequestOptions {
    method: string;
    url: string;
    headers?: Record<string, string>;
    data?: string;
    responseType?: "arraybuffer" | "blob" | "json" | "text";
    timeout?: number;
    onload?: (response: GMXMLHttpRequestResponse) => void;
    onerror?: (error: any) => void;
    onprogress?: (progress: ProgressEvent) => void;
}

export interface GMXMLHttpRequestResponse {
    readyState: number;
    responseHeaders: string;
    responseText: string;
    status: number;
    statusText: string;
    finalUrl: string;
}

export const _GM = (typeof GM === "object" ? GM : undefined) as GM;

type GM = typeof GM;

export const isGmAvailable = (requiredMethod: keyof GM = "info"): boolean => {
    return (
        typeof GM !== "undefined" && typeof GM[requiredMethod] !== "undefined"
    );
};

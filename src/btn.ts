import { useTimeout, windowOpenAsync, console, attachShadow } from "./utils";
import { isGmAvailable, _GM } from "./gm";
// @ts-ignore
import btnListCss from "./btn.css";
import i18nextInit, { i18next } from "./i18n/index";

(async () => {
    await i18nextInit;
})();

type BtnElement = HTMLButtonElement;

export enum ICON {
    DOWNLOAD = "M9.6 2.4h4.8V12h2.784l-5.18 5.18L6.823 12H9.6V2.4zM19.2 19.2H4.8v2.4h14.4v-2.4z",
    LIBRESCORE = "m5.4837 4.4735v10.405c-1.25-0.89936-3.0285-0.40896-4.1658 0.45816-1.0052 0.76659-1.7881 2.3316-0.98365 3.4943 1 1.1346 2.7702 0.70402 3.8817-0.02809 1.0896-0.66323 1.9667-1.8569 1.8125-3.1814v-5.4822h8.3278v9.3865h9.6438v-2.6282h-6.4567v-12.417c-4.0064-0.015181-8.0424-0.0027-12.06-0.00676zm0.54477 2.2697h8.3278v1.1258h-8.3278v-1.1258z",
}

const getBtnContainer = (): HTMLDivElement => {
    const els = [...document.querySelectorAll("span")];
    const el = els.find((b) => {
        const text = b?.textContent?.replace(/\s/g, "") || "";
        return text.includes("Download") || text.includes("Print");
    }) as HTMLDivElement | null;
    const btnParent = el?.parentElement?.parentElement as
        | HTMLDivElement
        | undefined;
    if (!btnParent || !(btnParent instanceof HTMLDivElement))
        throw new Error(i18next.t("button_parent_not_found"));
    return btnParent;
};

const buildDownloadBtn = (icon: ICON, lightTheme = false) => {
    const btn = document.createElement("button");
    btn.type = "button";
    if (lightTheme) btn.className = "light";

    // build icon svg element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    const svgPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    );
    svgPath.setAttribute("d", icon);
    svgPath.setAttribute("fill", lightTheme ? "#2e68c0" : "#fff");
    svg.append(svgPath);

    const textNode = document.createElement("span");
    btn.append(svg, textNode);

    return btn;
};

const cloneBtn = (btn: HTMLButtonElement) => {
    const n = btn.cloneNode(true) as HTMLButtonElement;
    n.onclick = btn.onclick;
    return n;
};

function getScrollParent(node: HTMLElement): HTMLElement {
    if (node.scrollHeight > node.clientHeight) {
        return node;
    } else {
        return getScrollParent(node.parentNode as HTMLElement);
    }
}

function onPageRendered(getEl: () => HTMLElement) {
    return new Promise<HTMLElement>((resolve) => {
        const observer = new MutationObserver(() => {
            try {
                const el = getEl();
                if (el) {
                    observer.disconnect();
                    resolve(el);
                }
            } catch {}
        });
        observer.observe(
            document.querySelector("div > section") ?? document.body,
            { childList: true, subtree: true }
        );
    });
}

interface BtnOptions {
    readonly name: string;
    readonly action: BtnAction;
    readonly disabled?: boolean;
    readonly tooltip?: string;
    readonly icon?: ICON;
    readonly lightTheme?: boolean;
}

export enum BtnListMode {
    InPage,
    ExtWindow,
}

export class BtnList {
    private readonly list: BtnElement[] = [];

    constructor(private getBtnParent: () => HTMLDivElement = getBtnContainer) {}

    add(options: BtnOptions): BtnElement {
        const btnTpl = buildDownloadBtn(
            options.icon ?? ICON.DOWNLOAD,
            options.lightTheme
        );
        const setText = (btn: BtnElement) => {
            const textNode = btn.querySelector("span");
            return (str: string): void => {
                if (textNode) textNode.textContent = str;
            };
        };

        setText(btnTpl)(options.name);

        btnTpl.onclick = function () {
            const btn = this as BtnElement;
            options.action(options.name, btn, setText(btn));
        };

        this.list.push(btnTpl);

        if (options.disabled) {
            btnTpl.disabled = options.disabled;
        }

        if (options.tooltip) {
            btnTpl.title = options.tooltip;
        }

        // add buttons to the userscript manager menu
        if (isGmAvailable("registerMenuCommand")) {
            // eslint-disable-next-line no-void
            void _GM.registerMenuCommand(options.name, () => {
                options.action(options.name, btnTpl, () => undefined);
            });
        }

        return btnTpl;
    }

    private _positionBtns(
        anchorDiv: HTMLDivElement,
        newParent: HTMLDivElement,
        id: number
    ) {
        let { top } = anchorDiv.getBoundingClientRect();
        top += window.scrollY; // relative to the entire document instead of viewport
        if (top > 0) {
            newParent.style.top = `${top - (id - 1) * 48}px`;
        } else {
            newParent.style.top = "0px";
        }
    }

    private _commit(id: number) {
        const btnParent = document.querySelector(
            "div.react-container"
        ) as HTMLDivElement;
        let isNew = false;
        let shadow = btnParent.shadowRoot;
        if (!shadow) {
            isNew = true;
            shadow = attachShadow(btnParent);
        }

        if (isNew) {
            // style the shadow DOM
            const style = document.createElement("style");
            style.innerText = btnListCss;
            shadow.append(style);

            // hide buttons using the shadow DOM
            const slot = document.createElement("slot");
            shadow.append(slot);
        }

        const newParent = document.createElement("div");
        newParent.append(...this.list.map((e) => cloneBtn(e)));
        newParent.id = id.toString();
        !shadow.querySelector("div#id")
            ? shadow.append(newParent)
            : shadow.replaceChild(newParent, shadow.querySelector("div#id")!);

        // default position
        newParent.style.top = `${
            window.innerHeight - newParent.getBoundingClientRect().height * id
        }px`;

        void onPageRendered(this.getBtnParent).then(
            (anchorDiv: HTMLDivElement) => {
                const pos = () => this._positionBtns(anchorDiv, newParent, id);
                pos();
                if (isNew) {
                    // reposition btns when window resizes
                    window.addEventListener("resize", pos, { passive: true });

                    // reposition btns when scrolling
                    const scroll = getScrollParent(anchorDiv);
                    scroll.addEventListener("scroll", pos, { passive: true });
                }
            }
        );

        return btnParent;
    }

    /**
     * replace the template button with the list of new buttons
     */
    async commit(
        mode: BtnListMode = BtnListMode.InPage,
        id: number
    ): Promise<void> {
        switch (mode) {
            case BtnListMode.InPage: {
                let el: Element;
                try {
                    el = this._commit(id);
                } catch {
                    // fallback to BtnListMode.ExtWindow
                    return this.commit(BtnListMode.ExtWindow, id);
                }
                const observer = new MutationObserver(() => {
                    // check if the buttons are still in document when dom updates
                    if (!document.contains(el)) {
                        // re-commit
                        // performance issue?
                        el = this._commit(id);
                    }
                });
                observer.observe(document, { childList: true, subtree: true });
                break;
            }

            case BtnListMode.ExtWindow: {
                const div = this._commit(id);
                const w = await windowOpenAsync(
                    undefined,
                    "",
                    undefined,
                    "resizable,width=230,height=270"
                );
                // eslint-disable-next-line no-unused-expressions
                w?.document.body.append(div);
                window.addEventListener("unload", () => w?.close());
                break;
            }

            default:
                throw new Error(i18next.t("unknown_button_list_mode"));
        }
    }
}

type BtnAction = (
    btnName: string,
    btnEl: BtnElement,
    setText: (str: string) => void
) => any;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BtnAction {
    type Promisable<T> = T | Promise<T>;
    type UrlInput = Promisable<string> | (() => Promisable<string>);

    const normalizeUrlInput = (url: UrlInput) => {
        if (typeof url === "function") return url();
        else return url;
    };

    export const download = (
        url: UrlInput,
        fallback?: () => Promisable<void>,
        timeout?: number,
        target?: "_blank"
    ): BtnAction => {
        return process(
            async (): Promise<void> => {
                const _url = await normalizeUrlInput(url);
                const a = document.createElement("a");
                a.href = _url;
                if (target) a.target = target;
                a.dispatchEvent(new MouseEvent("click"));
            },
            fallback,
            timeout
        );
    };

    export const openUrl = download;

    export const process = (
        fn: () => any,
        fallback?: () => Promisable<void>,
        timeout = 0 /* 10min */
    ): BtnAction => {
        return async (name, btn, setText): Promise<void> => {
            const _onclick = btn.onclick;

            btn.onclick = null;
            setText(i18next.t("processing"));

            try {
                await useTimeout(fn(), timeout);
                setText(name);
            } catch (err) {
                console.error(err);
                if (fallback) {
                    // use fallback
                    await fallback();
                    setText(name);
                }
            }

            btn.onclick = _onclick;
        };
    };
}

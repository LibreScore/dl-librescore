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
    DOWNLOAD_TOP = "M9.479 4.225v7.073L8.15 9.954a.538.538 0 00-.756.766l2.214 2.213a.52.52 0 00.745 0l2.198-2.203a.526.526 0 10-.745-.745l-1.287 1.308V4.225a.52.52 0 00-1.041 0z",
    DOWNLOAD_BOTTOM = "M16.25 11.516v5.209a.52.52 0 01-.521.52H4.27a.521.521 0 01-.521-.52v-5.209a.52.52 0 10-1.042 0v5.209a1.562 1.562 0 001.563 1.562h11.458a1.562 1.562 0 001.562-1.562v-5.209a.52.52 0 10-1.041 0z",
}

const buildDownloadBtn = () => {
    const btn = document.createElement("button") as HTMLButtonElement;
    btn.type = "button";
    btn.append(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
    btn.append(document.createElement("span"));
    let btnSvg = btn.querySelector("svg")!;
    btnSvg.setAttribute("viewBox", "0 0 20 20");
    let svgPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    );
    svgPath.setAttribute("d", ICON.DOWNLOAD_TOP);
    svgPath.setAttribute("fill", "#fff");
    btnSvg.append(svgPath);
    svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svgPath.setAttribute("d", ICON.DOWNLOAD_BOTTOM);
    svgPath.setAttribute("fill", "#fff");
    btnSvg.append(svgPath);
    return btn;
};

const cloneBtn = (btn: HTMLButtonElement) => {
    const n = btn.cloneNode(true) as HTMLButtonElement;
    n.onclick = btn.onclick;
    return n;
};

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

    add(options: BtnOptions): BtnElement {
        const btnTpl = buildDownloadBtn();
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

    private _commit() {
        const btnParent = document.querySelector(
            "#ELEMENT_ID_SCORE_DOWNLOAD_SECTION > section"
        ) as HTMLElement;

        let shadow = attachShadow(btnParent);

        // Inject the collected styles into the shadow DOM
        const style = document.createElement("style");
        style.textContent = btnListCss;
        shadow.appendChild(style);

        // hide buttons using the shadow DOM
        const slot = document.createElement("slot");
        shadow.append(slot);

        shadow.append(...this.list.map((e) => cloneBtn(e)));

        return btnParent;
    }

    /**
     * replace the template button with the list of new buttons
     */
    async commit(mode: BtnListMode = BtnListMode.InPage): Promise<void> {
        switch (mode) {
            case BtnListMode.InPage: {
                let el: Element;
                el = this._commit();
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

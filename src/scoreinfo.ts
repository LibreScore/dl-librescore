import { getFetch, escapeFilename } from "./utils";
import i18nextInit, { i18next } from "./i18n/index";

(async () => {
    await i18nextInit;
})();

export abstract class ScoreInfo {
    abstract id: number;
    abstract title: string;

    public store = new Map<symbol, any>();

    get fileName(): string {
        return escapeFilename(this.title);
    }
}

export class ScoreInfoObj extends ScoreInfo {
    constructor(public id: number = 0, public title: string = "") {
        super();
    }
}

export class ScoreInfoInPage extends ScoreInfo {
    constructor(private document: Document) {
        super();
    }

    get id(): number {
        const el = this.document.querySelector(
            "meta[property='al:ios:url']"
        ) as HTMLMetaElement;
        const m = el.content.match(/(\d+)$/) as RegExpMatchArray;
        return +m[1];
    }

    get title(): string {
        const el = this.document.querySelector(
            "meta[property='og:title']"
        ) as HTMLMetaElement;
        return el.content;
    }

    get baseUrl(): string {
        const el = this.document.querySelector(
            "meta[property='og:image']"
        ) as HTMLMetaElement;
        const m = el.content.match(/^(.+\/)score_/) as RegExpMatchArray;
        return m[1];
    }
}

export class ScoreInfoHtml extends ScoreInfo {
    private readonly ID_REG =
        /<meta property="al:ios:url" content="musescore:\/\/score\/(\d+)">/;
    private readonly TITLE_REG = /<meta property="og:title" content="(.*)">/;
    private readonly BASEURL_REG =
        /<meta property="og:image" content="(.+\/)score_.*">/;

    constructor(private html: string) {
        super();
    }

    get id(): number {
        const m = this.html.match(this.ID_REG);
        if (!m) return 0;
        return +m[1];
    }

    get title(): string {
        const m = this.html.match(this.TITLE_REG);
        if (!m) return "";
        return m[1];
    }

    get baseUrl(): string {
        const m = this.html.match(this.BASEURL_REG);
        if (!m) return "";
        return m[1];
    }

    get sheet(): SheetInfo {
        return new SheetInfoHtml(this.html);
    }

    static async request(
        url: string,
        _fetch = getFetch()
    ): Promise<ScoreInfoHtml> {
        const r = await _fetch(url);
        if (!r.ok) return new ScoreInfoHtml("");

        const html = await r.text();
        return new ScoreInfoHtml(html);
    }
}

export type Dimensions = { width: number; height: number };

export abstract class SheetInfo {
    abstract pageCount: number;

    /** url to the image of the first page */
    abstract thumbnailUrl: string;

    abstract dimensions: Dimensions;

    get imgType(): "svg" | "png" {
        const thumbnail = this.thumbnailUrl;
        const imgtype = thumbnail.match(/score_0\.(\w+)/)![1];
        return imgtype as "svg" | "png";
    }
}

export class SheetInfoInPage extends SheetInfo {
    constructor(private document: Document) {
        super();
    }

    private get sheet0Img(): HTMLImageElement | null {
        return this.document.querySelector("img[src*=score_0]");
    }

    get pageCount(): number {
        const sheet0Div = this.sheet0Img?.parentElement;
        if (!sheet0Div) {
            throw new Error(i18next.t("no_sheet_images_error"));
        }
        return this.document.getElementsByClassName(sheet0Div.className).length;
    }

    get thumbnailUrl(): string {
        const el =
            this.document.querySelector<HTMLLinkElement>("link[as=image]");
        const url = (el?.href || this.sheet0Img?.src) as string;
        return url.split("@")[0];
    }

    get dimensions(): Dimensions {
        const { naturalWidth: width, naturalHeight: height } = this
            .sheet0Img as HTMLImageElement;
        return { width, height };
    }
}

export class SheetInfoHtml extends SheetInfo {
    private readonly PAGE_COUNT_REG = /pages(?:&quot;|"):(\d+)/;
    private readonly THUMBNAIL_REG =
        /<link (?:.*) href="(.*)" rel="preload" as="image"/;

    private readonly DIMENSIONS_REG =
        /dimensions(?:&quot;|"):(?:&quot;|")(\d+)x(\d+)(?:&quot;|"),/;

    constructor(private html: string) {
        super();
    }

    get pageCount(): number {
        const m = this.html.match(this.PAGE_COUNT_REG);
        if (!m) return NaN;
        return +m[1];
    }

    get thumbnailUrl(): string {
        const m = this.html.match(this.THUMBNAIL_REG);
        if (!m) return "";
        return m[1].split("@")[0];
    }

    get dimensions(): Dimensions {
        const m = this.html.match(this.DIMENSIONS_REG);
        if (!m) return { width: NaN, height: NaN };
        return { width: +m[1], height: +m[2] };
    }
}

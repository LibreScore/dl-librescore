/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import md5 from "md5";
import { getFetch, assertRes } from "./utils";

export type FileType = "img" | "mp3" | "midi";

const getSuffix = async (
    scoreUrl: string,
    _fetch = getFetch()
): Promise<string | null> => {
    let suffixUrls: string[] = [];
    if (scoreUrl !== "") {
        const response = await _fetch(scoreUrl);
        const text = await response.text();
        suffixUrls = [
            ...text.matchAll(
                /link.+?href=["'](https:\/\/musescore\.com\/static\/public\/build\/musescore.*?(?:_es6)?\/20.+?\.js)["']/g
            ),
        ].map((match) => match[1]);
    } else {
        suffixUrls = [
            ...document.head.innerHTML.matchAll(
                /link.+?href=["'](https:\/\/musescore\.com\/static\/public\/build\/musescore.*?(?:_es6)?\/20.+?\.js)["']/g
            ),
        ].map((match) => match[1]);
    }

    for (const url of suffixUrls) {
        const response = await _fetch(url);
        const text = await response.text();

        const match = text.match(/"([^"]+)"\)\.substr\(0,4\)/);
        if (match) {
            return match[1];
        }
    }

    return null;
};

const getApiAuth = async (
    id: number,
    type: FileType,
    index: number,
    scoreUrl: string
): Promise<string> => {
    const suffix = await getSuffix(scoreUrl);
    if (suffix === null) {
        throw new Error("could not find auth suffix in site bundle");
    }
    return md5(`${id}${type}${index}${suffix}`).slice(0, 4);
};

export const getFileUrl = async (
    id: number,
    type: FileType,
    scoreUrl = "",
    index = 0,
    _fetch = getFetch(),
    setText?: (str: string) => void,
    pageCount?: number
): Promise<string> => {
    const url = `/api/jmuse?id=${id}&type=${type}&index=${index}`;
    const auth = await getApiAuth(id, type, index, scoreUrl);
    if (setText && pageCount) {
        const percent = Math.round(((index + 1) / pageCount) * 83);
        setText(`${percent}%`);
    }

    const r = await _fetch(url, {
        headers: {
            Authorization: auth,
        },
    });

    assertRes(r);

    const { info } = await r.json();
    return info.url as string;
};

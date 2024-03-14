/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import md5 from "md5";
import { getFetch } from "./utils";

export type FileType = "img" | "mp3" | "midi";

const getApiUrl = (id: number, type: FileType, index: number): string => {
    return `/api/jmuse?id=${id}&type=${type}&index=${index}`;
};

const getApiAuth = (id: number, type: FileType, index: number): string => {
    const suffix = 'et'
    const code = `${id}${type}${index}${suffix}`;
    return md5(code).slice(0, 4);
};

export const getFileUrl = async (
    id: number,
    type: FileType,
    index = 0,
    _fetch = getFetch()
): Promise<string> => {
    let r;
    const url = getApiUrl(id, type, index);
    const auth = getApiAuth(id, type, index);
    if (type === "img" && index === 0) {
        // auth is the URL for the first page
        r = await _fetch(auth);
    } else {
        r = await _fetch(url, {
            headers: {
                Authorization: auth,
            },
        });
    }
    const { info } = await r.json();
    return info.url as string;
};

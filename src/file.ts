/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import isNodeJs from "detect-node";
import { useTimeout, getFetch } from "./utils";
import { magics } from "./file-magics";

export type FileType = "img" | "mp3" | "midi";

const getApiUrl = (id: number, type: FileType, index: number): string => {
    return `/api/jmuse?id=${id}&type=${type}&index=${index}`;
};

/**
 * hard-coded auth tokens
 */
const useBuiltinAuth = (type: FileType): string => {
    switch (type) {
        case "img":
            return "8c022bdef45341074ce876ae57a48f64b86cdcf5";
        case "midi":
            return "38fb9efaae51b0c83b5bb5791a698b48292129e7";
        case "mp3":
            return "63794e5461e4cfa046edfbdddfccc1ac16daffd2";
    }
};

const getApiAuth = async (type: FileType, index: number): Promise<string> => {
    if (isNodeJs) {
        // we cannot intercept API requests in Node.js (as no requests are sent), so go straightforward to the hard-coded tokens
        return useBuiltinAuth(type);
    }

    const magic = magics[type];
    if (magic instanceof Promise) {
        // force to retrieve the MAGIC
        try {
            switch (type) {
                case "midi": {
                    const fsBtn = document.querySelector(
                        'button[title="Toggle Fullscreen"]'
                    ) as HTMLButtonElement;
                    if (!fsBtn) {
                        throw Error;
                    }
                    const el =
                        fsBtn.parentElement?.parentElement?.querySelector(
                            "button"
                        ) as HTMLButtonElement;
                    el.click();
                    break;
                }
                case "mp3": {
                    // Mobile doesn't support click() function, find another method
                    if (navigator.userAgentData.mobile) {
                        throw Error;
                    }
                    const el = document.querySelector(
                        'button[title="Toggle Play"]'
                    ) as HTMLButtonElement;
                    el.click();
                    break;
                }
                case "img": {
                    // Use fallback until better method is found
                    throw Error;
                    break;
                }
            }
        } catch (err) {
            console.error(err);
            return useBuiltinAuth(type);
        }
    }

    try {
        return await useTimeout(magic, 5 * 1000 /* 5s */);
    } catch {
        console.error(type, "token timeout");
        // try hard-coded tokens
        return useBuiltinAuth(type);
    }
};

export const getFileUrl = async (
    id: number,
    type: FileType,
    index = 0,
    _fetch = getFetch()
): Promise<string> => {
    const url = getApiUrl(id, type, index);
    const auth = await getApiAuth(type, index);

    let r = await _fetch(url, {
        headers: {
            Authorization: auth,
        },
    });

    if (!r.ok) {
        r = await _fetch(url + "&v2=1", {
            headers: {
                Authorization: auth,
            },
        });
    }

    const { info } = await r.json();
    return info.url as string;
};

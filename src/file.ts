/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import md5 from "md5";
import { getFetch } from "./utils";
import { auths } from "./file-magics";

export type FileType = "img" | "mp3" | "midi";

const getSuffix = async (scoreUrl: string): Promise<string> => {
    let suffixUrl;
    if (scoreUrl !== "") {
        suffixUrl = (await (await fetch(scoreUrl)).text()).match(
            '<link href="(https://musescore.com/static/public/build/musescore.*?(?:_es6)?/20.+?.js)"'
        )?.[1]!;
    } else {
        const suffixElement =
            (document.head.querySelector(
                "link[href^='https://musescore.com/static/public/build/musescore_es6/20']"
            ) as HTMLLinkElement) ??
            (document.head.querySelector(
                "link[href^='https://musescore.com/static/public/build/musescore/20']"
            ) as HTMLLinkElement) ??
            (document.head.querySelector(
                "link[href^='https://musescore.com/static/public/build/musescore_fonts_es6/20']"
            ) as HTMLLinkElement) ??
            (document.head.querySelector(
                "link[href^='https://musescore.com/static/public/build/musescore_fonts/20']"
            ) as HTMLLinkElement);
        suffixUrl = suffixElement?.href;
    }
    const suffixJs = await fetch(suffixUrl);
    return (await suffixJs.text()).match(
        '(?:.*)"(.+)"\\)\\.substr\\(0,4\\)'
    )?.[1]!;
};

const getApiUrl = (id: number, type: FileType, index: number): string => {
    return `/api/jmuse?id=${id}&type=${type}&index=${index}`;
};

const getApiAuth = async (
    id: number,
    type: FileType,
    index: number,
    scoreUrl: string
): Promise<string> => {
    const code = `${id}${type}${index}${await getSuffix(scoreUrl)}`;
    return md5(code).slice(0, 4);
};

let imgInProgress = false;

const getApiAuthNetwork = async (
    type: FileType,
    index: number
): Promise<string> => {
    let numPages = 0;
    let pageCooldown = 25;
    if (!auths[type + index]) {
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
                    const el = document.querySelector(
                        'button[title="Toggle Play"]'
                    ) as HTMLButtonElement;
                    el.click();
                    break;
                }
                case "img": {
                    if (!imgInProgress) {
                        imgInProgress = true;
                        let parentDiv = document.querySelector(
                            "#jmuse-scroller-component"
                        )!;

                        numPages = parentDiv.children.length - 3;
                        let i = 0;

                        function scrollToNextChild() {
                            let childDiv = parentDiv.children[i];
                            if (childDiv) {
                                childDiv.scrollIntoView();
                            }

                            i++;

                            if (i < numPages) {
                                setTimeout(scrollToNextChild, pageCooldown);
                            }
                        }

                        scrollToNextChild();
                    }
                    imgInProgress = false;
                    break;
                }
            }
        } catch (err) {
            console.error(err);
            throw Error;
        }
    }

    try {
        return new Promise((resolve, reject) => {
            let timer = setTimeout(
                () => {
                    reject(new Error("token timeout"));
                },
                type === "img"
                    ? numPages * pageCooldown * 2 + 2100
                    : 5 * 1000 /* 5s */
            );

            // Check the auths object periodically
            let interval = setInterval(() => {
                if (auths.hasOwnProperty(type + index)) {
                    clearTimeout(timer);
                    clearInterval(interval);
                    setInterval(
                        () => {
                            resolve(auths[type + index]);
                        },
                        // long delay for images to give time for them to load fully
                        type === "img" ? 2000 : 100
                    );
                }
            }, 100);
        });
    } catch {
        console.error(type, "token timeout");
        throw Error;
    }
};

export const getFileUrl = async (
    id: number,
    type: FileType,
    scoreUrl = "",
    index = 0,
    _fetch = getFetch()
): Promise<string> => {
    const url = getApiUrl(id, type, index);
    let auth = await getApiAuth(id, type, index, scoreUrl);

    let r = await _fetch(url, {
        headers: {
            Authorization: auth,
        },
    });

    if (!r.ok) {
        auth = await getApiAuthNetwork(type, index);
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
    }

    const { info } = await r.json();
    return info.url as string;
};

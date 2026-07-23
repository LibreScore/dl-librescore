/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import md5 from "md5";
import { getFetch } from "./utils";
import { auths, imgUrls } from "./file-magics";

export type FileType = "img" | "mp3" | "midi";

/**
 * Get the image URL for a page directly from the player's own API response
 * (captured by the fetch hook). The player always uses a valid token, so this
 * avoids MD5/token guessing — the root cause of HTTP 422 when MuseScore rotates
 * its auth scheme. Triggers a scroll pass so the player loads every page, then
 * waits for that page's URL to be captured.
 */
const getImgUrlFromPlayer = async (
    index: number,
    pageCount?: number
): Promise<string | null> => {
    if (imgUrls[index]) {
        return imgUrls[index];
    }
    // Kick off the scroll pass (idempotent) so the player fetches all pages.
    getApiAuthNetwork("img", index, pageCount).catch(() => undefined);

    const timeoutMs = Math.max((pageCount || 1) * 50 + 2100, 30 * 1000);
    return new Promise((resolve) => {
        const start = Date.now();
        const timer = setInterval(() => {
            if (imgUrls[index]) {
                clearInterval(timer);
                resolve(imgUrls[index]);
            } else if (Date.now() - start > timeoutMs) {
                clearInterval(timer);
                resolve(null);
            }
        }, 100);
    });
};

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

let imgScrollStarted = false;

const getApiAuthNetwork = async (
    type: FileType,
    index: number,
    pageCount?: number
): Promise<string> => {
    let numPages = 0;
    let pageCooldown = 25;

    // The image scroll pass must run even once a token exists, because the goal
    // is to make the player load EVERY page (so we can capture each page's real
    // URL) — not just obtain one token. The `imgScrollStarted` guard keeps it
    // one-shot. Other types still gate on `!auths` below.
    if (type === "img") {
        try {
            let parentDiv = document.querySelector(
                "#jmuse-scroller-component"
            )!;
            numPages =
                pageCount && pageCount > 0
                    ? pageCount
                    : parentDiv.children.length;

            if (!imgScrollStarted) {
                imgScrollStarted = true;
                let i = 0;
                const scrollToNextChild = () => {
                    let childDiv = parentDiv.children[i];
                    if (childDiv) {
                        childDiv.scrollIntoView();
                    }
                    i++;
                    if (i < parentDiv.children.length) {
                        setTimeout(scrollToNextChild, pageCooldown);
                    }
                };
                scrollToNextChild();
            }
        } catch (err) {
            console.error(err);
        }
    }

    if (type !== "img" && !auths[type + index]) {
        try {
            switch (type) {
                case "midi": {
                    const fsBtn = document.querySelector(
                        'button[title="Toggle Fullscreen"]'
                    ) as HTMLButtonElement;
                    if (!fsBtn) {
                        // mobile device
                        document
                            .querySelector("button[title='Open Mixer']")
                            ?.click();
                        const observer = new MutationObserver(() => {
                            if (
                                document.querySelector(
                                    "body > article[role='dialog']"
                                )
                            ) {
                                let audioSources = document.querySelector(
                                    "body > article[role='dialog'] select"
                                );

                                if (audioSources !== null) {
                                    audioSources.querySelector(
                                        "option[value='0']"
                                    )?.selected = true;

                                    audioSources.dispatchEvent(
                                        new Event("change")
                                    );
                                }
                                document
                                    .querySelector(
                                        "article[role='dialog'] header > button"
                                    )
                                    ?.click();
                            }
                        });
                        observer.observe(document.body, {
                            childList: true,
                            subtree: true,
                        });
                    } else {
                        const el =
                            fsBtn.parentElement?.parentElement?.querySelector(
                                "button"
                            ) as HTMLButtonElement;
                        el.click();
                    }
                    break;
                }
                case "mp3": {
                    const el = document.querySelector(
                        'button[title="Toggle Play"]'
                    ) as HTMLButtonElement;
                    if (!el) {
                        // mobile device
                        document.querySelector("#scorePlayButton")?.click();
                    } else {
                        el.click();
                    }
                    break;
                }
                // Note: the "img" scroll pass is handled before this switch,
                // since it must run even when a token already exists.
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
                    ? // Time for the scroll pass to reach every page (it scrolls
                      // one page per `pageCooldown`) plus loading slack. Floor at
                      // 30s so large scores never time out prematurely — the
                      // cause of downloads stalling partway through.
                      Math.max(numPages * pageCooldown * 2 + 2100, 30 * 1000)
                    : 5 * 1000 /* 5s */
            );

            // Check the auths object periodically
            let interval = setInterval(() => {
                if (auths.hasOwnProperty(type + index)) {
                    clearTimeout(timer);
                    clearInterval(interval);
                    // one-shot delay (not setInterval, which would leak a timer
                    // that fires forever) — long for images to let them load
                    setTimeout(
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
    _fetch = getFetch(),
    setText?: (str: string) => void,
    pageCount?: number
): Promise<string> => {
    if (setText && pageCount) {
        const percent = Math.round(((index + 1) / pageCount) * 83);
        setText(`${percent}%`);
    }

    // Preferred path for images: use the real URL the player already fetched
    // with a valid token. This bypasses the MD5/token scheme that MuseScore
    // rotates and that causes HTTP 422 mid-download.
    if (type === "img") {
        const playerUrl = await getImgUrlFromPlayer(index, pageCount);
        if (playerUrl) {
            return playerUrl;
        }
        // else: fall through to the legacy token path below
    }

    const url = getApiUrl(id, type, index);
    let auth = await getApiAuth(id, type, index, scoreUrl);

    let r = await _fetch(url, {
        headers: {
            Authorization: auth,
        },
    });

    if (!r.ok) {
        auth = md5(`${id}${type}${index}9654,4e`).slice(0, 4);
        r = await _fetch(url, {
            headers: {
                Authorization: auth,
            },
        });

        if (!r.ok) {
            auth = await getApiAuthNetwork(type, index, pageCount);
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
    }

    const { info } = await r.json();
    return info.url as string;
};

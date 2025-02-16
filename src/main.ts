import "./meta";

import FileSaver from "file-saver";
import { waitForSheetLoaded } from "./utils";
import { downloadPDF } from "./pdf";
import { getFileUrl } from "./file";
import { BtnList, BtnAction, BtnListMode } from "./btn";
import { ScoreInfoInPage, SheetInfoInPage } from "./scoreinfo";
import i18nextInit, { i18next } from "./i18n/index";
import { isGmAvailable, _GM } from "./gm";

(async () => {
    await i18nextInit;
})();

if (isGmAvailable("registerMenuCommand")) {
    // add buttons to the userscript manager menu
    _GM.registerMenuCommand(
        "** " +
            i18next.t("version", { version: _GM.info.script.version }) +
            " **",
        () =>
            _GM.openInTab(
                "https://github.com/LibreScore/dl-librescore/releases",
                {
                    active: true,
                }
            )
    );

    _GM.registerMenuCommand("** " + i18next.t("source_code") + " **", () =>
        _GM.openInTab(_GM.info.script.homepage, { active: true })
    );

    _GM.registerMenuCommand("** Discord **", () =>
        _GM.openInTab("https://discord.gg/DKu7cUZ4XQ", { active: true })
    );
}

const { saveAs } = FileSaver;

const main = (): void => {
    let isMobile = !document.querySelector('button[title="Toggle Fullscreen"]');
    if (isMobile) {
        const parentDiv = document.querySelector("#jmuse-layout");
        const divs = parentDiv!.querySelectorAll("div");
        const validDiv = [...divs].find(
            (div) => div.querySelectorAll("button").length === 3
        );

        if (validDiv) {
            isMobile = false;
        }
    }
    new Promise(() => {
        let noSub = isMobile
            ? document.querySelector("#jmuse-scroller-component")!
                  .childElementCount <= 1
            : Array.from([
                  ...document.querySelectorAll("#jmuse-scroller-component div"),
              ]).some((el: HTMLDivElement) =>
                  el.innerText.startsWith("End of preview")
              );
        const scoreinfo = new ScoreInfoInPage(document);
        const btnList = new BtnList();
        let indvPartBtn: HTMLButtonElement | null = null;
        const fallback = () => {
            // btns fallback to load from MSCZ file (`Individual Parts`)
            return indvPartBtn?.click();
        };

        if (
            noSub &&
            (document.querySelector(
                "meta[property='musescore:author'][content='Official Scores']"
            ) ||
                document.querySelector(
                    "meta[property='musescore:author'][content='Official Author']"
                ))
        ) {
            btnList.add({
                name:
                    i18next.t("download", { fileType: "PDF" }) +
                    "\n(" +
                    i18next.t("official_button") +
                    ")",
                action: BtnAction.openUrl("https://musescore.com/upgrade"),
                tooltip: i18next.t("official_tooltip"),
            });
        } else {
            btnList.add({
                name: i18next.t("download", {
                    fileType: "PDF",
                }),
                action: BtnAction.process(
                    async (_, setText): Promise<void> => {
                        return downloadPDF(
                            scoreinfo,
                            new SheetInfoInPage(document),
                            saveAs,
                            setText
                        );
                    },

                    fallback,
                    3 * 60 * 1000 /* 3min */
                ),
            });
        }

        btnList.add({
            name: i18next.t("download", { fileType: "MIDI" }),
            action: BtnAction.download(
                () => getFileUrl(scoreinfo.id, "midi"),
                scoreinfo.fileName,
                fallback,
                30 * 1000 /* 30s */
            ),
        });

        btnList.add({
            name: i18next.t("download", { fileType: "MP3" }),
            action: BtnAction.download(
                () => getFileUrl(scoreinfo.id, "mp3"),
                scoreinfo.fileName,
                fallback,
                30 * 1000 /* 30s */
            ),
        });
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        btnList.commit(BtnListMode.InPage);
    });
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
waitForSheetLoaded().then(main);

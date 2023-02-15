import "./meta";

import FileSaver from "file-saver";
import { waitForSheetLoaded } from "./utils";
import { downloadPDF } from "./pdf";
import { getFileUrl } from "./file";
import { BtnList, BtnAction, BtnListMode } from "./btn";
import { ScoreInfoInPage, SheetInfoInPage } from "./scoreinfo";
import i18nextInit, { i18next } from "./i18n/index";

(async () => {
    await i18nextInit;
})();

const { saveAs } = FileSaver;

const main = (): void => {
    const btnList = new BtnList();
    const scoreinfo = new ScoreInfoInPage(document);
    const { fileName } = scoreinfo;

    let meta =
        document.querySelector(
            "meta[property='musescore:author'][content='Official Scores']"
        ) ||
        document.querySelector(
            "meta[property='musescore:author'][content='Official Author']"
        );

    if (meta) {
        btnList.add({
            name: i18next.t("official_button"),
            action: BtnAction.openUrl("https://musescore.com/upgrade"),
            tooltip: i18next.t("official_tooltip"),
        });
    } else {
        let indvPartBtn: HTMLButtonElement | null = null;
        const fallback = () => {
            // btns fallback to load from MSCZ file (`Individual Parts`)
            return indvPartBtn?.click();
        };

        btnList.add({
            name: i18next.t("download", { fileType: "PDF" }),
            action: BtnAction.process(
                () =>
                    downloadPDF(
                        scoreinfo,
                        new SheetInfoInPage(document),
                        saveAs
                    ),
                fallback,
                3 * 60 * 1000 /* 3min */
            ),
        });

        btnList.add({
            name: i18next.t("download", { fileType: "MIDI" }),
            action: BtnAction.download(
                () => getFileUrl(scoreinfo.id, "midi"),
                fallback,
                30 * 1000 /* 30s */
            ),
        });

        btnList.add({
            name: i18next.t("download", { fileType: "MP3" }),
            action: BtnAction.download(
                () => getFileUrl(scoreinfo.id, "mp3"),
                fallback,
                30 * 1000 /* 30s */
            ),
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    btnList.commit(BtnListMode.InPage);
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
waitForSheetLoaded().then(main);

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-void */

import fs from "fs";
import path from "path";
import os from "os";
import { setMscz } from "./mscz";
import { loadMscore, INDV_DOWNLOADS, WebMscore } from "./mscore";
import { ScoreInfoHtml, ScoreInfoObj } from "./scoreinfo";
import { fetchBuffer } from "./utils";
import { isNpx, getVerInfo } from "./npm-data";
import { getFileUrl } from "./file";
import { exportPDF } from "./pdf";
import i18nextInit, { i18next } from "./i18n/index";
import { InputFileFormat } from "webmscore/schemas";

(async () => {
    await i18nextInit;
})();

const inquirer: typeof import("inquirer") = require("inquirer");
const ora: typeof import("ora") = require("ora");
const chalk: typeof import("chalk") = require("chalk");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const argv: any = yargs(hideBin(process.argv))
    .usage(i18next.t("cli_usage_hint", { bin: "$0" }))
    .example(
        "$0 -i https://musescore.com/user/123/scores/456 -t mp3 -o " +
        process.cwd(),
        i18next.t("cli_example_url")
    )
    .example(
        "$0 -i " + i18next.t("path_to_folder") + " -t midi pdf",
        i18next.t("cli_example_folder")
    )
    .example(
        "$0 -i " + i18next.t("path_to_file") + ".mxl -t flac",
        i18next.t("cli_example_file")
    )
    .option("input", {
        alias: "i",
        type: "string",
        description: i18next.t("cli_option_input_description"),
        requiresArg: true,
    })
    .option("type", {
        alias: "t",
        type: "array",
        description: i18next.t("cli_option_type_description"),
        requiresArg: true,
        choices: [
            "midi",
            "mp3",
            "pdf",
            "mscz",
            "mscx",
            "musicxml",
            "flac",
            "ogg",
        ],
    })
    .option("output", {
        alias: "o",
        type: "string",
        description: i18next.t("cli_option_output_description"),
        requiresArg: true,
        default: process.cwd(),
    })
    .option("verbose", {
        alias: "v",
        type: "boolean",
        description: i18next.t("cli_option_verbose_description"),
    })
    .alias("help", "h")
    .alias("version", "V").argv;

const SCORE_URL_REG = /^(?:https?:\/\/)(?:(?:s|www)\.)?musescore\.com\/[^\s]+$/;

type ExpDlType = "midi" | "mp3" | "pdf";

interface Params {
    fileInit: string;
    confirmed: boolean;
    useExpDL: boolean;
    expDlTypes: ExpDlType[];
    part: number;
    types: number[];
    output: string;
}

const createSpinner = () => {
    return ora({
        text: i18next.t("processing"),
        color: "blue",
        spinner: "bounce",
        indent: 0,
    }).start();
};

const checkboxValidate = (input: number[]) => {
    return input.length >= 1;
};

const createDirectoryIfNotExist = (input: string) => {
    const dirExists = fs.existsSync(input)

    if (!dirExists) {
        fs.mkdirSync(input, { recursive: true })
    }
}

const getOutputDir = async (defaultOutput: string) => {
    let dirNotExistsTries = 0
    let lastTryDir: string | null = null

    const { output } = await inquirer.prompt<Params>({
        type: "input",
        name: "output",
        message: i18next.t("cli_output_message"),
        async validate (input: string) {
            if (!input) return false

            const dirExists = fs.existsSync(input)

            if (!dirExists) {
                if (lastTryDir !== input) {
                    lastTryDir = input
                    dirNotExistsTries = 0
                }

                dirNotExistsTries++

                if (dirNotExistsTries >= 2) {
                    fs.mkdirSync(input, { recursive: true })
                } else {
                    return i18next.t("cli_output_not_found")
                }
            }

            dirNotExistsTries = 0

            const isDirectory = fs.statSync(input).isDirectory()

            if (!isDirectory) {
                return i18next.t("cli_output_invalid")
            }

            try {
                fs.accessSync(input)
            } catch (e) {
                return e.message
            }

            return true
        },
        default: defaultOutput,
    });

    return output
}

void (async () => {
    if (!isNpx()) {
        const { installed, latest, isLatest } = await getVerInfo();
        if (!isLatest) {
            console.log(
                chalk.yellowBright(
                    i18next.t("cli_outdated_version_message", {
                        installed: installed,
                        latest: latest,
                    })
                )
            );
        }
    }

    let isInteractive = true;
    let types;
    let filetypes;

    // Check if both input and type arguments are used
    if (argv.input && argv.type) {
        isInteractive = false;
    }

    if (isInteractive) {
        argv.verbose = true;
        // Determine platform and paste message
        const platform = os.platform();
        let pasteMessage = "";
        if (platform === "win32") {
            pasteMessage = i18next.t("cli_windows_paste_hint");
        } else if (platform === "linux") {
            pasteMessage = i18next.t("cli_linux_paste_hint");
        } // For MacOS, no hint is needed because the paste shortcut is universal.

        // ask for the page url or path to local file
        const { fileInit } = await inquirer.prompt<Params>({
            type: "input",
            name: "fileInit",
            message: i18next.t("cli_input_message"),
            suffix:
                "\n  (" +
                i18next.t("cli_input_suffix") +
                `) ${chalk.bgGray(pasteMessage)}\n `,
            validate (input: string) {
                return (
                    input &&
                    (!!input.match(SCORE_URL_REG) ||
                        fs.statSync(input).isFile() ||
                        fs.statSync(input).isDirectory())
                );
            },
            default: argv.input,
        });

        argv.input = fileInit;
    }

    const spinner = createSpinner();

    // Check if input is a file or directory
    let isFile: boolean;
    let isDir: boolean;
    try {
        isFile = fs.lstatSync(argv.input).isFile();
        isDir = fs.lstatSync(argv.input).isDirectory();
    } catch (_) {
        isFile = false;
        isDir = false;
    }

    // Check if local file or directory
    if (isFile || isDir) {
        let filePaths: string[] = [];

        if (isDir) {
            if (!(argv.input.endsWith("/") || argv.input.endsWith("\\"))) {
                argv.input += "/";
            }
            await fs.promises
                .readdir(argv.input, { withFileTypes: true })
                .then((files) =>
                    files.forEach((file) => {
                        try {
                            if (file.isDirectory()) {
                                return;
                            }
                        } catch (err) {
                            spinner.fail(err.message);
                            return;
                        }
                        filePaths.push(argv.input + file.name);
                    })
                );

            if (isInteractive) {
                if (argv.type) {
                    argv.type[argv.type.findIndex((e) => e === "musicxml")] =
                        "mxl";
                    argv.type[argv.type.findIndex((e) => e === "midi")] = "mid";
                    types = argv.type.map((e) =>
                        INDV_DOWNLOADS.findIndex((f) => f.fileExt === e)
                    );
                }
                // build filetype choices
                const typeChoices = INDV_DOWNLOADS.map((d, i) => ({
                    name: d.name,
                    value: i,
                }));
                // filetype selection
                spinner.stop();
                types = await inquirer.prompt<Params>({
                    type: "checkbox",
                    name: "types",
                    message: i18next.t("cli_types_message"),
                    choices: typeChoices,
                    validate: checkboxValidate,
                    pageSize: Infinity,
                    default: types,
                });
                spinner.start();

                types = types.types;

                // output directory
                spinner.stop();
                const output = await getOutputDir(argv.output)
                spinner.start();
                argv.output = output;
            }
        } else {
            filePaths.push(argv.input);
        }

        await Promise.all(
            filePaths.map(async (filePath) => {
                createDirectoryIfNotExist(filePath)
                // validate input file
                if (!fs.statSync(filePath).isFile()) {
                    spinner.fail(i18next.t("cli_file_error"));
                    return;
                }

                if (!isInteractive) {
                    // validate types
                    if (argv.type.length === 0) {
                        spinner.fail(i18next.t("cli_type_error"));
                        return;
                    }
                }

                let inputFileExt = path.extname(filePath).substring(1);

                if (inputFileExt === "mid") {
                    inputFileExt = "midi";
                }
                if (
                    ![
                        "gp",
                        "gp3",
                        "gp4",
                        "gp5",
                        "gpx",
                        "gtp",
                        "kar",
                        "midi",
                        "mscx",
                        "mscz",
                        "musicxml",
                        "mxl",
                        "ptb",
                        "xml",
                    ].includes(inputFileExt)
                ) {
                    spinner.fail(i18next.t("cli_file_extension_error"));
                    return;
                }

                // get scoreinfo
                let scoreinfo = new ScoreInfoObj(
                    0,
                    path.basename(filePath, "." + inputFileExt)
                );

                // load file
                let score: WebMscore;
                let metadata: import("webmscore/schemas").ScoreMetadata;
                try {
                    // load local file
                    const data = await fs.promises.readFile(filePath);
                    await setMscz(scoreinfo, data.buffer);
                    if (argv.verbose) {
                        spinner.info(i18next.t("cli_file_loaded_message"));
                        spinner.start();
                    }
                    // load score using webmscore
                    score = await loadMscore(
                        inputFileExt as InputFileFormat,
                        scoreinfo
                    );

                    if (isInteractive && isFile) {
                        metadata = await score.metadata();
                    }

                    if (argv.verbose) {
                        spinner.info(i18next.t("cli_score_loaded_message"));
                    }
                } catch (err) {
                    if (isFile || argv.verbose) {
                        spinner.fail(err.message);
                    }
                    if (argv.verbose) {
                        spinner.info(i18next.t("cli_input_error"));
                    }
                    return;
                }

                let parts;
                if (isInteractive && isFile) {
                    // build part choices
                    const partChoices = metadata.excerpts.map((p) => ({
                        name: p.title,
                        value: p.id,
                    }));
                    // console.log(partChoices);
                    // add the "full score" option as a "part"
                    partChoices.unshift({
                        value: -1,
                        name: i18next.t("full_score"),
                    });

                    // part selection
                    spinner.stop();
                    parts = await inquirer.prompt<Params>({
                        type: "checkbox",
                        name: "parts",
                        message: i18next.t("cli_parts_message"),
                        choices: partChoices,
                        validate: checkboxValidate,
                        pageSize: Infinity,
                    });
                    spinner.start();
                    // console.log(parts);
                    parts = partChoices.filter((e) =>
                        parts.parts.includes(e.value)
                    );
                    // console.log(parts);
                } else {
                    parts = [{ name: i18next.t("full_score"), value: -1 }];
                }

                if (argv.type) {
                    argv.type[argv.type.findIndex((e) => e === "musicxml")] =
                        "mxl";
                    argv.type[argv.type.findIndex((e) => e === "midi")] = "mid";
                    types = argv.type.map((e) =>
                        INDV_DOWNLOADS.findIndex((f) => f.fileExt === e)
                    );
                }
                if (isInteractive && isFile) {
                    // build filetype choices
                    const typeChoices = INDV_DOWNLOADS.map((d, i) => ({
                        name: d.name,
                        value: i,
                    }));
                    // filetype selection
                    spinner.stop();
                    types = await inquirer.prompt<Params>({
                        type: "checkbox",
                        name: "types",
                        message: i18next.t("cli_types_message"),
                        choices: typeChoices,
                        validate: checkboxValidate,
                        pageSize: Infinity,
                        default: types,
                    });
                    spinner.start();

                    types = types.types;
                }

                filetypes = types.map((i) => INDV_DOWNLOADS[i]);

                if (isInteractive && isFile) {
                    // output directory
                    spinner.stop();
                    const output = await getOutputDir(argv.output)
                    spinner.start();
                    argv.output = output;
                }

                createDirectoryIfNotExist(argv.output)

                // validate output directory
                try {
                    await fs.promises.access(argv.output);
                } catch (err) {
                    spinner.fail(err.message);
                    return;
                }

                // export files
                const fileName =
                    scoreinfo.fileName || (await score.titleFilenameSafe());
                // spinner.start();
                for (const type of filetypes) {
                    for (const part of parts) {
                        // select part
                        await score.setExcerptId(part.value);

                        // generate file data
                        const data = await type.action(score);

                        // save to filesystem
                        const n = `${fileName} - ${part.name}.${type.fileExt}`;
                        const f = path.join(argv.output, n);
                        await fs.promises.writeFile(f, data);
                        if (argv.verbose) {
                            spinner.info(
                                i18next.t("cli_saved_message", {
                                    file: chalk.underline(f),
                                })
                            );
                        }
                    }
                }
            })
        );
        spinner.succeed(i18next.t("cli_done_message"));
        return;
    } else {
        // validate input URL
        if (!argv.input.match(SCORE_URL_REG)) {
            spinner.fail(i18next.t("cli_url_error"));
            return;
        }
        argv.input = argv.input.match(SCORE_URL_REG)[0];

        // validate types
        if (!isInteractive) {
            if (argv.type.length === 0) {
                spinner.fail(i18next.t("cli_type_error"));
                return;
            } else if (
                ["mscz", "mscx", "musicxml", "flac", "ogg"].some((e) =>
                    argv.type.includes(e)
                )
            ) {
                // Fail since user cannot download these types from a URL
                spinner.fail(i18next.t("cli_url_type_error"));
                return;
            }
        }

        // request scoreinfo
        let scoreinfo: ScoreInfoHtml = await ScoreInfoHtml.request(argv.input);

        // validate musescore URL
        if (scoreinfo.id === 0) {
            spinner.fail(i18next.t("cli_score_not_found"));
            return;
        }

        if (isInteractive) {
            // confirmation
            spinner.stop();
            const { confirmed } = await inquirer.prompt<Params>({
                type: "confirm",
                name: "confirmed",
                message: i18next.t("cli_confirm_message"),
                prefix:
                    `${chalk.yellow("!")} ` +
                    i18next.t("id", { id: scoreinfo.id }) +
                    "\n  " +
                    i18next.t("title", { title: scoreinfo.title }) +
                    "\n ",
                default: true,
            });
            if (!confirmed) return;

            // print a blank line
            console.log();
            spinner.start();
        } else {
            // print message if verbosity is enabled
            if (argv.verbose) {
                spinner.stop();
                console.log(
                    `${chalk.yellow("!")} ` +
                    i18next.t("id", { id: scoreinfo.id }) +
                    "\n  " +
                    i18next.t("title", { title: scoreinfo.title }) +
                    "\n "
                );
                spinner.start();
            }
        }

        if (argv.type) {
            types = argv.type;
        }
        if (isInteractive) {
            // filetype selection
            spinner.stop();
            types = await inquirer.prompt<Params>({
                type: "checkbox",
                name: "types",
                message: i18next.t("cli_types_message"),
                choices: ["midi", "mp3", "pdf"],
                validate: checkboxValidate,
                pageSize: Infinity,
                default: types,
            });
            types = types.types;

            // output directory
            const output = await getOutputDir(argv.output)
            spinner.start();
            argv.output = output;
        }

        createDirectoryIfNotExist(argv.output)

        // validate output directory
        try {
            await fs.promises.access(argv.output);
        } catch (err) {
            spinner.fail(err.message);
            return;
        }

        await Promise.all(
            types.map(async (type) => {
                // download/generate file data
                let fileExt: String;
                let fileData: Buffer;
                switch (type) {
                    case "midi": {
                        fileExt = "mid";
                        const fileUrl = await getFileUrl(scoreinfo.id, "midi");
                        fileData = await fetchBuffer(fileUrl);
                        break;
                    }
                    case "mp3": {
                        fileExt = "mp3";
                        const fileUrl = await getFileUrl(scoreinfo.id, "mp3");
                        fileData = await fetchBuffer(fileUrl);
                        break;
                    }
                    case "pdf": {
                        fileExt = "pdf";
                        fileData = Buffer.from(
                            await exportPDF(scoreinfo, scoreinfo.sheet)
                        );
                        break;
                    }
                }

                // save to filesystem
                const f = path.join(
                    argv.output,
                    `${scoreinfo.fileName}.${fileExt}`
                );
                await fs.promises.writeFile(f, fileData);
                if (argv.verbose) {
                    spinner.info(
                        i18next.t("cli_saved_message", {
                            file: chalk.underline(f),
                        })
                    );
                }
            })
        );

        spinner.succeed(i18next.t("cli_done_message"));
        return;
    }
})();

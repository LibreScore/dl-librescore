import fs from "fs";
import os from "os";
import path from "path";
import { spawn, ChildProcess } from "child_process";

// Keep ws external to the CLI bundle so optional native accelerators still work.
const WebSocketImpl: typeof WebSocket = require("ws");

type CdpResponse = {
    id?: number;
    result?: any;
    error?: { message: string };
};

type PendingRequest = {
    resolve: (value: any) => void;
    reject: (reason: Error) => void;
};

const findBrowser = (): string => {
    const candidates = [
        process.env.CHROME_PATH,
        process.platform === "win32"
            ? path.join(
                  process.env.PROGRAMFILES || "C:\\Program Files",
                  "Google/Chrome/Application/chrome.exe"
              )
            : undefined,
        process.platform === "win32"
            ? path.join(
                  process.env["PROGRAMFILES(X86)"] ||
                      "C:\\Program Files (x86)",
                  "Google/Chrome/Application/chrome.exe"
              )
            : undefined,
        process.platform === "win32" && process.env.LOCALAPPDATA
            ? path.join(
                  process.env.LOCALAPPDATA,
                  "Google/Chrome/Application/chrome.exe"
              )
            : undefined,
        process.platform === "win32"
            ? path.join(
                  process.env.PROGRAMFILES || "C:\\Program Files",
                  "Microsoft/Edge/Application/msedge.exe"
              )
            : undefined,
        process.platform === "win32"
            ? path.join(
                  process.env["PROGRAMFILES(X86)"] ||
                      "C:\\Program Files (x86)",
                  "Microsoft/Edge/Application/msedge.exe"
              )
            : undefined,
        process.platform === "darwin"
            ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            : undefined,
        process.platform === "darwin"
            ? "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
            : undefined,
        process.platform === "linux" ? "/usr/bin/google-chrome" : undefined,
        process.platform === "linux"
            ? "/usr/bin/google-chrome-stable"
            : undefined,
        process.platform === "linux" ? "/usr/bin/chromium" : undefined,
        process.platform === "linux" ? "/usr/bin/chromium-browser" : undefined,
        process.platform === "linux" ? "/usr/bin/microsoft-edge" : undefined,
    ];

    const browser = candidates.find(
        (candidate): candidate is string =>
            typeof candidate === "string" && fs.existsSync(candidate)
    );
    if (!browser) {
        throw new Error(
            "MuseScore blocked the direct request and Chrome or Edge was not found. " +
                "Install one of them or set CHROME_PATH to the browser executable."
        );
    }
    return browser;
};

class BrowserFetchSession {
    private readonly pending = new Map<number, PendingRequest>();
    private nextId = 1;
    private sessionId = "";
    private scoreHtml = "";

    private constructor(
        private readonly browserProcess: ChildProcess,
        private readonly socket: WebSocket,
        private readonly scoreUrl: string
    ) {
        socket.addEventListener("message", (event) => {
            const message = JSON.parse(String(event.data)) as CdpResponse;
            if (!message.id) return;
            const request = this.pending.get(message.id);
            if (!request) return;
            this.pending.delete(message.id);
            if (message.error) {
                request.reject(new Error(message.error.message));
            } else {
                request.resolve(message.result);
            }
        });
        socket.addEventListener("close", () => {
            const error = new Error("The browser connection closed unexpectedly");
            this.pending.forEach(({ reject }) => reject(error));
            this.pending.clear();
        });
    }

    static async launch(url: string): Promise<BrowserFetchSession> {
        const profileDir = path.join(
            os.tmpdir(),
            "dl-librescore-browser-profile-v2"
        );
        fs.mkdirSync(profileDir, { recursive: true });
        // Port 0 makes Chromium expose navigator.webdriver, which causes
        // Cloudflare's verification to loop. Any normal nonzero port avoids it.
        const debugPort = 49152 + Math.floor(Math.random() * 16383);
        const browserProcess = spawn(
            findBrowser(),
            [
                `--remote-debugging-port=${debugPort}`,
                `--user-data-dir=${profileDir}`,
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-component-update",
                url,
            ],
            { stdio: ["ignore", "ignore", "pipe"] }
        );

        try {
            const wsUrl = await new Promise<string>((resolve, reject) => {
                let stderr = "";
                const timer = setTimeout(() => {
                    reject(new Error("Timed out while starting the browser"));
                }, 15000);

                browserProcess.stderr!.on("data", (chunk: Buffer) => {
                    stderr += chunk.toString();
                    const match = stderr.match(/DevTools listening on (ws:\/\/\S+)/);
                    if (match) {
                        clearTimeout(timer);
                        resolve(match[1]);
                    }
                });
                browserProcess.once("error", (error) => {
                    clearTimeout(timer);
                    reject(error);
                });
                browserProcess.once("exit", (code) => {
                    clearTimeout(timer);
                    reject(
                        new Error(`Browser exited before connecting (${code})`)
                    );
                });
            });

            const socket = new WebSocketImpl(wsUrl);
            await new Promise<void>((resolve, reject) => {
                socket.addEventListener("open", () => resolve(), { once: true });
                socket.addEventListener(
                    "error",
                    () => reject(new Error("Could not connect to the browser")),
                    { once: true }
                );
            });

            const browser = new BrowserFetchSession(
                browserProcess,
                socket,
                url
            );
            await browser.attachToScoreTab(url);
            return browser;
        } catch (error) {
            browserProcess.kill();
            throw error;
        }
    }

    private send(method: string, params: any = {}, sessionId?: string) {
        const id = this.nextId++;
        return new Promise<any>((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            this.socket.send(JSON.stringify({ id, method, params, sessionId }));
        });
    }

    private async attachToScoreTab(url: string): Promise<void> {
        const deadline = Date.now() + 15000;
        let targetId = "";

        while (!targetId && Date.now() < deadline) {
            const { targetInfos } = await this.send("Target.getTargets");
            const target = targetInfos.find(
                (info: any) =>
                    info.type === "page" &&
                    (info.url === url ||
                        info.url.startsWith("https://musescore.com/"))
            );
            targetId = target?.targetId || "";
            if (!targetId) {
                await new Promise((resolve) => setTimeout(resolve, 200));
            }
        }
        if (!targetId) throw new Error("Could not find the MuseScore browser tab");

        const attached = await this.send("Target.attachToTarget", {
            targetId,
            flatten: true,
        });
        this.sessionId = attached.sessionId;
        await this.send("Runtime.enable", {}, this.sessionId);
    }

    async waitForScorePage(): Promise<void> {
        const deadline = Date.now() + 120000;
        while (Date.now() < deadline) {
            const result = await this.evaluate(`(() => {
                const score = window.UGAPP?.store?.page?.data?.score || {};
                const image = document.querySelector('img[src*="score_0"]');
                return {
                    html: document.documentElement?.outerHTML || "",
                    metadata: {
                        pagesCount: score.pages_count,
                        imageWidth: image?.naturalWidth,
                        imageHeight: image?.naturalHeight
                    }
                };
            })()`);
            if (/musescore:\/\/score\/\d+/.test(result.html)) {
                const { pagesCount, imageWidth, imageHeight } = result.metadata;
                if (pagesCount > 0 && imageWidth > 0 && imageHeight > 0) {
                    this.scoreHtml =
                        result.html +
                        `<script type="application/json">${JSON.stringify({
                            dimensions: `${imageWidth}x${imageHeight}`,
                            pages: pagesCount,
                        })}</script>`;
                    return;
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        throw new Error(
            "MuseScore's browser verification did not finish. Complete it in the browser window and try again."
        );
    }

    private async evaluate(expression: string): Promise<any> {
        const { result, exceptionDetails } = await this.send(
            "Runtime.evaluate",
            { expression, awaitPromise: true, returnByValue: true },
            this.sessionId
        );
        if (exceptionDetails) {
            throw new Error(
                exceptionDetails.exception?.description ||
                    exceptionDetails.text ||
                    "Browser evaluation failed"
            );
        }
        return result.value;
    }

    async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
        const url = typeof input === "string" ? input : input.url;
        if (
            url === this.scoreUrl &&
            (!init?.method || init.method.toUpperCase() === "GET") &&
            this.scoreHtml
        ) {
            return new Response(this.scoreHtml, {
                headers: { "content-type": "text/html; charset=utf-8" },
            });
        }
        const request = JSON.stringify({
            url,
            init: {
                method: init?.method,
                headers: init?.headers,
                body: init?.body,
            },
        });
        const response = await this.evaluate(`(async () => {
            const request = ${request};
            const response = await fetch(request.url, request.init);
            const bytes = new Uint8Array(await response.arrayBuffer());
            let binary = "";
            for (let i = 0; i < bytes.length; i += 32768) {
                binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
            }
            return {
                status: response.status,
                body: btoa(binary)
            };
        })()`);
        const body = Buffer.from(response.body, "base64");
        return new Response(body, {
            status: response.status,
        });
    }

    async close(): Promise<void> {
        try {
            await this.send("Browser.close");
        } catch {}
        this.socket.close();
        if (this.browserProcess.exitCode === null) {
            await Promise.race([
                new Promise<void>((resolve) =>
                    this.browserProcess.once("exit", () => resolve())
                ),
                new Promise<void>((resolve) =>
                    setTimeout(() => {
                        this.browserProcess.kill();
                        resolve();
                    }, 5000)
                ),
            ]);
        }
    }
}

let session: BrowserFetchSession | undefined;

export const getBrowserFetch = async (url: string): Promise<typeof fetch> => {
    if (!session) {
        session = await BrowserFetchSession.launch(url);
        await session.waitForScorePage();
    }
    return session.fetch.bind(session) as typeof fetch;
};

export const closeBrowserFetch = async (): Promise<void> => {
    if (!session) return;
    const current = session;
    session = undefined;
    await current.close();
};

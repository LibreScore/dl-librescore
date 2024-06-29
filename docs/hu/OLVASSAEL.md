<div dir="ltr" align="left">

‎[čeština](/docs/cs/PŘEČTĚTEMĚ.md) | ‎[English](/docs/en/README.md) | ‎[español](/docs/es/LÉAME.md) | ‎[français](/docs/fr/LISEZMOI.md) | ‎**magyar** | ‎[Melayu](/docs/ms/BACASAYA.md) | ‎[русский](/docs/ru/ПРОЧТИМЕНЯ.md) | ‎[简体中文](/docs/zh-Hans/自述文件.md) | ‎[[+]](https://weblate.librescore.org/projects/librescore/docs)

[//]: # "\+\_==!|!=_=!|!==_/+/ ***NE MÓDOSÍTS SEMMIT E SOR FELETT*** /+/^^+#|#+^+#|#+^^\+\"

# dl-librescore

<div align="center">

<img src="https://github.com/LibreScore/dl-musescore/raw/master/images/logo.png" width="256" alt="LibreScore logó">

[![Discord](https://img.shields.io/discord/774491656643674122?color=5865F2&label=&labelColor=555555&logo=discord&logoColor=FFFFFF)](https://discord.gg/DKu7cUZ4XQ) [![Weblate](https://weblate.librescore.org/widgets/librescore/-/dl-librescore/svg-badge.svg)](https://weblate.librescore.org/engage/librescore) [![Github minden verzió](https://img.shields.io/github/downloads/LibreScore/app-librescore/total.svg?label=App)](https://github.com/LibreScore/app-librescore/releases/latest) [![Github minden verzió](https://img.shields.io/github/downloads/LibreScore/dl-librescore/total.svg?label=Userscript)](https://github.com/LibreScore/dl-librescore/releases/latest) [![npm](https://img.shields.io/npm/dt/dl-librescore?label=Parancssoros+eszköz)](https://www.npmjs.com/package/dl-librescore)

Kotta letöltése

</div>

> NYILATKOZAT: Ez nem egy hivatalosan jóváhagyott MuseScore termék

## Telepítés

4 különböző telepíthető program van:

| Program                                                                            | MSCZ | MIDI | MP3 | PDF | Konvertálás |     | Windows | macOS | Linux | Android | iOS/iPadOS |
| ---------------------------------------------------------------------------------- | ---- | ---- | --- | --- | ---------- | --- | ------- | ----- | ----- | ------- | ---------- |
| [App](#app)                             | ✔️   | ✔️   | ✔️  | ❌  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Userscript](#userscript)               | ❌   | ✔️   | ✔️  | ✔️  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |
| [Parancssoros eszköz](#parancssoros-eszköz) | ❌   | ✔️   | ✔️  | ✔️  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Webmscore webhely](#webmscore-webhely) | ❌   | ❌   | ❌  | ❌  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |

> Megjegyzés: A `Konvertálás` a fájltípus megváltoztatására használható, olyan fájl típusra is konvertálhatsz amiben esetleg nem is tudtad letölteni a kottát.
> Ezekre lehet konvertálni: Külön kivonatok, PDF, PNG, SVG, MP3, WAV, FLAC, OGG, MIDI, MusicXML, MSCZ és MSCX.

### App

1. Menjen aa `app-librescore` tárhely [OLVASSAEL](https://github.com/LibreScore/app-librescore/blob/master/docs/hu/OLVASSAEL.md#telepítés) oldalára
2. Kövesse a telepítési utasításokat az eszközödhöz

### Userscript

> Megjegyzés: Ha eszköze iOS vagy iPadOS operációs rendszert használ, kövesse a [Parancsok](#parancsok) utasításokat.
>
> Megjegyzés: Ha nem tud böngésző bővítményeket telepíteni eszközére, kövesse a [Könyvjelző](#könyvjelző) utasításokat.

#### Böngésző bővítmény

1. Telepítse [Tampermonkey](https://www.tampermonkey.net)

> Megjegyzés: Ha korábban már telepítetted a "musescore-downloader", "mcsz downloader", "mcsz downloader" vagy "musescore-dl" nevű script egy régebbi verzióját, távolítsd el a Tampermonkey kezelőfalról.

2. Nyissa meg a legújabb [dl-librescore.user.js](https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js) fájlt
3. Nyomja meg a Telepítés gombot

#### Parancsok

1. Telepítse a [LibreScore parancsot](https://www.icloud.com/shortcuts/901d8778d2da4f7db9272d3b2232d0fe)
2. A Safariban, amikor egy dalt néz meg a MuseScore-on, érintse meg a <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/01f5a9889bbecc202d8cbb3067a261ad.png" height="16">
3. Érintse meg a LibreScore parancsot a bővítmény aktiválásához

> Megjegyzés: Mielőtt futtathatna JavaScriptet egy parancsból, be kell kapcsolnia Szkriptek futtatásának engedélyezése lehetőséget.
>
> 1. Válassza a Beállítások <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/492fec5aff74dbdef9b526177c3804b4.png" height="16"> > Parancsok > Haladó menüpontot.
> 2. Kapcsolja be a Szkriptek futtatásának engedélyezése lehetőséget.

#### Könyvjelző

1. Hozzon létre egy új könyvjelzőt (általában Ctrl+D)
2. Írja be a `LibreScore` szót a Név mezőbe
3. Írja be a következőt `javascript:(function () {let code = document.createElement('script');code.src = 'https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js';document.body.appendChild(code);}())` az URL mezőben
4. Mentse el a könyvjelzőt
5. Amikor egy dalt néz meg a MuseScore-on, kattintson a könyvjelzőre a bővítmény aktiválásához

### Parancssoros eszköz

1. Telepítse a [Node.js LTS-t](https://nodejs.org)
2. Nyisson meg egy terminált (_ne_ nyissa meg a Node.js alkalmazást)
3. Írja be, hogy `npx dl-librescore@latest`, majd nyomja meg az `Enter ↵` billentyűt

### Webmscore webhely

1. [Webmscore](https://webmscore-pwa.librescore.org) megnyitása

> Megjegyzés: A webhelyet offline is elérheti, ha PWA-ként telepíti

## Összeállítás

1. Telepítse a [Node.js LTS-t](https://nodejs.org)
2. `npm install` a csomagok telepítéséhez
3. `npm run build` a fordításhoz

- Telepítse a `./dist/main.user.js` fájlt a Tampermonkey segítségével
- `node ./dist/cli.js` a parancssori eszköz futtatásához

</div>

<div dir="ltr" align="left">

‎**čeština** | ‎[English](/docs/en/README.md) | ‎[español](/docs/es/LÉAME.md) | ‎[français](/docs/fr/LISEZMOI.md) | ‎[magyar](/docs/hu/OLVASSAEL.md) | ‎[Melayu](/docs/ms/BACASAYA.md) | ‎[[+]](https://librescore.ddns.net/projects/librescore/docs)

[//]: # "\+\_==!|!=_=!|!==_/+/ ***NEUPRAVUJTE NAD TENTO ŘÁDEK*** /+/^^+#|#+^+#|#+^^\+\"

# dl-librescore

<div align="center">

<img src="https://github.com/LibreScore/dl-musescore/raw/master/images/logo.png" width="256" alt="Logo LibreScore">

[![Discord](https://img.shields.io/discord/774491656643674122?color=5865F2&label=&labelColor=555555&logo=discord&logoColor=FFFFFF)](https://discord.gg/DKu7cUZ4XQ) [![Weblate](https://librescore.ddns.net/widgets/librescore/-/dl-librescore/svg-badge.svg)](https://librescore.ddns.net/engage/librescore) [![GitHub Všechna Vydání](https://img.shields.io/github/downloads/LibreScore/app-librescore/total.svg?label=App)](https://github.com/LibreScore/app-librescore/releases/latest) [![GitHub Všechna Vydání](https://img.shields.io/github/downloads/LibreScore/dl-librescore/total.svg?label=Uživatelský+skript)](https://github.com/LibreScore/dl-librescore/releases/latest) [![npm](https://img.shields.io/npm/dt/dl-librescore?label=Nástroj+příkazového+řádku)](https://www.npmjs.com/package/dl-librescore)

Stáhnout noty

</div>

> UPOZORNĚNÍ: Toto není oficiálně schválený produkt MuseScore

## Instalace

Existují 4 různé instalovatelné programy:

| Program                                                                            | MSCZ | MIDI | MP3 | PDF | Konverze |     | Windows | macOS | Linux | Android | iOS/iPadOS |
| ---------------------------------------------------------------------------------- | ---- | ---- | --- | --- | ---------- | --- | ------- | ----- | ----- | ------- | ---------- |
| [Aplikace](#aplikace)                             | ✔️   | ✔️   | ✔️  | ❌  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Uživatelský skript](#uživatelský-skript)               | ❌   | ✔️   | ✔️  | ✔️  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |
| [Nástroj příkazového řádku](#nástroj-příkazového-řádku) | ❌   | ✔️   | ✔️  | ✔️  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Webové stránky Webmscore](#webové-stránky-webmscore) | ❌   | ❌   | ❌  | ❌  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |

> Poznámka: `Konverze` odkazuje na schopnost převádět soubory na jiné typy souborů, včetně těch, které nelze stáhnout v programu.
> Mezi typy převodu patří: Jednotlivé části, PDF, PNG, SVG, MP3, WAV, FLAC, OGG, MIDI, MusicXML, MSCZ a MSCX.

### Aplikace

1. Přejděte na stránku [PŘEČTĚTEMĚ](https://github.com/LibreScore/app-librescore/blob/master/docs/cs/PŘEČTĚTEMĚ.md#instalace) v repozitáři `app-librescore`
2. Postupujte podle pokynů k instalaci vašeho zařízení

### Uživatelský skript

> Poznámka: Pokud máte zařízení se systémem iOS nebo iPadOS, postupujte podle pokynů [Zkratka](#zkratka).
>
> Poznámka: Pokud do zařízení nemůžete nainstalovat rozšíření prohlížeče, postupujte podle pokynů [Záložka](#záložka).

#### Rozšíření prohlížeče

1. Nainstalujte [Tampermonkey](https://www.tampermonkey.net)

> Poznámka: Pokud jste již nainstalovali starou verzi skriptu s názvem „musescore-downloader“, „mcsz downloader“ nebo „musescore-dl“, odinstalujte ji prosím z řídicího panelu Tampermonkey

2. Přejděte na nejnovější soubor [dl-librescore.user.js](https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js)
3. Stiskněte tlačítko Instalovat

#### Zkratka

1. Nainstalujte [zkratku LibreScore](https://www.icloud.com/shortcuts/901d8778d2da4f7db9272d3b2232d0fe)
2. V Safari při prohlížení skladby na MuseScore klepněte na <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/01f5a9889bbecc202d8cbb3067a261ad.png" height="16">
3. Klepnutím na zkratku LibreScore aktivujte rozšíření

> Poznámka: Před spuštěním JavaScriptu pomocí zkratky musíte zapnout volbu Povolit spouštění skriptů
>
> 1. Přejděte do Nastavení <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/492fec5aff74dbdef9b526177c3804b4.png" height="16"> > Zkratky > Pokročilé
> 2. Zapněte „Povolit spouštění skriptů“

#### Záložka

1. Vytvořte novou záložku (obvykle Ctrl+D)
2. Do pole Název napište `LibreScore`
3. Zadejte `javascript:(function () {let code = document.createElement('script');code.src = 'https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js';document.body.appendChild(code);}())` pro pole URL
4. Uložte záložku
5. Při prohlížení skladby v MuseScore aktivujte rozšíření kliknutím na záložku

### Nástroj příkazového řádku

1. Nainstalujte [Node.js LTS](https://nodejs.org)
2. Otevřete terminál (*ne*otevírejte aplikaci Node.js)
3. Napište `npx dl-librescore@latest` a stiskněte `Enter ↵`

### Webové stránky Webmscore

1. Otevřete [Webmscore](https://librescore.github.io)

> Poznámka: K webu můžete přistupovat offline, pokud si jej nainstalujete jako PWA

## Kompilace

1. Nainstalujte [Node.js LTS](https://nodejs.org)
2. `npm install` pro instalaci balíčků
3. `npm run build` ke kompilaci

- Nainstalujte `./dist/main.user.js` pomocí Tampermonkey
- `node ./dist/cli.js` pro spuštění nástroje příkazového řádku

</div>

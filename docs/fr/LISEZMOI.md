<div dir="ltr" align="left">

‎[čeština](/docs/cs/PŘEČTĚTEMĚ.md) | ‎[English](/docs/en/README.md) | ‎[español](/docs/es/LÉAME.md) | ‎**français** | ‎[magyar](/docs/hu/OLVASSAEL.md) | ‎[Melayu](/docs/ms/BACASAYA.md) | ‎[русский](/docs/ru/ПРОЧТИМЕНЯ.md) | ‎[简体中文](/docs/zh-Hans/自述文件.md) | ‎[[+]](https://weblate.librescore.org/projects/librescore/docs)

[//]: # "\+\_==!|!=_=!|!==_/+/ ***NE MODIFIEZ PAS AU-DESSUS DE CETTE LIGNE*** /+/^^+#|#+^+#|#+^^\+\"

# dl-librescore

<div align="center">

<img src="https://github.com/LibreScore/dl-musescore/raw/master/images/logo.png" width="256" alt="Logo de LibreScore">

[![Discord](https://img.shields.io/discord/774491656643674122?color=5865F2&label=&labelColor=555555&logo=discord&logoColor=FFFFFF)](https://discord.gg/DKu7cUZ4XQ) [![Weblate](https://weblate.librescore.org/widgets/librescore/-/dl-librescore/svg-badge.svg)](https://weblate.librescore.org/engage/librescore) [![GitHub toutes les versions](https://img.shields.io/github/downloads/LibreScore/app-librescore/total.svg?label=App)](https://github.com/LibreScore/app-librescore/releases/latest) [![GitHub toutes les versions](https://img.shields.io/github/downloads/LibreScore/dl-librescore/total.svg?label=Script+utilisateur)](https://github.com/LibreScore/dl-librescore/releases/latest) [![npm](https://img.shields.io/npm/dt/dl-librescore?label=Outil+de+ligne-de-commande)](https://www.npmjs.com/package/dl-librescore)

Télécharger des partitions

</div>

> AVIS DE NON-RESPONSABILITÉ : Ceci n'est pas un produit MuseScore officiellement approuvé

## Installation

Il existe 4 programmes installables différents :

| Programme                                                                            | MSCZ | MIDI | MP3 | PDF | Conversion |     | Windows | macOS | Linux | Android | iOS/iPadOS |
| ---------------------------------------------------------------------------------- | ---- | ---- | --- | --- | ---------- | --- | ------- | ----- | ----- | ------- | ---------- |
| [App](#app)                             | ✔️   | ✔️   | ✔️  | ❌  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Script utilisateur](#script-utilisateur)               | ❌   | ✔️   | ✔️  | ✔️  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |
| [Outil de ligne-de-commande](#outil-de-ligne-de-commande) | ❌   | ✔️   | ✔️  | ✔️  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Site web de Webmscore](#site-web-de-webmscore) | ❌   | ❌   | ❌  | ❌  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |

> Remarque : `Conversion` fait référence à la possibilité de convertir des fichiers en d'autres types de fichiers, y compris ceux qui ne sont pas téléchargeables dans le programme.
> Les types de conversion incluent : Parties individuelles, PDF, PNG, SVG, MP3, WAV, FLAC, OGG, MIDI, MusicXML, MSCZ et MSCX.

### App

1. Allez sur la page [LISEZMOI](https://github.com/LibreScore/app-librescore/blob/master/docs/fr/LISEZMOI.md#installation) du dépôt `app-librescore`
2. Suivez les instructions d'installation de votre appareil

### Script utilisateur

> Remarque : Si votre appareil est sous iOS ou iPadOS, veuillez suivre les instructions [Raccourci](#raccourci).
>
> Remarque : Si vous ne parvenez pas à installer les extensions de navigateur sur votre appareil, veuillez plutôt suivre les instructions [Marque-page](#marque-page).

#### Extension de navigateur

1. Installez [Tampermonkey](https://www.tampermonkey.net)

> Remarque : Si vous avez déjà installé une ancienne version du script appelée « musescore-downloader », « mcsz downloader » ou « musescore-dl », veuillez la désinstaller depuis le tableau de bord Tampermonkey

2. Accédez au dernier fichier [dl-librescore.user.js](https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js)
3. Appuyez sur le bouton Installer

#### Raccourci

1. Installez le [raccourci LibreScore](https://www.icloud.com/shortcuts/901d8778d2da4f7db9272d3b2232d0fe)
2. Dans Safari, lors de l'affichage d'une chanson sur MuseScore, appuyez sur <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/01f5a9889bbecc202d8cbb3067a261ad.png" height="16">
3. Appuyez sur le raccourci LibreScore pour activer l'extension

> Remarque : Avant de pouvoir exécuter JavaScript depuis un raccourci, vous devez activer « Autoriser l’exécution de scripts »
>
> 1. Accédez à Réglages <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/492fec5aff74dbdef9b526177c3804b4.png" height="16"> > Raccourcis > Avancés
> 2. Activez « Autoriser l’exécution de scripts »

#### Marque-page

1. Créez un nouveau marque-page (généralement Ctrl+D)
2. Tapez `LibreScore` pour le champ Nom
3. Tapez `javascript:(function () {let code = document.createElement('script');code.src = 'https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js';document.body.appendChild(code);}())` pour le champ URL
4. Enregistrez le marque-page
5. Lors de l'affichage d'une chanson sur MuseScore, cliquez sur le marque-page pour activer l'extension

### Outil de ligne-de-commande

1. Installez [Node.js LTS](https://nodejs.org/fr)
2. Ouvrez un terminal (n'ouvrez _pas_ l'application Node.js)
3. Tapez `npx dl-librescore@latest`, puis appuyez sur `Entrée ↵`

### Site web de Webmscore

1. Ouvrez [Webmscore](https://webmscore-pwa.librescore.org)

> Remarque : Vous pouvez accéder au site web hors ligne en l'installant en tant que PWA

## Compilation

1. Installez [Node.js LTS](https://nodejs.org/fr)
2. `npm install` pour installer les packages
3. `npm run build` pour compiler

- Installez `./dist/main.user.js` avec Tampermonkey
- `node ./dist/cli.js` pour exécuter l'outil de ligne-de-commande

</div>

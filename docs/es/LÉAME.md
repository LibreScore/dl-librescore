<div dir="ltr" align="left">

‎[čeština](/docs/cs/PŘEČTĚTEMĚ.md) | ‎[English](/docs/en/README.md) | ‎**español** | ‎[français](/docs/fr/LISEZMOI.md) | ‎[magyar](/docs/hu/OLVASSAEL.md) | ‎[Melayu](/docs/ms/BACASAYA.md) | ‎[[+]](https://librescore.ddns.net/projects/librescore/docs)

[//]: # "\+\_==!|!=_=!|!==_/+/ ***NO EDITAR ENCIMA DE ESTA LÍNEA*** /+/^^+#|#+^+#|#+^^\+\"

# dl-librescore

<div align="center">

<img src="https://github.com/LibreScore/dl-musescore/raw/master/images/logo.png" width="256" alt="Logotipo de LibreScore">

[![Discord](https://img.shields.io/discord/774491656643674122?color=5865F2&label=&labelColor=555555&logo=discord&logoColor=FFFFFF)](https://discord.gg/DKu7cUZ4XQ) [![Weblate](https://librescore.ddns.net/widgets/librescore/-/dl-librescore/svg-badge.svg)](https://librescore.ddns.net/engage/librescore) [![GitHub todos los lanzamientos](https://img.shields.io/github/downloads/LibreScore/app-librescore/total.svg?label=App)](https://github.com/LibreScore/app-librescore/releases/latest) [![GitHub todos los lanzamientos](https://img.shields.io/github/downloads/LibreScore/dl-librescore/total.svg?label=Guión+de+usuario)](https://github.com/LibreScore/dl-librescore/releases/latest) [![npm](https://img.shields.io/npm/dt/dl-librescore?label=Herramienta+de+línea-de-comandos)](https://www.npmjs.com/package/dl-librescore)

Descargar partituras

</div>

> DESCARGO DE RESPONSABILIDAD: Este no es un producto de MuseScore patrocinado oficialmente

## Instalación

Hay 4 programas instalables diferentes:

| Programa                                                                            | MSCZ | MIDI | MP3 | PDF | Conversión |     | Windows | macOS | Linux | Android | iOS/iPadOS |
| ---------------------------------------------------------------------------------- | ---- | ---- | --- | --- | ---------- | --- | ------- | ----- | ----- | ------- | ---------- |
| [App](#app)                             | ✔️   | ✔️   | ✔️  | ❌  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Guión de usuario](#guión-de-usuario)               | ❌   | ✔️   | ✔️  | ✔️  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |
| [Herramienta de línea-de-comandos](#herramienta-de-línea-de-comandos) | ❌   | ✔️   | ✔️  | ✔️  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Sitio web de Webmscore](#sitio-web-de-webmscore) | ❌   | ❌   | ❌  | ❌  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |

> Nota: `Conversión` se refiere a la capacidad de convertir archivos en otros tipos de archivos, incluidos los que no se pueden descargar en el programa.
> Los tipos de conversión incluyen: Partes individuales, PDF, PNG, SVG, MP3, WAV, FLAC, OGG, MIDI, MusicXML, MSCZ y MSCX.

### App

1. Vaya a la página [LÉAME](https://github.com/LibreScore/app-librescore/blob/master/docs/es/LÉAME.md#instalación) del repositorio `app-librescore`
2. Sigue las instrucciones de instalación de su dispositivo

### Guión de usuario

> Nota: Si su dispositivo está en iOS o iPadOS, por favor, siga las instrucciones de [Atajo](#atajo).
>
> Nota: Si no puede instalar extensiones de navegador en su dispositivo, por favor, siga las instrucciones de [Marcador](#marcador) en su lugar.

#### Extensión del navegador

1. Instale [Tampermonkey](https://www.tampermonkey.net/?locale=es)

> Nota: Si ya instaló una versión antigua del script llamado "musescore-downloader", "mcsz downloader" o "musescore-dl", por favor, desinstálelo desde el panel de control de Tampermonkey

2. Vaya al último archivo [dl-librescore.user.js](https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js)
3. Pulse el botón Instalar

#### Atajo

1. Instale el [atajo de LibreScore](https://www.icloud.com/shortcuts/901d8778d2da4f7db9272d3b2232d0fe)
2. En Safari, cuando esté viendo una canción en MuseScore, toque <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/01f5a9889bbecc202d8cbb3067a261ad.png" height="16">.
3. Toque el atajo de LibreScore para activar la extensión

> Nota: Para poder ejecutar JavaScript desde un atajo, debes activar la opción "Permitir ejecutar scripts"
>
> 1. Ve a Configuración <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/492fec5aff74dbdef9b526177c3804b4.png" height="16"> > Atajos > Avanzado
> 2. Activa "Permitir ejecutar scripts"

#### Marcador

1. Cree un nuevo marcador (normalmente Ctrl+D)
2. Escriba `LibreScore` para el campo Nombre
3. Escriba `javascript:(function () {let code = document.createElement('script');code.src = 'https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js';document.body.appendChild(code);}())` para el campo URL
4. Guarde el marcador
5. Cuando vea una canción en MuseScore, haga clic en el marcador para activar la extensión

### Herramienta de línea-de-comandos

1. Instale [Node.js LTS](https://nodejs.org/es)
2. Abra una terminal (_no_ abra la aplicación Node.js)
3. Escriba `npx dl-librescore@latest`, luego presione `Entrar ↵`

### Sitio web de Webmscore

1. Open [Webmscore](https://webmscore-pwa.librescore.org)

> Nota: Puede acceder al sitio web sin conexión instalándolo como un PWA

## Compilación

1. Instale [Node.js LTS](https://nodejs.org/es)
2. `npm install` para instalar paquetes
3. `npm run build` para compilar

- Instale `./dist/main.user.js` con Tampermonkey
- `node ./dist/cli.js` para ejecutar la herramienta de línea-de-comandos

</div>

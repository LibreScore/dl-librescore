<div dir="ltr" align="left">

‎[čeština](/docs/cs/PŘEČTĚTEMĚ.md) | ‎[English](/docs/en/README.md) | ‎[español](/docs/es/LÉAME.md) | ‎[français](/docs/fr/LISEZMOI.md) | ‎[magyar](/docs/hu/OLVASSAEL.md) | ‎[Melayu](/docs/ms/BACASAYA.md) | ‎**português** | ‎[русский](/docs/ru/ПРОЧТИМЕНЯ.md) | ‎[简体中文](/docs/zh-Hans/自述文件.md) | ‎[[+]](https://weblate.librescore.org/projects/librescore/docs)

[//]: # "\+\_==!|!=_=!|!==_/+/ ***NÃO EDITE ACIMA DESTA LINHA*** /+/^^+#|#+^+#|#+^^\+\"

# dl-librescore

<div align="center">

<img src="https://github.com/LibreScore/dl-musescore/raw/master/images/logo.png" width="256" alt="Logo do LibreScore">

[![Discord](https://img.shields.io/discord/774491656643674122?color=5865F2&label=&labelColor=555555&logo=discord&logoColor=FFFFFF)](https://discord.gg/DKu7cUZ4XQ) [![Weblate](https://weblate.librescore.org/widgets/librescore/-/dl-librescore/svg-badge.svg)](https://weblate.librescore.org/engage/librescore) [![Github - Todas as Versões](https://img.shields.io/github/downloads/LibreScore/app-librescore/total.svg?label=App)](https://github.com/LibreScore/app-librescore/releases/latest) [![Github - Todas as Versões](https://img.shields.io/github/downloads/LibreScore/dl-librescore/total.svg?label=Userscript)](https://github.com/LibreScore/dl-librescore/releases/latest) [![npm](https://img.shields.io/npm/dt/dl-librescore?label=Command-line+tool)](https://www.npmjs.com/package/dl-librescore)

Baixe partituras

</div>

> DISCLAIMER: Este não é um produto aprovado pelo MuseScore.

## Instalação

Existem 4 programas instaláveis diferentes:

| Programa                                                                            | MSCZ | MIDI | MP3 | PDF | Conversão |     | Windows | macOS | Linux | Android | iOS/iPadOS |
| ---------------------------------------------------------------------------------- | ---- | ---- | --- | --- | ---------- | --- | ------- | ----- | ----- | ------- | ---------- |
| [Aplicativo](#app)                             | ✔️   | ✔️   | ✔️  | ❌  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Userscript](#userscript)               | ❌   | ✔️   | ✔️  | ✔️  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |
| [Ferramenta da Command-line](#command-line-tool) | ❌   | ✔️   | ✔️  | ✔️  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Website Webmscore](#webmscore-website) | ❌   | ❌   | ❌  | ❌  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |

> Nota: `Conversão` se refere a habilidade de converter arquivos em outros tipos de arquivos, incluindo aqueles não baixáveis no programa.
> Tipos de conversão incluem: Partes Individuais, PDF, PNG, SVG, MP3, WAV, FLAC, OGG, MIDI, MusicXML, MSCZ, e MSCX.

### Aplicativo

1. Vá ao [LEIAME](https://github.com/LibreScore/app-librescore#installation) da página do repositório `app-librescore`
2. Siga as instruções de instalação para o seu dispositivo

### Script de Usuário (Userscript)

> Nota: Caso seu dispositivo rode iOS ou iPadOS, por favor siga as instruções do [Atalho](#atalho).
>
> Nota: Caso você não consiga instalar extensões de navegador no seu dispositivo, por favor siga as instruções do [Marcador](#marcador) em vez destas.

#### Extensão de navegador

1. Instale o [Tampermonkey](https://www.tampermonkey.net)

> Nota: Caso você já tenha instalado uma versão anterior do script chamado "musescore-downloader", "mcsz downloader", ou "musescore-dl", por favor as desinstale da dashboard do Tampermonkey

2. Vá ao arquivo mais recente [dl-librescore.user.js](https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js) file
3. Clique em Instalar

#### Atalho

1. Instale o [atalho do LibreScore](https://www.icloud.com/shortcuts/901d8778d2da4f7db9272d3b2232d0fe)
2. No Safari, enquanto estiver visualizando uma música no MuseScore, clique em <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/01f5a9889bbecc202d8cbb3067a261ad.png" height="16">
3. Clique no atalho do LibreScore para ativar a extensão

> Nota: Antes de poder executar códigos JavaScript por um atalho você deve ativar a opção "Permitir a Execução de Scripts"
>
> 1. Vá às configurações <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/492fec5aff74dbdef9b526177c3804b4.png" height="16"> > Atalhos > Avançado
> 2. Ative "Permitir a Execução de Scripts"

#### Marcador

1. Crie um novo marcador (geralmente Ctrl+D)
2. Digite `LibreScore` no campo de Nome
3. Digite`javascript:(function () {let code = document.createElement('script');code.src = 'https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js';document.body.appendChild(code);}())` no campo do URL
4. Salve o marcador
5. Ao visualizar uma música no MuseScore, clique no marcador para ativar a extensão

### Ferramenta da Linha de Comando

1. Instale [Node.js LTS](https://nodejs.org)
2. Abra um terminal (_não_ abra o Node.js)
3. Digite `npx dl-librescore@latest`, então aperte `Enter ↵`

### Website Webmscore

1. Abra o [Webmscore](https://webmscore-pwa.librescore.org)

> Nota: Você pode acessar o website enquanto offline ao instalá-lo como um PWA

## Criando uma Build

1. Instale o [Node.js LTS](https://nodejs.org)
2. `npm install` para instalar os pacotes
3. `npm run build` para criar a build

- Instale`./dist/main.user.js` com o Tampermonkey
- `node ./dist/cli.js` para executar a linha de comando

</div>

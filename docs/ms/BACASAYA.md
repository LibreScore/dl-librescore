<div dir="ltr" align="left">

‎[čeština](/docs/cs/PŘEČTĚTEMĚ.md) | ‎[English](/docs/en/README.md) | ‎[español](/docs/es/LÉAME.md) | ‎[français](/docs/fr/LISEZMOI.md) | ‎[magyar](/docs/hu/OLVASSAEL.md) | ‎**Melayu** | ‎[русский](/docs/ru/ПРОЧТИМЕНЯ.md) | ‎[简体中文](/docs/zh-Hans/自述文件.md) | ‎[[+]](https://weblate.librescore.org/projects/librescore/docs)

[//]: # "\+\_==!|!=_=!|!==_/+/ ***JANGAN EDIT DI ATAS BARIS INI*** /+/^^+#|#+^+#|#+^^\+\"

# dl-librescore

<div align="center">

<img src="https://github.com/LibreScore/dl-musescore/raw/master/images/logo.png" width="256" alt="LibreScore logo">

[![Discord](https://img.shields.io/discord/774491656643674122?color=5865F2&label=&labelColor=555555&logo=discord&logoColor=FFFFFF)](https://discord.gg/DKu7cUZ4XQ) [![Weblate](https://weblate.librescore.org/widgets/librescore/-/dl-librescore/svg-badge.svg)](https://weblate.librescore.org/engage/librescore) [![Github Semua Keluaran](https://img.shields.io/github/downloads/LibreScore/app-librescore/total.svg?label=Apl)](https://github.com/LibreScore/app-librescore/releases/latest) [![Github Semua Keluaran](https://img.shields.io/github/downloads/LibreScore/dl-librescore/total.svg?label=Skrip+pengguna)](https://github.com/LibreScore/dl-librescore/releases/latest) [![npm](https://img.shields.io/npm/dt/dl-librescore?label=Alat+baris+arahan)](https://www.npmjs.com/package/dl-librescore)

Muat turun lembaran muzik

</div>

> PENAFIAN: Ini bukan produk MuseScore yang disahkan secara rasmi

## Pemasangan

Terdapat 4 program boleh dipasang yang berbeza:

| Program                                                                            | MSCZ | MIDI | MP3 | PDF | Penukaran |     | Windows | macOS | Linux | Android | iOS/iPadOS |
| ---------------------------------------------------------------------------------- | ---- | ---- | --- | --- | ---------- | --- | ------- | ----- | ----- | ------- | ---------- |
| [Apl](#apl)                             | ✔️   | ✔️   | ✔️  | ❌  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Skrip pengguna](#skrip-pengguna)               | ❌   | ✔️   | ✔️  | ✔️  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |
| [Alat baris arahan](#alat-baris-arahan) | ❌   | ✔️   | ✔️  | ✔️  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Laman web Webmscore](#laman-web-webmscore) | ❌   | ❌   | ❌  | ❌  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |

> Nota: `Penukaran` merujuk kepada keupayaan untuk menukar fail kepada jenis fail lain, termasuk yang tidak boleh dimuat turun dalam program.
> Jenis penukaran termasuk: Bahagian Individu, PDF, PNG, SVG, MP3, WAV, FLAC, OGG, MIDI, MusicXML, MSCZ dan MSCX.

### Apl

1. Pergi ke halaman [BACASAYA](https://github.com/LibreScore/app-librescore/blob/master/docs/ms/BACASAYA.md#pemasangan) repositori `app-librescore`
2. Ikut arahan pemasangan untuk peranti anda

### Skrip pengguna

> Nota: Jika peranti anda menggunakan iOS atau iPadOS, sila ikut arahan [Pintasan](#pintasan).
>
> Nota: Jika anda tidak boleh memasang sambungan penyemak imbas pada peranti anda, sila ikut arahan [Penanda Halaman](#penanda-halaman) sebaliknya.

#### Sambungan penyemak imbas

1. Pasang [Tampermonkey](https://www.tampermonkey.net)

> Nota: Jika anda telah memasang versi lama skrip yang dipanggil "musescore-downloader", "mcsz downloader", atau "musescore-dl", sila nyahpasangnya daripada papan pemuka Tampermonkey

2. Pergi ke fail [dl-librescore.user.js](https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js) terkini
3. Tekan butang Pasang

#### Pintasan

1. Pasang [pintasan LibreScore](https://www.icloud.com/shortcuts/901d8778d2da4f7db9272d3b2232d0fe)
2. Dalam Safari, apabila melihat lagu di MuseScore, ketik <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/01f5a9889bbecc202d8cbb3067a261ad.png" height="16">
3. Ketik pintasan LibreScore untuk mengaktifkan sambungan

> Nota: Sebelum anda boleh menjalankan JavaScript daripada pintasan, anda mesti menghidupkan Benarkan Skrip Berjalan
>
> 1. Pergi ke Tetapan <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/492fec5aff74dbdef9b526177c3804b4.png" height="16"> > Pintasan > Advanced
> 2. Menyalakan Izinkan Menjalankan Skrip

#### Penanda buku

1. Buat penanda halaman baharu (biasanya Ctrl+D)
2. Taipkan `LibreScore` untuk medan Nama
3. Taipkan `javascript:(function () {let code = document.createElement('script');code.src = 'https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js';document.body.appendChild(code);}())` untuk medan URL
4. Simpan penanda halaman
5. Apabila melihat lagu di MuseScore, klik penanda halaman untuk mengaktifkan sambungan

### Alat baris arahan

1. Pasang [Node.js LTS](https://nodejs.org)
2. Buka terminal (_jangan_ buka aplikasi Node.js)
3. Taip `npx dl-librescore@latest`, kemudian tekan `Enter ↵`

### Laman web Webmscore

1. Buka [Webmscore](https://webmscore-pwa.librescore.org)

> Nota: Anda boleh mengakses tapak web di luar talian dengan memasangnya sebagai PWA

## Penyusunan

1. Pasang [Node.js LTS](https://nodejs.org)
2. `npm install` untuk memasang pakej
3. `npm run build` untuk membina

- Pasang `./dist/main.user.js` dengan Tampermonkey
- `node ./dist/cli.js` untuk menjalankan alat baris arahan

</div>

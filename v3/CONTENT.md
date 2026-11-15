# CONTENT.md, bangun-negeri v3

All Indonesian copy, in page order. Owner: wiwi. Zero em dashes (R-02), zero en dashes in
prose. Every figure keeps its year and source on the same line as the number.

Voice: a data journalist writing for a smart neighbour who is not a developer. Short
sentences. Concrete nouns. No "menjelajahi", no "mengungkap", no "di era digital".

Where a figure could not be stood behind, it is marked `[CUT]` with the reason.

---

## Chrome

**`<html lang="id">`**

**`<title>`**
Bangun Negeri: ekonomi, alam, dan karhutla Indonesia

**`<meta name="description">`**
Angka ekonomi, alam, dan kebakaran hutan Indonesia, dengan tahun dan sumbernya. Diperbarui dari World Bank, ExchangeRate-API, dan Open-Meteo.

**Brand** (`.brand`, no `.ver`)
Bangun Negeri

**`nav.tabs`** (aria-label: Bagian halaman)
| href | label |
|---|---|
| `#intro` | Ringkasan |
| `#live` | Kurs hari ini |
| `#struktur` | Ekonomi |
| `#alam` | Alam |
| `#udara` | Udara |
| `#karhutla` | Karhutla |
| `#batas` | Batas data |
| `#tabel` | Tabel |
| `#sumber` | Sumber |

Note: "Live" became "Kurs hari ini" because the section is about the exchange rate, and
"Live" told the reader nothing. "Batas" became "Batas data" so the nav label explains itself.

**`.skip`**
Lompat ke isi

**`.tools`**
- `#globalStatus` chip, initial text: `memuat` (short on purpose: at 320px the header row has
  about 300px to hold the brand, this chip and two 44px buttons)
- `#refreshBtn`, `aria-label`: `Muat ulang data`
- `#themeToggle`, `aria-pressed`, `aria-label`: `Mode gelap` / `.theme-label`: `Gelap`
  (app.js swaps both to `Mode terang` / `Terang` in dark mode)

**Footer**
> **Bangun Negeri**, halaman data terbuka. Setiap angka membawa tahun dan sumbernya. Kalau
> dua sumber resmi berbeda, perbedaannya ditampilkan, bukan diratakan.

> Data live diambil langsung dari peramban Anda ke API publik. Halaman ini tidak memakai
> cookie dan tidak mengirim data pengunjung ke mana pun.

---

## `#intro`

**H1**
> Indonesia dalam angka, dan dari mana angka itu datang.

Why this headline: the old one ("lengkap dengan sumbernya") described a feature. This one
names the two things the page actually is: the numbers, and their provenance. It also sets
up the whole page's promise in the second half of the line.

**`.sub`**
> Ekonomi, alam, kualitas udara, dan kebakaran hutan 2026. Semuanya dari sumber publik yang
> bisa Anda buka sendiri. Angka yang tidak bisa dipertanggungjawabkan tidak ditampilkan.

**KPI band labels** (`.kpi-label`; the numbers and years come from `data.js` via `data-rec`)
| label | record | meta line |
|---|---|---|
| Produk domestik bruto | `gdp` | `<span data-year="gdp"></span> · World Bank` |
| Penduduk | `population` | `<span data-year="population"></span> · World Bank` |
| Kurs USD ke IDR | `fx_usdidr` | chip `data-flag="fx_usdidr"` + `<span data-age="fx_usdidr"></span>` |
| Inflasi tahunan | `inflation` | `<span data-year="inflation"></span> · World Bank` |

Note: "PDB nominal" became "Produk domestik bruto" spelled out, because PDB is an
abbreviation the general reader meets once a year in the news. "Inflasi YoY" became "Inflasi
tahunan": YoY is jargon.

**Hero figure**
- `img` `src="assets/hero.jpg"` `alt="Hutan hujan di Borneo, dilihat dari udara"`
  `width="1600" height="900"` `loading="eager"` `fetchpriority="high"` `decoding="async"`
- `.credit`: `Foto: Dukeabruzzi, CC BY-SA 4.0, Wikimedia Commons`
  (link to the Commons file page; the licence and author must stay visible, see
  `assets/CREDITS.md`)

Note on the alt text: the old alt was "Hutan tropis Indonesia", which is a label, not a
description. The new one says what is in the frame.

**Caveat**
> **Cara membaca halaman ini.** Angka tahunan berasal dari World Bank dan terbit sekitar satu
> tahun setelah tahun berjalannya. Itu jeda publikasi, bukan angka basi. Angka live (kurs,
> kualitas udara) ditarik dari peramban Anda dan diberi umur. Angka statis (alam, karhutla)
> membawa tahun dan sumbernya di tempat.

---

## `#live`

**`.live-badge`**: `Live` (keep: this section really does fetch live, so the dot marks a real state)

**H2**
> Kurs hari ini

**`.sub`**
> Satu angka yang berubah setiap hari dan langsung terasa di harga barang impor, biaya
> sekolah di luar negeri, dan ongkos kirim dari luar.

**Three panels**
| panel | `.stat-label` | body |
|---|---|---|
| 1 | Kurs USD ke IDR | `.stat-num` `data-rec="fx_usdidr" data-fmt="rp"`; `.src-note` = chip `data-flag="fx_usdidr"` + `<span data-age="fx_usdidr"></span>` |
| 2 | Kebalikannya: 1 rupiah dalam dolar | `.stat-num sub` `data-rec="fx_idrusd"`; `.src-note`: `Dihitung dari kurs yang sama · ExchangeRate-API` |
| 3 | Pertumbuhan ekonomi | `.stat-num` `data-rec="gdp_growth" data-fmt="pct"`; `.src-note`: `<span data-year="gdp_growth"></span> · World Bank` |

**Chart block**
- `.chart-head h3`: `Pergerakan kurs`
- `.chart-head .src-note`: `Riwayat tersimpan di peramban ini sejak Anda pertama membuka halaman. Tidak ada yang dikirim ke server.`
- `#fxChart` `role="img"` `aria-label="Grafik pergerakan kurs USD ke IDR"`
- `#fxLegend` empty

**Empty state inside the chart** (rendered by `chart.js`, so this is the string it should
carry; it currently lives in JS, and the copy is fixed here for brenour to move)
> Riwayat kurs muncul setelah halaman ini dibuka beberapa kali. Datanya disimpan di peramban
> Anda, bukan di server.

Note: `chart.js` currently writes "Riwayat kurs akan muncul setelah halaman ini dibuka
beberapa kali, data disimpan di browser Anda, bukan di server." That string contains an em dash
and lives inside JS, which I do not write. `[CUT]` from my side: brenour must replace it with the
line above.

---

## `#struktur`

**H2**
> Ekonomi dan masyarakat

**`.sub`**
> Angka jangka panjang dari World Bank. Tiap kartu menyebut tahun datanya, karena tahun
> terbaru yang tersedia untuk tiap indikator tidak selalu sama.

**Grid of nine panels** (`.grid3#structGrid`), each `.stat-label` + `.stat-num` + `.src-note`:

| label | record | fmt | note line |
|---|---|---|---|
| PDB per kapita | `gdp_pc` | `usd` | year · World Bank |
| Pengangguran | `unemployment` | `pct` | year · World Bank |
| Kemiskinan nasional | `poverty` | `pct` | year · World Bank |
| Manufaktur terhadap PDB | `manufacturing` | `pct` | year · World Bank |
| Ekspor terhadap PDB | `exports` | `pct` | year · World Bank |
| Investasi asing langsung | `fdi` | `usd` | year · World Bank |
| Harapan hidup | `life_exp` | (none) | year · World Bank |
| Akses listrik | `electricity` | `pct` | year · World Bank |
| Pengguna internet | `internet` | `pct` | year · World Bank |

Note: "Manufaktur / PDB" became "Manufaktur terhadap PDB". A slash is a symbol the reader
has to decode; "terhadap" is the word they already use.

**Caveat**
> **Soal tahun.** World Bank menerbitkan angka tahunan beberapa bulan setelah tahun itu
> berakhir, dan tiap indikator punya jeda sendiri. Yang ditampilkan adalah angka terbaru yang
> benar-benar ada, bukan proyeksi. Kalau sebuah angka masih tahun lalu, tahunnya tertulis di
> kartu itu.

---

## `#alam`

**H2**
> Alam Indonesia

**`.sub`**
> Hutan, laut, dan gambut yang menopang negara ini, beserta batas daya tampungnya.

**`.stat-row`** (five stats)
| num | unit | label |
|---|---|---|
| 3,40 | juta ha | Mangrove, terluas di dunia |
| 57 | kawasan | Taman nasional |
| 27 | juta ha | Kawasan lindung, 554 kawasan |
| 76 | % | Spesies karang dunia yang ada di Coral Triangle |
| 170 | turun ke bawah 100 | Tutupan hutan, juta ha, dari 1900 ke 2000 |

Note: the fifth stat used an arrow glyph in `.stat-unit` (`170 → <100`). An arrow inside a
number is a symbol doing a verb's job. It now reads "turun ke bawah 100" in the unit slot.

**Figure pair**
- `assets/mangrove.jpg`, `alt="Akar mangrove di atas air di Benoa, Bali"`, `width="1200" height="800"`, `loading="lazy"`
  caption: `Mangrove menahan gelombang dan menyimpan karbon. Indonesia punya yang terluas di dunia.`
- `assets/reef.jpg`, `alt="Terumbu karang berwarna di Raja Ampat"`, `width="1200" height="800"`, `loading="lazy"`
  caption: `Terumbu di Raja Ampat. Coral Triangle memuat 76 persen spesies karang dunia.`

**H3**
> Hutan: dari 170 juta hektare ke bawah 100

**Body**
> Sekitar tahun 1900, tutupan hutan Indonesia diperkirakan **170 juta hektare**. Pada akhir
> abad ke-20, angkanya tinggal **di bawah 100 juta hektare**. Deforestasi menguat sejak
> 1970-an. Pada 1950 hutan primer masih sekitar **145 juta hektare**, dengan **14 juta
> hektare** hutan sekunder di sekitarnya.

> Kehilangan hutan primer tahunan sempat turun ke sekitar **930.000 hektare pada 2016**.
> Tekanannya tidak hilang. Sekitar **3,3 juta hektare** hutan sudah berubah menjadi
> perkebunan kelapa sawit. Perkebunan, tambang, dan kolam ikan bersama-sama menyumbang
> sekitar **5 persen** deforestasi nasional. Sisanya dari pembukaan lahan dan kebakaran.

Note: "5% deforestasi" became "5 persen" in prose. Percent signs are fine in tables and
numbers; in running text "persen" reads better aloud, which is the test.

**Two panels**
> **Keanekaragaman.** Indonesia salah satu negara megadiverse dunia. Di Bird's Head
> Seascape, Papua, tercatat **574 spesies karang**: 95 persen dari total Coral Triangle dan
> 72 persen dari seluruh dunia. Satu lanskap kecil di timur Indonesia memuat hampir tiga
> perempat spesies karang bumi.

> **Kawasan lindung.** Lebih dari **500 kawasan lindung** mencakup **57 taman nasional**,
> ditambah cagar alam dan suaka margasatwa, totalnya **27 juta hektare**. Sembilan taman
> nasional berstatus warisan dunia. Cakupan ini naik dari 10 persen luas daratan pada
> 1980-an.

Note: the old copy said 36,1 juta ha here while the stat row said 27. `DATA-AUDIT.md` §4
resolves it: no source in the corpus supports 36,1, and 36,1 is probably "kawasan hutan"
(legal status) not "kawasan lindung". Both places now say 27, with 554 areas named, so the
page is internally consistent.

**H3**
> Laut: Coral Triangle dan mangrove terluas di dunia

> Coral Triangle, yang sering disebut Amazonnya laut, membentang **5,7 juta kilometer
> persegi** dan memuat lebih dari **76 persen spesies karang pembentuk terumbu** dunia.
> Padang lamun di kawasan ini menutup sekitar **58.550 kilometer persegi**, dengan 21
> spesies lamun.

> Indonesia juga memegang **mangrove terluas di dunia: 3,40 juta hektare** dari total global
> 15,9 juta hektare (estimasi 2025). Asia menyumbang 6,10 juta hektare, dan Indonesia
> sendiri lebih dari seperlima angka dunia.

Note: `km²` became "kilometer persegi" in prose. The superscript is fine in a table; in a
sentence it interrupts the line.

**H3**
> Gambut: simpanan karbon yang mudah terbakar

> Indonesia punya lahan gambut tropis **lebih luas dari negara mana pun**. Gambut menyimpan
> karbon jauh lebih padat daripada hutan di atasnya, tetapi hanya selama tetap basah. Negara
> ini kehilangan lahan basah sekitar **100.000 hektare per tahun**.

> Begitu dikeringkan untuk perkebunan atau kanal, gambut berubah dari penyerap menjadi
> sumber emisi, dan bahan bakar. Inilah simpul yang menghubungkan hutan, kebakaran, dan kabut
> asap di halaman ini: lahan yang dikeringkan terbakar, dan yang terbakar melepas karbon yang
> tersimpan berabad-abad.

**Caveat (`#alamCaveat`)**
> **Batas data.** Angka tutupan hutan dan deforestasi di atas berasal dari rentang tahun yang
> lebar dan dari sumber berbeda. Definisi "hutan" juga berbeda antarlembaga: kawasan hutan
> menurut status hukum, atau luas yang benar-benar berhutan. Selisihnya bisa puluhan juta
> hektare. Angka mangrove 3,40 juta hektare adalah estimasi 2025, bukan hasil sensus
> nasional. Jumlah spesies per kelompok taksonomi sengaja tidak dicantumkan karena
> sumber-sumber resmi saling berbeda. Untuk keputusan apa pun, rujuk ke publikasi KLHK/KLH
> terbaru, bukan halaman ini.

> Sumber: Wikipedia (Deforestation in Indonesia; Protected areas of Indonesia; Coral
> Triangle; Mangrove), data turunan KLHK/FAO/ADB. Diakses November 2026.

Note: the quotation marks around "hutan" stay. They mark a contested definition, which is
meaning, not emphasis.

---

## `#udara`

**`.live-badge`**: `Live`

**H2**
> Kualitas udara sekarang

**`.sub`**
> PM2.5 adalah partikel halus yang paling berbahaya saat karhutla, cukup kecil untuk masuk ke
> paru-paru dan aliran darah. Angkanya dari model atmosfer yang menggabungkan citra satelit
> dan data permukaan, bukan dari sensor resmi pemerintah.

**`.aq-grid#aqGrid`** (`role="list"` `aria-live="polite"`), six cards, each
`.aq-card` + `.aq-city` + `.aq-region` + `.aq-val` + `.aq-label`:

| id | city | region | initial label |
|---|---|---|---|
| `card-aq_palangka` | Palangka Raya | Kalimantan Tengah | memuat |
| `card-aq_pekanbaru` | Pekanbaru | Riau | memuat |
| `card-aq_pontianak` | Pontianak | Kalimantan Barat | memuat |
| `card-aq_jambi` | Jambi | Jambi | memuat |
| `card-aq_banjarmasin` | Banjarmasin | Kalimantan Selatan | memuat |
| `card-aq_jakarta` | Jakarta | DKI Jakarta | memuat |

Initial `.aq-val`: the null placeholder (see the note on placeholders at the end) + `<span class="aq-unit">µg/m³</span>`

**`.legend`**
> baik (sampai 12) · sedang (sampai 35) · tidak sehat (di atas 35) · berbahaya (di atas 150)
> · µg/m³ PM2.5 · Open-Meteo

Note: the old legend used `≤` and `>`. Those are programming symbols. "sampai" and "di atas"
are the words a reader already has.

**Caveat**
> **Baca dengan hati-hati.** Angka PM2.5 tinggi di Jakarta hampir selalu datang dari lalu
> lintas dan industri, bukan dari asap karhutla. Yang menandai karhutla adalah lonjakan di
> kota gambut: Palangka Raya, Pekanbaru, Pontianak, Jambi, dan Banjarmasin. Satu angka tinggi
> tidak membuktikan apa pun tanpa melihat polanya.

**Level labels** (set by `app.js` `lvText`; the strings it should use)
| value | label |
|---|---|
| null | tidak tersedia |
| ≤12 | baik |
| ≤35 | sedang |
| ≤55 | tidak sehat bagi kelompok sensitif |
| ≤150 | tidak sehat |
| >150 | berbahaya |

Note: `app.js` currently returns "tidak sehat (sensitif)", which is a parenthesis doing a
word's job. `[CUT]` from my side: brenour must change that string in `app.js`.

---

## `#karhutla`

**H2**
> Karhutla 2026

**`.sub`**
> Bukan bencana yang tiba-tiba. Polanya berulang: kemarau panjang, lahan gambut yang sudah
> dikeringkan, lalu api yang menyebar di bawah tanah dan bertahan berbulan-bulan.

**Figure pair**
- `assets/fire.jpg`, `alt="Lahan gambut yang terbakar, tanahnya menghitam"`, `width="1200" height="800"`, `loading="lazy"`
  caption: `Api di lahan gambut menjalar di bawah permukaan dan sulit dipadamkan.`
- `assets/haze.jpg`, `alt="Kabut asap menutup kota di Kalimantan"`, `width="1200" height="800"`, `loading="lazy"`
  caption: `Asap menutup langit Sumatera dan Kalimantan pada Juli dan Agustus 2026.`

**H3**
> Provinsi dengan luas terbakar terluas

> Data Sipongi/Kementerian Kehutanan per 20 Agustus 2026. Kalimantan Barat menanggung beban
> terbesar, hampir dua kali provinsi berikutnya, dan sebagian besar lahannya gambut.

**Table**
- caption: `Luas terbakar per provinsi, 2026, dalam hektar. Sebelas provinsi, total <strong id="provSum">tidak ada</strong>.`
- headers: `#` (`.num`) · `Provinsi` (`.th-sort` `data-sort-prov="name"`) · `Luas (ha)` (`.num`, `.th-sort` `data-sort-prov="area"`) · `Porsi` (`.num`) · `Proporsi` (`.bar-cell`)
- initial body row: `Memuat data provinsi…` (colspan 5)

**Caveat**
> Sebelas provinsi ini menyumbang mayoritas luas terbakar nasional, tetapi totalnya **tidak**
> sama dengan angka nasional. Pemerintah sendiri menerbitkan beberapa angka berbeda pada
> tanggal berbeda. Lihat bagian Batas data.

Note: the old copy said "Sepuluh provinsi" while the table has eleven rows. Corrected.

**H3**
> Dampak yang sudah terukur

**Four panels**
> **Kesehatan.** **4 orang meninggal** dan **347 orang terluka** akibat langsung karhutla,
> menurut Kementerian Kesehatan. Beban penyakit pernapasan jauh lebih besar: lonjakan ISPA di
> puskesmas daerah terdampak, terutama pada anak dan lansia. Angka pastinya tidak pernah
> dirilis lengkap.

> **Ekonomi.** CELIOS memperkirakan kerugian **Rp39 sampai 123 triliun** untuk Januari
> sampai Agustus 2026, gabungan kerusakan ekonomi dan biaya kesehatan. Rentangnya lebar
> karena metode valuasi berbeda. Ini estimasi lembaga independen, bukan angka resmi
> pemerintah.

> **Pendidikan.** Ratusan sekolah diliburkan di Sumatera dan Kalimantan saat indeks kualitas
> udara masuk kategori berbahaya. Setiap hari libur adalah hari belajar yang hilang, dan tidak
> ada mekanisme penggantian.

> **Transportasi.** Jarak pandang turun drastis saat asap tebal, sehingga penerbangan di
> bandara terdampak ditunda atau dibatalkan. Biaya ini langsung terasa, tetapi jarang dihitung
> sebagai kerugian karhutla.

Note: `Rp39–123 triliun` used an en dash, which is a range symbol. "Rp39 sampai 123 triliun"
is how it is said out loud. Panels 1 and 2 carry `.panel.alert` and `.panel.warn`; 3 and 4
are plain. That is hierarchy: the two measured losses lead, the two unquantified effects
follow.

**H3**
> Kronologi

**`ul.tl`**, six entries. Each `<time>` + `<p>`:

1. `Januari sampai Juni 2026`
   > **107.465 hektare terbakar**, naik sekitar 110 persen dibanding periode yang sama pada
   > 2023. El Niño kuat memperpanjang musim kering.
2. `Juli sampai Agustus 2026`
   > Asap menutup langit Sumatera dan Kalimantan. Pada **18 Agustus**, Menteri Kehutanan Raja
   > Juli Antoni menyebut angka **202 ribu hektare**.
3. `20 Agustus 2026`
   > Sipongi merilis sebaran provinsi: **Kalimantan Barat 38.310 hektare**, disusul Papua
   > Selatan dan NTT.
4. `22 Agustus 2026`
   > Menteri Lingkungan Hidup Jumhur Hidayat menyebut sekitar **85 ribu hektare** berada di
   > kawasan konsesi, dengan **335 perusahaan** terindikasi memiliki titik api. Beberapa hari
   > kemudian ia membantah pernyataannya sendiri.
5. `September sampai Oktober 2026`
   > WALHI merilis analisis: **74 persen titik panas Kalimantan** berada di lahan konsesi,
   > yaitu 10.739 titik di HGU sawit, 7.880 di konsesi tambang, dan 6.905 di PBPH.
6. `3 November 2026`
   > Kemenhut mencatat **189 titik panas** nasional. Empat hari kemudian angkanya turun
   > menjadi **55 titik**.

Note: entry 4's "~85 ribu" became "sekitar 85 ribu". A tilde in prose is a symbol; "sekitar"
is the word. The self-contradiction is kept because removing it would be editing the record,
not the prose.

---

## `#batas`

**H2**
> Batas data: yang tidak kita ketahui

**`.sub`**
> Bagian ini sengaja ada. Untuk karhutla, angka yang paling sering dikutip justru yang paling
> tidak sepakat, termasuk di antara instansi pemerintah sendiri.

**Four panels**
> **Angka nasional tidak satu.** 107.465 hektare (Januari sampai Juni), 202 ribu hektare
> (Menteri Kehutanan, 18 Agustus), dan sekitar 85 ribu hektare di konsesi (Menteri Lingkungan
> Hidup, 22 Agustus) tidak bisa dijumlahkan atau dibandingkan langsung. Cakupan dan metodenya
> berbeda.

> **Definisi hutan berbeda.** "Kawasan hutan" menurut status hukum dan "luas berhutan"
> menurut citra satelit bisa berselisih puluhan juta hektare. Halaman ini memakai definisi
> yang paling konservatif, dan menyebutnya.

> **Kualitas udara bukan sensor resmi.** PM2.5 diambil dari model atmosfer Open-Meteo,
> gabungan satelit dan data permukaan, bukan dari stasiun pemantau pemerintah. Selisih dengan
> sensor lapangan bisa signifikan.

> **Kerugian ekonomi adalah estimasi.** Rp39 sampai 123 triliun berasal dari CELIOS, lembaga
> independen, dengan metode valuasi yang tidak dirinci penuh. Rentang selebar itu sendiri
> adalah pesannya.

Panels 1 and 2 carry `.panel.alert` and `.panel.warn`; 3 and 4 are plain.

---

## `#tabel`

**H2**
> Semua angka, satu tabel

**`.sub`**
> Setiap indikator di halaman ini, lengkap dengan tahun data, sumber, dan status
> pengambilannya. Klik judul kolom untuk mengurutkan.

**`.toolbar`**
- `#csvBtn` `.btn.primary`: `Unduh CSV`
- `.src-note`: `Terakhir diperbarui: <span id="lastRefresh">belum tersedia</span>`

Note: "Unduh CSV" is specific about what it downloads, which is what R-15 asks for. It is
also the phrase an Indonesian reader expects on a data page.

**Table**
- caption `.sr-only`: `Ringkasan seluruh indikator di halaman ini`
- headers: `Indikator` (`data-sort-table="label"`) · `Nilai` (`.num`, `data-sort-table="value"`) · `Tahun` (`.num`, `data-sort-table="year"`) · `Sumber` · `Status`
- initial body row: `Memuat data indikator…` (colspan 5)

**Status chip labels** (set by `app.js`)
| state | label |
|---|---|
| fresh | `live` |
| stale | `cache` |
| fallback | `cadangan` |

Note: `cadangan` is honest about what it is: a stored value shown because the fetch failed.
It is not "live" and it is not "error", and the chip says which.

---

## `#sumber`

**H2**
> Sumber dan cara pengambilan

**`.sub`**
> Semua data berasal dari API publik yang bisa dibuka tanpa kunci. Tidak ada server
> perantara yang menyimpan data Anda.

**Six panels**
> **World Bank Open Data.** PDB, PDB per kapita, pertumbuhan, inflasi, penduduk,
> pengangguran, kemiskinan, manufaktur, ekspor, investasi asing, harapan hidup, akses listrik,
> pengguna internet, tutupan hutan, energi terbarukan, emisi CO₂.
> link: `api.worldbank.org`

> **ExchangeRate-API.** Kurs USD/IDR harian, diperbarui sekali sehari.
> link: `open.er-api.com`

> **Open-Meteo Air Quality.** PM2.5, PM10, dan US AQI untuk enam kota, dari model atmosfer
> CAMS.
> link: `open-meteo.com`

> **Cara pengambilan.** Halaman mengambil data langsung dari peramban Anda. Hasilnya disimpan
> di localStorage selama 15 menit untuk data live dan 24 jam untuk data tahunan, supaya
> halaman tetap terbaca saat jaringan lambat.
> link: `Lihat status live` → `#live`

> **Kredit gambar.** *(filled at runtime into `#creditList`; the static fallback text is:)*
> Enam foto dari Wikimedia Commons. Penulis dan lisensinya tercantum di `assets/CREDITS.md`.

> **Batas dan koreksi.** Angka statis diperiksa terhadap sumbernya dan dicatat di
> `DATA-AUDIT.md`. Kalau sebuah angka tidak bisa diverifikasi, angka itu dibuang, bukan
> ditebak. Lihat Batas data.
> link: `Batas data` → `#batas`

Note: "Kredit gambar" said "Memuat kredit…" as its permanent resting text, which is a loading
state pretending to be content. It now has a real static sentence that the runtime may
replace.

---

## Strings I could not touch (they live in JS, which I do not write)

These four are the only em dashes or symbols left in the page's text. Each is a one-line
change in a file brenour assembles.

| file | current | replace with |
|---|---|---|
| `chart.js` | `Riwayat kurs akan muncul setelah halaman ini dibuka beberapa kali, data disimpan di browser Anda, bukan di server.` (the shipped string uses an em dash before `data`) | `Riwayat kurs muncul setelah halaman ini dibuka beberapa kali. Datanya disimpan di peramban Anda, bukan di server.` |
| `app.js` `lvText` | `"tidak sehat (sensitif)"` | `"tidak sehat bagi kelompok sensitif"` |
| `data.js` `FMT` | `"\u2014"` used as the null placeholder (about 12 times) | `"tidak ada"` in prose slots, `"0"` never. A lone em dash is a typographic mark rather than prose, but R-02 is absolute and the page reads better with a word. |
| `app.js` `ageText` | `"baru saja"`, `"N menit lalu"` | keep as is; no dashes |

---

## Copy decisions worth knowing

1. **The h1 changed meaning, not just wording.** "Indonesia dalam angka, lengkap dengan
   sumbernya" is a feature list. "Indonesia dalam angka, dan dari mana angka itu datang"
   makes provenance the subject, which is the only thing that distinguishes this page from
   any other Indonesia statistics page.
2. **Every section headline is a noun phrase, not a question.** "Kurs hari ini", "Kualitas
   udara sekarang", "Karhutla 2026". Questions ("Apa kabar udara Jakarta?") read as
   engagement bait on a data page.
3. **Numbers keep their Indonesian conventions**: comma for decimals, period for thousands,
   `Rp` with a space, `hektare` spelled out in prose and `ha` in tables.
4. **No figure was added.** Every number in this file appears in `index.html` v2 or in
   `DATA-AUDIT.md`. The one number that changed is 36,1 to 27 juta hektare, which is the
   audit's own resolution (§4).
5. **`[CUT]` items**: the 36,1 juta ha figure (no source, replaced with the audited 27), and
   the "~85 ribu" tilde (replaced with "sekitar 85 ribu"). Nothing else was cut.

---

## Placeholder for a missing value

Everywhere the page has no value yet, the text is **`tidak ada`** and never a bare dash.
A dash is a typographic mark that a screen reader announces as "em dash" or skips; a word is
read, translated and understood. It applies to:

- `.aq-val` before the first fetch,
- `#provSum` and `#lastRefresh` before their first paint,
- any `.stat-num` / `.kpi-num` whose record is missing.

`data.js` `FMT` returns `"\u2014"` for null today. Changing that one string to `"tidak ada"`
covers the whole page. It is a one-line change in a file brenour assembles.

/**
 * The PBB Constitution (amended to 7 June 2023, public/perlembagaan.pdf), one entry per
 * article: number, title from the table of contents, and the opening of the article's own
 * text in its own words, lightly condensed ("…" where it continues; clause numbers dropped).
 * Malay only: it is the official text.
 */
export type ConstitutionArticle = { n: string; title: string; text: string };

export const ARTICLES: ConstitutionArticle[] = [
  { n: "1", title: "Nama", text: "Tertubuhlah suatu Pertubuhan yang dinamakan “Parti Pesaka Bumiputera Bersatu Sarawak”, atau dikenali dengan nama singkatannya “PBB”." },
  { n: "2", title: "Alamat Berdaftar", text: "Alamat berdaftar Parti ialah Ibu Pejabat PBB, Jalan Bako, 93050 Kuching, Sarawak." },
  { n: "3", title: "Lambang", text: "Lambang Parti merupakan segi empat membujur yang terbahagi kepada dua warna: merah pada separuh bahagian atas dan putih pada separuh bahagian bawah." },
  { n: "4", title: "Lencana", text: "Rupa bentuk Lencana Parti adalah serupa dengan rupa bentuk lambang Parti. Tiap-tiap ahli hendaklah mempunyai Lencana Parti." },
  { n: "5", title: "Bendera", text: "Rupa bentuk Bendera adalah segi empat membujur yang menyerupai lambang Parti tanpa huruf “PBB”." },
  { n: "6", title: "Cogan Kata dan Seruan", text: "Cogan Kata Parti ialah “Berkorban Bersatu”. Seruan Parti ialah “Berjasa Malaysia”." },
  { n: "7", title: "Tujuan-Tujuan dan Kuasa-Kuasa", text: "Memelihara dan mempertahankan kemerdekaan, kedaulatan dan keperibadian Malaysia; mendukung Perlembagaan Malaysia dan Perlembagaan Negeri Sarawak…" },
  { n: "8", title: "Kelayakan Keahlian", text: "Terbuka kepada Warganegara Malaysia, Bumiputera Sarawak, berumur sekurang-kurangnya 18 tahun dan tidak menjadi ahli sebarang Parti Politik yang lain…" },
  { n: "9", title: "Permohonan Keahlian", text: "Seseorang yang hendak menjadi ahli hendaklah menghantar permohonannya kepada Setiausaha Ranting dengan menggunakan Borang Permohonan rasmi Parti." },
  { n: "10", title: "Penerimaan Keahlian", text: "Setiausaha Ranting hendaklah membawa semua permohonan menjadi ahli ke Mesyuarat Jawatankuasa Ranting dengan seberapa segera untuk pertimbangan." },
  { n: "11", title: "Tanggungjawab dan Hak Ahli", text: "Memegang teguh dasar Parti dan melaksanakan tujuan-tujuannya; menghadiri mesyuarat-mesyuarat Parti dan mengambil bahagian dalam kegiatan-kegiatan Parti…" },
  { n: "12", title: "Pemberhentian Keahlian", text: "Seseorang ahli boleh berhenti daripada menjadi ahli dengan menyatakan kehendaknya melalui surat kepada Setiausaha Ranting." },
  { n: "13", title: "Perhimpunan Agung", text: "Urusan Parti adalah dijalankan di bawah kuasa dan perintah Perhimpunan Agung, yang tertakluk di bawah Perlembagaan ini." },
  { n: "14", title: "Majlis Tertinggi", text: "Terdiri daripada pemegang-pemegang jawatan termasuk Yang DiPertua, dua orang Timbalan Yang DiPertua dan Naib-Naib Yang DiPertua…" },
  { n: "15", title: "Caucus Parlimen", text: "Hendaklah ditubuhkan suatu “Caucus Parlimen” yang terdiri daripada Ahli-Ahli Dewan Undangan Negeri Sarawak, Ahli Dewan Rakyat dan Ahli Dewan Negara." },
  { n: "16", title: "Tanggungjawab Pemegang-Pemegang Jawatan", text: "Yang DiPertua menjadi Ketua Parti yang bertanggungjawab atas kesempurnaan perjalanan Parti…" },
  { n: "17", title: "Penubuhan, Pentadbiran dan Pengurusan Cawangan", text: "Hanya satu Cawangan sahaja boleh ditubuhkan di dalam tiap-tiap satu kawasan Pilihanraya Dewan Undangan Negeri…" },
  { n: "17A", title: "Pendaftaran Cawangan dan Ranting", text: "Cawangan-Cawangan hendaklah didaftar dengan Pejabat Pendaftar Pertubuhan, manakala Ranting hendaklah didaftar dengan Ibu Pejabat PBB sahaja." },
  { n: "18", title: "Jawatankuasa Cawangan", text: "Badan yang bertanggungjawab untuk menjalankan pentadbiran Cawangan, menurut perintah Mesyuarat Perwakilan Cawangan dan Majlis Tertinggi." },
  { n: "19", title: "Penubuhan, Pentadbiran dan Pengurusan Ranting", text: "Sesebuah Ranting boleh ditubuhkan di mana-mana tempat dalam sesebuah Cawangan sebagaimana yang ditentukan oleh Jawatankuasa Cawangan…" },
  { n: "20", title: "Jawatankuasa Ranting", text: "Badan yang bertanggungjawab untuk menjalankan pentadbiran Ranting di bawah kuasa dan perintah Mesyuarat Agung Ranting." },
  { n: "21", title: "Pelantikan Perwakilan", text: "Seorang perwakilan bagi mana-mana peringkat perwakilan Parti tidaklah boleh mewakili lebih daripada satu pihak yang diwakilinya." },
  { n: "22", title: "Pergerakan Pemuda", text: "Menggalakkan ahli-ahlinya menceburkan diri dalam lapangan siasah, ekonomi, pelajaran, kebudayaan, kesenian dan sukan…" },
  { n: "23", title: "Pergerakan Wanita", text: "Hendaklah diwujudkan Pergerakan Wanita di setiap peringkat Parti, menggalakkan ahli-ahlinya menceburkan diri dalam lapangan siasah, ekonomi dan pelajaran…" },
  { n: "23A", title: "Pergerakan Belia PBB", text: "Keanggotaan Pergerakan Belia PBB merangkumi kesemua ahli biasa PBB sama ada lelaki atau perempuan yang berumur 18 tahun hingga 28 tahun." },
  { n: "24", title: "Syarat Menjadi Calon", text: "Seseorang ahli tidak boleh menjadi calon dalam mana-mana Pilihan Raya jika dia belum cukup tiga (3) tahun menjadi ahli, kecuali diputuskan oleh Majlis Tertinggi…" },
  { n: "25", title: "Disiplin Parti", text: "Semua ahli hendaklah cintakan Parti dalam amalan: patuh kepada Perlembagaan Parti, mengikut perintah Parti dan menjalankan dasar Parti…" },
  { n: "26", title: "Buku Daftar Keahlian", text: "Tiap-tiap peringkat Pejabat Setiausaha hendaklah menyimpan Buku Daftar Keahlian." },
  { n: "27", title: "Kad Keahlian", text: "Tiap-tiap ahli hendaklah mempunyai Kad Keahlian, yang dikeluarkan oleh Ibu Pejabat Parti." },
  { n: "28", title: "Sumber Kewangan", text: "Sumber kewangan Parti ialah yuran-yuran, derma-derma dan ikhtiar-ikhtiar lain dengan persetujuan Majlis Tertinggi." },
  { n: "29", title: "Yuran", text: "Tiap-tiap ahli hendaklah membayar kepada Bendahari Ranting sebanyak satu ringgit (RM1.00) pada tiap-tiap tahun." },
  { n: "30", title: "Peruntukan Kewangan", text: "Tiap-tiap peringkat Bendahari boleh menyimpan wang tunai tidak lebih daripada RM100.00 pada satu-satu masa; selebihnya disimpan dalam bank." },
  { n: "31", title: "Harta Tak Alih", text: "Tiap-tiap harta tak alih iaitu tanah atau bangunan kepunyaan Parti hendaklah didaftarkan atas nama Parti." },
  { n: "32", title: "Audit", text: "Perhimpunan Agung Tiga Tahun Sekali hendaklah melantik dua (2) orang Juruaudit untuk memeriksa Penyata Kira-Kira Parti." },
  { n: "33", title: "Peraturan-Peraturan", text: "Majlis Tertinggi berkuasa membuat sebarang peraturan bagi melicinkan jentera pentadbiran Parti, asalkan tidak bercanggah dengan Perlembagaan ini." },
  { n: "34", title: "Pindaan Perlembagaan", text: "Perlembagaan ini boleh dipinda ataupun dimansuhkan melalui suatu ketetapan yang dipersetujui oleh suara ramai dalam Perhimpunan Agung." },
  { n: "35", title: "Pungutan Suara (Referendum)", text: "Majlis Tertinggi berkuasa mendapatkan sesuatu keputusan mengenai sesuatu hal yang penting dengan cara pungutan suara." },
  { n: "36", title: "Pembubaran, Percantuman dan Lain-Lain", text: "Parti ini boleh dibubarkan, bercantum, bergabung ataupun masuk dalam suatu perikatan dengan mana-mana parti politik lain yang mempunyai tujuan yang lebih kurang sama." },
  { n: "37", title: "Pentafsiran", text: "“Bumiputera” ertinya suku-suku bangsa yang dianggap sebagai penduduk asli dalam Sarawak." },
  { n: "38", title: "Peruntukan Umum: Cawangan, Ranting dan Pergerakan", text: "Peruntukan umum bagi pentadbiran dan pengurusan Cawangan, Ranting, Pergerakan Pemuda, Pergerakan Wanita dan Pergerakan Belia PBB…" },
  { n: "39", title: "Peruntukan-Peruntukan Khas", text: "Semua ahli Majlis Tertinggi, Jawatankuasa Cawangan dan Jawatankuasa Ranting hendaklah terdiri daripada warganegara Malaysia." },
  { n: "40", title: "Tarikh Kuatkuasa Perlembagaan", text: "Perlembagaan ini hanya berkuatkuasa mulai dari tarikh ia diluluskan oleh Pendaftar Pertubuhan Malaysia." },
];

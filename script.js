
// =====================================
// 1. MENGAMBIL DATA DARI LOCAL STORAGE
// =====================================

let transaksi = [];

try {
    transaksi = JSON.parse(
        localStorage.getItem("catatanKeuangan")
    ) || [];
} catch (error) {
    transaksi = [];
}

let idEdit = null;


// =====================================
// 2. MENGHUBUNGKAN ELEMEN HTML
// =====================================

const form = document.getElementById("formTransaksi");

const nama = document.getElementById("nama");
const jumlah = document.getElementById("jumlah");
const jenis = document.getElementById("jenis");
const tanggal = document.getElementById("tanggal");

const daftar = document.getElementById("daftarTransaksi");
const pencarian = document.getElementById("pencarian");

const totalSaldo = document.getElementById("totalSaldo");
const totalPemasukan = document.getElementById("totalPemasukan");
const totalPengeluaran = document.getElementById("totalPengeluaran");

const tombolSimpan = document.getElementById("tombolSimpan");
const tombolBatal = document.getElementById("tombolBatal");


// =====================================
// 3. FORMAT RUPIAH
// =====================================

function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
}


// =====================================
// 4. MENYIMPAN DATA
// =====================================

function simpanData() {

    try {
        localStorage.setItem(
            "catatanKeuangan",
            JSON.stringify(transaksi)
        );

        return true;

    } catch (error) {

        alert("Penyimpanan gagal. Periksa ruang penyimpanan browser.");

        return false;
    }

}


// =====================================
// 5. MENGHITUNG DASHBOARD
// =====================================

function hitungDashboard() {

    let pemasukan = 0;
    let pengeluaran = 0;

    transaksi.forEach(item => {

        if (item.jenis === "pemasukan") {
            pemasukan += item.jumlah;
        } else {
            pengeluaran += item.jumlah;
        }

    });

    totalSaldo.textContent =
        formatRupiah(pemasukan - pengeluaran);

    totalPemasukan.textContent =
        formatRupiah(pemasukan);

    totalPengeluaran.textContent =
        formatRupiah(pengeluaran);

}


// =====================================
// 6. MENAMPILKAN TRANSAKSI
// =====================================

function tampilkanTransaksi() {

    daftar.innerHTML = "";

    const kataKunci = pencarian.value.toLowerCase();

    const hasil = transaksi.filter(item => {

        return (
            item.nama.toLowerCase().includes(kataKunci) ||
            item.jenis.toLowerCase().includes(kataKunci) ||
            item.tanggal.includes(kataKunci)
        );

    });

    if (hasil.length === 0) {

        const baris = document.createElement("tr");
        const kolom = document.createElement("td");

        kolom.colSpan = 6;
        kolom.textContent = "Belum ada transaksi";
        kolom.className = "kosong";

        baris.appendChild(kolom);
        daftar.appendChild(baris);

    }

    hasil.forEach((item, index) => {

        const baris = document.createElement("tr");

        // Nomor
        const kolomNo = document.createElement("td");
        kolomNo.textContent = index + 1;

        // Tanggal
        const kolomTanggal = document.createElement("td");
        kolomTanggal.textContent = item.tanggal;

        // Nama
        const kolomNama = document.createElement("td");
        kolomNama.textContent = item.nama;

        // Jenis
        const kolomJenis = document.createElement("td");
        const label = document.createElement("span");

        label.textContent =
            item.jenis === "pemasukan"
                ? "Pemasukan"
                : "Pengeluaran";

        label.className =
            item.jenis === "pemasukan"
                ? "badge-masuk"
                : "badge-keluar";

        kolomJenis.appendChild(label);

        // Jumlah
        const kolomJumlah = document.createElement("td");
        kolomJumlah.textContent = formatRupiah(item.jumlah);

        // Tombol aksi
        const kolomAksi = document.createElement("td");
        const aksi = document.createElement("div");

        aksi.className = "aksi";

        const tombolEdit = document.createElement("button");
        tombolEdit.textContent = "Edit";
        tombolEdit.className = "edit";

        tombolEdit.addEventListener("click", () => {
            editTransaksi(item.id);
        });

        const tombolHapus = document.createElement("button");
        tombolHapus.textContent = "Hapus";
        tombolHapus.className = "hapus";

        tombolHapus.addEventListener("click", () => {
            hapusTransaksi(item.id);
        });

        aksi.append(tombolEdit, tombolHapus);
        kolomAksi.appendChild(aksi);

        baris.append(
            kolomNo,
            kolomTanggal,
            kolomNama,
            kolomJenis,
            kolomJumlah,
            kolomAksi
        );

        daftar.appendChild(baris);

    });

    hitungDashboard();

}


// =====================================
// 7. TAMBAH TRANSAKSI
// =====================================

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const data = {

        id: idEdit !== null ? idEdit : Date.now(),

        nama: nama.value.trim(),

        jumlah: Number(jumlah.value),

        jenis: jenis.value,

        tanggal: tanggal.value

    };

    if (
        data.nama === "" ||
        !Number.isFinite(data.jumlah) ||
        data.jumlah <= 0 ||
        !data.tanggal
    ) {

        alert("Mohon isi semua data dengan benar!");

        return;
    }

    if (idEdit !== null) {

        transaksi = transaksi.map(item => {

            return item.id === idEdit ? data : item;

        });

        idEdit = null;

        tombolSimpan.textContent = "+ Simpan Transaksi";

        tombolBatal.hidden = true;

    } else {

        transaksi.push(data);

    }

    if (!simpanData()) return;

    form.reset();

    tanggal.value = new Date().toLocaleDateString("en-CA");

    tampilkanTransaksi();

    alert("Transaksi berhasil disimpan!");

});


// =====================================
// 8. EDIT TRANSAKSI
// =====================================

function editTransaksi(id) {

    const item = transaksi.find(data => data.id === id);

    if (!item) return;

    nama.value = item.nama;
    jumlah.value = item.jumlah;
    jenis.value = item.jenis;
    tanggal.value = item.tanggal;

    idEdit = id;

    tombolSimpan.textContent = "Simpan Perubahan";

    tombolBatal.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// =====================================
// 9. BATAL EDIT
// =====================================

tombolBatal.addEventListener("click", function() {

    idEdit = null;

    form.reset();

    tanggal.value = new Date().toLocaleDateString("en-CA");

    tombolSimpan.textContent = "+ Simpan Transaksi";

    tombolBatal.hidden = true;

});


// =====================================
// 10. HAPUS TRANSAKSI
// =====================================

function hapusTransaksi(id) {

    const yakin = confirm(
        "Apakah kamu yakin ingin menghapus transaksi ini?"
    );

    if (!yakin) return;

    const dataLama = transaksi;

    transaksi = transaksi.filter(item => item.id !== id);

    if (!simpanData()) {

        transaksi = dataLama;

        return;
    }

    if (idEdit === id) {

        idEdit = null;

        form.reset();

        tombolSimpan.textContent = "+ Simpan Transaksi";

        tombolBatal.hidden = true;

    }

    tampilkanTransaksi();

    alert("Transaksi berhasil dihapus!");

}


// =====================================
// 11. PENCARIAN TRANSAKSI
// =====================================

pencarian.addEventListener("input", function() {

    tampilkanTransaksi();

});


// =====================================
// 12. TANGGAL OTOMATIS
// =====================================

tanggal.value = new Date().toLocaleDateString("en-CA");

document.getElementById("tanggalHari").textContent =
    new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });


// =====================================
// 13. MENJALANKAN APLIKASI
// =====================================

tampilkanTransaksi();

console.log("Aplikasi Catatan Keuangan berhasil dijalankan!");




}

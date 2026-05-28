(function () {
  // DOM elements
  const pinjamanEl = document.getElementById("pinjaman");
  const angsuranEl = document.getElementById("angsuran");
  const sisaAngsuranEl = document.getElementById("sisaAngsuran");
  const dendaEl = document.getElementById("denda");
  const diskonEl = document.getElementById("diskon");
  const pajakEl = document.getElementById("pajak");
  const asuransiEl = document.getElementById("asuransi");
  const totalEl = document.getElementById("totalDidapat");
  const slider = document.getElementById("pinjamanSlider");

  // Helper: parse angka dari format Rupiah Indonesia
  function parseRupiah(str) {
    if (!str) return 0;
    let cleaned = String(str).replace(/\./g, "").replace(/,/g, ".");
    let match = cleaned.match(/-?\d+(?:\.\d+)?/);
    let num = match ? parseFloat(match[0]) : 0;
    return isNaN(num) ? 0 : num;
  }

  // Format ke Rupiah dengan 2 desimal
  function formatRupiah(angka) {
    if (isNaN(angka)) return "0,00";
    let fixed = angka.toFixed(2);
    let parts = fixed.split(".");
    let intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${intPart},${parts[1]}`;
  }

  function setFormatted(field, value) {
    if (field) field.value = formatRupiah(value);
  }

  function getNumber(field) {
    return field ? parseRupiah(field.value) : 0;
  }

  function getSisa() {
    let val = sisaAngsuranEl ? parseInt(sisaAngsuranEl.value, 10) : 0;
    return isNaN(val) ? 0 : val;
  }

  // Hitung ulang semua
  function hitung() {
    let pokok = getNumber(pinjamanEl);
    let angsuran = getNumber(angsuranEl);
    let sisa = getSisa();
    let denda = getNumber(dendaEl);
    let diskon = getNumber(diskonEl);
    let pajak = getNumber(pajakEl);

    let asuransi = pokok * 0.015;
    asuransi = Math.round(asuransi * 100) / 100;

    let pengurangan = angsuran * sisa;
    let subtotal = pokok - pengurangan;
    let total = subtotal - asuransi - pajak + diskon - denda;
    total = Math.round(total * 100) / 100;

    if (asuransiEl) setFormatted(asuransiEl, asuransi);
    if (totalEl) setFormatted(totalEl, total);
    if (slider) slider.value = pokok;
  }

  // Event binding dengan performa
  function bindEvents() {
    const inputs = [
      pinjamanEl,
      angsuranEl,
      dendaEl,
      diskonEl,
      pajakEl,
      sisaAngsuranEl,
    ];
    inputs.forEach((inp) => {
      if (!inp) return;
      inp.addEventListener("input", () => hitung());
      inp.addEventListener("change", () => hitung());
    });

    // Format saat blur / focus
    const currencyFields = [pinjamanEl, angsuranEl, dendaEl, diskonEl, pajakEl];
    currencyFields.forEach((field) => {
      if (!field) return;
      field.addEventListener("blur", () => {
        let val = getNumber(field);
        setFormatted(field, val);
        hitung();
      });
      field.addEventListener("focus", () => {
        let raw = getNumber(field);
        field.value = raw.toString().replace(".", ",");
      });
    });

    if (sisaAngsuranEl) {
      sisaAngsuranEl.addEventListener("change", () => hitung());
    }

    if (slider) {
      slider.addEventListener("input", (e) => {
        let val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          setFormatted(pinjamanEl, val);
          hitung();
        }
      });
    }
  }

  // Reset semua ke 0
  function resetAll() {
    setFormatted(pinjamanEl, 0);
    setFormatted(angsuranEl, 0);
    if (sisaAngsuranEl) sisaAngsuranEl.value = 0;
    setFormatted(dendaEl, 0);
    setFormatted(diskonEl, 0);
    setFormatted(pajakEl, 0);
    hitung();
  }

  // Copy hasil
  function copyTotal() {
    let totalRaw = totalEl ? totalEl.value : "0";
    navigator.clipboard
      .writeText(`Rp ${totalRaw}`)
      .then(() => {
        showToast(`✓ Total disalin: Rp ${totalRaw}`);
      })
      .catch(() => alert("Gagal menyalin"));
  }

  function showToast(msg) {
    let toast = document.createElement("div");
    toast.innerText = msg;
    toast.style.cssText =
      "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#0f172a;color:white;padding:6px 16px;border-radius:40px;font-size:0.8rem;z-index:9999;backdrop-filter:blur(6px);";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  // Print kwitansi (struk minimal)
  function printStruk() {
    // Ambil data terbaru
    let pokok = getNumber(pinjamanEl);
    let angsuran = getNumber(angsuranEl);
    let sisa = getSisa();
    let denda = getNumber(dendaEl);
    let diskon = getNumber(diskonEl);
    let pajak = getNumber(pajakEl);
    let asuransi = pokok * 0.015;
    let total = pokok - angsuran * sisa - asuransi - pajak + diskon - denda;
    total = Math.round(total * 100) / 100;

    // Isi template print
    document.getElementById("print-pinjaman").innerText =
      `Rp ${formatRupiah(pokok)}`;
    document.getElementById("print-angsuran").innerText =
      `Rp ${formatRupiah(angsuran)}`;
    document.getElementById("print-sisa").innerText = `${sisa} kali`;
    document.getElementById("print-denda").innerText =
      `Rp ${formatRupiah(denda)}`;
    document.getElementById("print-diskon").innerText =
      `Rp ${formatRupiah(diskon)}`;
    document.getElementById("print-asuransi").innerText =
      `Rp ${formatRupiah(asuransi)}`;
    document.getElementById("print-pajak").innerText =
      `Rp ${formatRupiah(pajak)}`;
    document.getElementById("print-total").innerText =
      `Rp ${formatRupiah(total)}`;
    document.getElementById("print-date").innerText = new Date().toLocaleString(
      "id-ID",
    );

    // Buat elemen print sementara
    let printContent = document.getElementById("print-template").innerHTML;
    let originalTitle = document.title;
    document.title = "Kwitansi Pinjaman";

    let printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.write(`
      <html>
        <head><title>Kwitansi Pinjaman</title>
        <style>
          body { font-family: monospace; padding: 1rem; margin:0; }
          .print-struk { max-width: 280px; margin:0 auto; border:1px solid #000; padding:1rem; }
          .print-table td { padding: 4px 0; }
          .print-table td:last-child { text-align: right; }
          hr { margin: 8px 0; }
        </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
    document.title = originalTitle;
  }

  // Tombol
  document.getElementById("resetBtn")?.addEventListener("click", resetAll);
  document.getElementById("copyBtn")?.addEventListener("click", copyTotal);
  document.getElementById("printBtn")?.addEventListener("click", printStruk);

  // Inisialisasi
  resetAll();
  bindEvents();
})();

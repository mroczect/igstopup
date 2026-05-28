(function () {
  const pinjamanEl = document.getElementById("pinjaman");
  const angsuranEl = document.getElementById("angsuran");
  const sisaAngsuranEl = document.getElementById("sisaAngsuran");
  const dendaEl = document.getElementById("denda");
  const diskonEl = document.getElementById("diskon");
  const pajakEl = document.getElementById("pajak");
  const asuransiEl = document.getElementById("asuransi");
  const totalDidapatEl = document.getElementById("totalDidapat");
  const pinjamanSlider = document.getElementById("pinjamanSlider");

  function parseRupiahToNumber(value) {
    if (value === undefined || value === null) return 0;
    let str = String(value).trim();
    if (str === "") return 0;
    let cleaned = str.replace(/\./g, "").replace(/,/g, ".");
    let match = cleaned.match(/-?\d+(?:\.\d+)?/);
    if (!match) return 0;
    let num = parseFloat(match[0]);
    return isNaN(num) ? 0 : num;
  }

  function formatRupiah(angka) {
    if (isNaN(angka) || angka === null) return "0,00";
    let fixed = angka.toFixed(2);
    let parts = fixed.split(".");
    let integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${integerPart},${parts[1]}`;
  }

  function setFormattedCurrency(field, numericValue) {
    if (field) field.value = formatRupiah(numericValue);
  }

  function getCurrencyNumber(field) {
    return field ? parseRupiahToNumber(field.value) : 0;
  }

  function getSisaCount() {
    let val = sisaAngsuranEl ? parseInt(sisaAngsuranEl.value, 10) : 0;
    return isNaN(val) ? 0 : val;
  }

  function hitungTotal() {
    let pinjaman = getCurrencyNumber(pinjamanEl);
    let angsuran = getCurrencyNumber(angsuranEl);
    let sisa = getSisaCount();
    let denda = getCurrencyNumber(dendaEl);
    let diskon = getCurrencyNumber(diskonEl);
    let pajak = getCurrencyNumber(pajakEl);

    let asuransi = pinjaman * 0.015;
    asuransi = Math.round(asuransi * 100) / 100;

    let penguranganAngsuran = angsuran * sisa;
    let subtotal = pinjaman - penguranganAngsuran;
    let total = subtotal - asuransi - pajak + diskon - denda;
    total = Math.round(total * 100) / 100;

    if (asuransiEl) setFormattedCurrency(asuransiEl, asuransi);
    if (totalDidapatEl) setFormattedCurrency(totalDidapatEl, total);
    if (pinjamanSlider) pinjamanSlider.value = pinjaman;
  }

  function formatAllCurrencyFields() {
    const fields = [pinjamanEl, angsuranEl, dendaEl, diskonEl, pajakEl];
    fields.forEach((field) => {
      if (field) {
        let num = getCurrencyNumber(field);
        setFormattedCurrency(field, num);
      }
    });
    hitungTotal();
  }

  function attachEvents() {
    const liveInputs = [
      pinjamanEl,
      angsuranEl,
      dendaEl,
      diskonEl,
      pajakEl,
      sisaAngsuranEl,
    ];
    liveInputs.forEach((inp) => {
      if (inp) {
        inp.addEventListener("input", () => hitungTotal());
        inp.addEventListener("change", () => hitungTotal());
      }
    });

    const currencyFields = [pinjamanEl, angsuranEl, dendaEl, diskonEl, pajakEl];
    currencyFields.forEach((field) => {
      if (!field) return;
      field.addEventListener("blur", function () {
        let raw = getCurrencyNumber(field);
        setFormattedCurrency(field, raw);
        hitungTotal();
      });
      field.addEventListener("focus", function () {
        let raw = getCurrencyNumber(field);
        field.value = raw.toString().replace(".", ",");
      });
    });

    if (sisaAngsuranEl) {
      sisaAngsuranEl.addEventListener("change", function () {
        let val = parseInt(sisaAngsuranEl.value, 10);
        if (isNaN(val)) val = 0;
        sisaAngsuranEl.value = val;
        hitungTotal();
      });
    }

    if (pinjamanSlider) {
      pinjamanSlider.addEventListener("input", function () {
        let val = parseFloat(pinjamanSlider.value);
        if (!isNaN(val)) {
          setFormattedCurrency(pinjamanEl, val);
          hitungTotal();
        }
      });
    }
  }

  function resetAllToZero() {
    if (pinjamanEl) setFormattedCurrency(pinjamanEl, 0);
    if (angsuranEl) setFormattedCurrency(angsuranEl, 0);
    if (sisaAngsuranEl) sisaAngsuranEl.value = 0;
    if (dendaEl) setFormattedCurrency(dendaEl, 0);
    if (diskonEl) setFormattedCurrency(diskonEl, 0);
    if (pajakEl) setFormattedCurrency(pajakEl, 0);
    hitungTotal();
  }

  function copyResult() {
    let totalValue = totalDidapatEl ? totalDidapatEl.value : "0";
    navigator.clipboard
      .writeText(`Rp ${totalValue}`)
      .then(() => {
        let toast = document.createElement("div");
        toast.innerText = "✓ Hasil disalin: Rp " + totalValue;
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.background = "#1f3a5f";
        toast.style.color = "white";
        toast.style.padding = "0.5rem 1rem";
        toast.style.borderRadius = "40px";
        toast.style.fontSize = "0.8rem";
        toast.style.zIndex = "999";
        toast.style.backdropFilter = "blur(8px)";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      })
      .catch(() => alert("Gagal menyalin hasil"));
  }

  function bindButtons() {
    const resetBtn = document.getElementById("resetBtn");
    const printBtn = document.getElementById("printBtn");
    const copyBtn = document.getElementById("copyBtn");
    if (resetBtn)
      resetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        resetAllToZero();
      });
    if (printBtn) printBtn.addEventListener("click", () => window.print());
    if (copyBtn) copyBtn.addEventListener("click", () => copyResult());
  }

  function init() {
    resetAllToZero();
    attachEvents();
    bindButtons();
    formatAllCurrencyFields();
  }

  init();
})();

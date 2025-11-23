// İki oyuncuya birden -100 puan ekleyen fonksiyon
function addBonusGroup(player1, player2) {
  // group tick should add a bonus row and highlight the penalized cell green
  addBonusRow([player1, player2], true);
}

// Tabloya iki sütunu birleştirip -100 yazan satır ekler
function addBonusRow(group, highlight = false) {
  const tableBody = document.getElementById("dataBody");
  const newRow = tableBody.insertRow();
  // Daha tutarlı veri yapısı için colspan kullanmıyoruz: her zaman 4 hücre oluştur
  // ve ceza uygulanan sütuna -100 yazıp .penalty-cell uygula; diğerlerini boş bırak
  // hücre sırası: 0=Recep,1=Furkan,2=Ilker,3=Omer
  const cells = [];
  for (let i = 0; i < 4; i++) cells.push(newRow.insertCell());

  if (group[0] === "Recep" && group[1] === "Furkan") {
    // uygulamayı Recep sütununa yaz (ilk sütun)
    cells[0].textContent = "-100";
    if (highlight) {
      cells[0].classList.add("tick-highlight");
    } else {
      cells[0].classList.add("penalty-cell");
    }
    // (Ses yalnızca 'Ceza Ekle' ile çalınacak; tik butonları sessiz kalacak)
  } else if (group[0] === "Ilker" && group[1] === "Omer") {
    // uygulamayı Ilker sütununa yaz (3. sütun, index 2)
    cells[2].textContent = "-100";
    if (highlight) {
      cells[2].classList.add("tick-highlight");
    } else {
      cells[2].classList.add("penalty-cell");
    }
  }
  updateColumnTotals();
  saveData();
}

// Sayfanın ekran görüntüsünü alıp indiren fonksiyon
function takeScreenshot() {
  const table = document.querySelector("table");
  if (!table) return;
  html2canvas(table).then(function (canvas) {
    const link = document.createElement("a");
    link.download = "tablo-ekran-goruntusu.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

// Butona tıklanınca ekran görüntüsü al
window.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("screenshotBtn");
  if (btn) {
    btn.addEventListener("click", takeScreenshot);
  }
});
// Bonus butonuna basınca ilgili oyuncuya -100 puan ekler
function addBonus(player) {
  // Tabloya yeni bir satır eklemek için mevcut input değerlerini oku
  const recep = parseFloat(document.getElementById("inputRecep").value) || 0;
  const furkan = parseFloat(document.getElementById("inputFurkan").value) || 0;
  const ilker = parseFloat(document.getElementById("inputIlker").value) || 0;
  const omer = parseFloat(document.getElementById("inputOmer").value) || 0;

  // İlgili oyuncuya -100 ekle
  if (player === "Recep") {
    document.getElementById("inputRecep").value = recep - 100;
    // işaretle: sonraki addRow çağrısında bu sütunu vurgula (yeşil)
    window._tickHighlight = { col: 0 };
  } else if (player === "Furkan") {
    document.getElementById("inputFurkan").value = furkan - 100;
    window._tickHighlight = { col: 1 };
  } else if (player === "Ilker") {
    document.getElementById("inputIlker").value = ilker - 100;
    window._tickHighlight = { col: 2 };
  } else if (player === "Omer") {
    document.getElementById("inputOmer").value = omer - 100;
    window._tickHighlight = { col: 3 };
  }
  // Değişiklikten sonra satırı hemen ekle
  addRow();
}
// Tabloya yeni bir satır ekleme fonksiyonu
function addRow() {
  // Giriş alanlarından değerleri al
  const recep = parseFloat(document.getElementById("inputRecep").value) || 0;
  const ilker = parseFloat(document.getElementById("inputIlker").value) || 0;
  const furkan = parseFloat(document.getElementById("inputFurkan").value) || 0;
  const omer = parseFloat(document.getElementById("inputOmer").value) || 0;

  // Eğer tüm değerler 0 ise veya hiçbiri girilmemişse uyarı ver
  if (recep === 0 && ilker === 0 && furkan === 0 && omer === 0) {
    alert("Lütfen en az bir kişiye değer giriniz!");
    return;
  }

  // Yeni satır (tr) ve hücreler (td) oluştur
  const tableBody = document.getElementById("dataBody");
  const newRow = tableBody.insertRow();

  // Hücrelere değerleri ekle
  // Yeni düzen: Recep, Furkan, İlker, Ömer (2. ve 3. sütun yer değişti)
  newRow.insertCell().textContent = recep;
  newRow.insertCell().textContent = furkan;
  newRow.insertCell().textContent = ilker;
  newRow.insertCell().textContent = omer;

  // Eğer bir tick vurgulaması planlandıysa, ve hedef hücrede -100 varsa yeşil vurgula
  if (window._tickHighlight) {
    try {
      const idx = window._tickHighlight.col;
      const cells = newRow.querySelectorAll("td");
      if (
        cells[idx] &&
        cells[idx].textContent &&
        cells[idx].textContent.toString().trim() === "-100"
      ) {
        cells[idx].classList.add("tick-highlight");
      }
    } catch (e) {
      console.warn("tick highlight error", e);
    }
    // temizle
    delete window._tickHighlight;
  }

  // Not: satır toplamı sütunu artık gösterilmiyor — yalnızca dört hücre ekleniyor

  // Giriş alanlarını temizle
  document.getElementById("inputRecep").value = "";
  document.getElementById("inputIlker").value = "";
  document.getElementById("inputFurkan").value = "";
  document.getElementById("inputOmer").value = "";

  // Genel toplamı güncelle
  updateColumnTotals();
  // save data after normal add
  saveData();
}

// Ceza ekleyen fonksiyon: inputtaki değerleri kırmızı kalın hücrelerle tabloya ekler
function addPenaltyRow() {
  const inputRecepEl = document.getElementById("inputRecep");
  const inputFurkanEl = document.getElementById("inputFurkan");
  const inputIlkerEl = document.getElementById("inputIlker");
  const inputOmerEl = document.getElementById("inputOmer");

  const valRecep = inputRecepEl.value.trim();
  const valFurkan = inputFurkanEl.value.trim();
  const valIlker = inputIlkerEl.value.trim();
  const valOmer = inputOmerEl.value.trim();

  // en az bir değerin girilmiş olması kontrolü
  if (!valRecep && !valFurkan && !valIlker && !valOmer) {
    alert("Lütfen ceza uygulanacak sütuna bir değer giriniz!");
    return;
  }

  const tableBody = document.getElementById("dataBody");
  const newRow = tableBody.insertRow();

  // Sadece inputa girilen (boş olmayan) sütunları doldur, diğerlerini boş bırak
  const c1 = newRow.insertCell();
  if (valRecep !== "") {
    c1.textContent = valRecep;
    c1.classList.add("penalty-cell");
    // çal Recep ses dosyası (kullanıcı etkileşimi ile çağrıldı)
    try {
      const audio = new Audio("ceza.mp3");
      audio.play().catch((err) => console.warn("Audio play failed:", err));
    } catch (e) {
      console.warn("Audio initialization failed:", e);
    }
  } else {
    c1.textContent = "";
  }

  const c2 = newRow.insertCell();
  if (valFurkan !== "") {
    c2.textContent = valFurkan;
    c2.classList.add("penalty-cell");
  } else {
    c2.textContent = "";
  }

  const c3 = newRow.insertCell();
  if (valIlker !== "") {
    c3.textContent = valIlker;
    c3.classList.add("penalty-cell");
  } else {
    c3.textContent = "";
  }

  const c4 = newRow.insertCell();
  if (valOmer !== "") {
    c4.textContent = valOmer;
    c4.classList.add("penalty-cell");
  } else {
    c4.textContent = "";
  }

  // temizle
  inputRecepEl.value = "";
  inputFurkanEl.value = "";
  inputIlkerEl.value = "";
  inputOmerEl.value = "";

  updateColumnTotals();
  saveData();
}

// Tüm satırların toplamını hesaplama fonksiyonu
function updateColumnTotals() {
  const rows = document.querySelectorAll("#dataBody tr");
  let sumRecep = 0;
  let sumFurkan = 0;
  let sumIlker = 0;
  let sumOmer = 0;

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 4) {
      // Yeni sütun sırası: 0=Recep, 1=Furkan, 2=Ilker, 3=Omer
      sumRecep += parseFloat(cells[0].textContent) || 0;
      sumFurkan += parseFloat(cells[1].textContent) || 0;
      sumIlker += parseFloat(cells[2].textContent) || 0;
      sumOmer += parseFloat(cells[3].textContent) || 0;
    }
  });

  document.getElementById("totalRecep").textContent = sumRecep;
  document.getElementById("totalFurkan").textContent = sumFurkan;
  document.getElementById("totalIlker").textContent = sumIlker;
  document.getElementById("totalOmer").textContent = sumOmer;

  // Yeni footer satırı için: 1. hücre = 1. ve 2. sütun toplamı, 2. hücre = 3. ve 4. sütun toplamı
  const combined12 = sumRecep + sumFurkan;
  const combined34 = sumIlker + sumOmer;

  const el12 = document.getElementById("combined12");
  const el34 = document.getElementById("combined34");
  if (el12) el12.textContent = combined12;
  if (el34) el34.textContent = combined34;

  // Küçük olan hücreye yeşil, büyük olana kırmızı sınıfı ver
  if (el12 && el34) {
    el12.classList.remove("smaller", "larger");
    el34.classList.remove("smaller", "larger");

    if (combined12 < combined34) {
      el12.classList.add("smaller"); // yeşil olacak
      el34.classList.add("larger"); // kırmızı olacak
    } else if (combined12 > combined34) {
      el12.classList.add("larger"); // kırmızı olacak
      el34.classList.add("smaller"); // yeşil olacak
    } else {
      // eşitse hiçbir renklendirme uygulanmasın
    }
  }

  // combinedRow ve totalRow'u sadece 6. elde ve sonrasında göster
  // Cezalı satırları (penalty) sayıya katma: sadece cezalar hariç satır sayısını kontrol et
  const combinedRowEl = document.getElementById("combinedRow");
  const totalRowEl = document.getElementById("totalRow");
  if (combinedRowEl || totalRowEl) {
    const showThreshold = 6; // 6. elde göster
    // hesapla: cezalı olmayan satır sayısı
    let nonPenaltyCount = 0;
    rows.forEach((row) => {
      // eğer satırda penalty-cell sınıfı varsa bunu cezalı satır say
      const hasPenaltyClass = row.querySelector(".penalty-cell") !== null;
      // ayrıca hücrelerden herhangi biri negatif değer içeriyorsa cezalı say
      let hasNegativeText = false;
      row.querySelectorAll("td").forEach((td) => {
        if (
          td.textContent &&
          td.textContent.toString().trim().startsWith("-")
        ) {
          hasNegativeText = true;
        }
      });
      if (!hasPenaltyClass && !hasNegativeText) nonPenaltyCount++;
    });

    if (nonPenaltyCount >= showThreshold) {
      if (combinedRowEl) combinedRowEl.style.display = "table-row";
      if (totalRowEl) totalRowEl.style.display = "table-row";
    } else {
      if (combinedRowEl) combinedRowEl.style.display = "none";
      if (totalRowEl) totalRowEl.style.display = "none";
    }
  }
}

// LocalStorage anahtarı
const STORAGE_KEY = "tableRows101";

// Verileri kaydeden fonksiyon
function saveData() {
  const rows = [];
  document.querySelectorAll("#dataBody tr").forEach((row) => {
    const cells = row.querySelectorAll("td");
    // push exactly 4 entries (empty string if cell is empty)
    if (cells.length >= 4) {
      rows.push([
        cells[0].textContent || "",
        cells[1].textContent || "",
        cells[2].textContent || "",
        cells[3].textContent || "",
      ]);
    }
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch (e) {
    console.warn("localStorage hata:", e);
  }
}

// LocalStorage'dan verileri yükleyen fonksiyon
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      updateColumnTotals();
      return;
    }
    const rows = JSON.parse(raw);
    const tableBody = document.getElementById("dataBody");
    tableBody.innerHTML = "";
    rows.forEach((r) => {
      const newRow = tableBody.insertRow();
      newRow.insertCell().textContent = r[0] || "";
      newRow.insertCell().textContent = r[1] || "";
      newRow.insertCell().textContent = r[2] || "";
      newRow.insertCell().textContent = r[3] || "";
    });
  } catch (e) {
    console.warn("loadData hata:", e);
  }
  updateColumnTotals();
}

// Sayfa yüklendiğinde verileri localStorage'dan yükle
window.addEventListener("load", loadData);

// Uygulamayı sıfırlayan (yeni oyuna başlatan) fonksiyon
function resetGame() {
  if (!confirm("Yeni oyuna başlamak için tüm verileri silmek istiyor musunuz?"))
    return;
  // Tablo satırlarını temizle
  const bodyEl = document.getElementById("dataBody");
  if (bodyEl) bodyEl.innerHTML = "";
  // Toplam hücreleri sıfırla
  [
    "totalRecep",
    "totalFurkan",
    "totalIlker",
    "totalOmer",
    "combined12",
    "combined34",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "0";
  });
  // Footer satırlarını gizle (yeniden eşik sağlanana kadar)
  const combinedRowEl = document.getElementById("combinedRow");
  const totalRowEl = document.getElementById("totalRow");
  if (combinedRowEl) combinedRowEl.style.display = "none";
  if (totalRowEl) totalRowEl.style.display = "none";
  // Input alanlarını temizle
  ["inputRecep", "inputFurkan", "inputIlker", "inputOmer"].forEach((id) => {
    const inp = document.getElementById(id);
    if (inp) inp.value = "";
  });
  // Geçici highlight işaretçisi varsa temizle
  if (window._tickHighlight) delete window._tickHighlight;
  // LocalStorage verisini sil
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("localStorage reset hata:", e);
  }
  // Her şey temizlendi, görünümü güncelle
  updateColumnTotals();
}

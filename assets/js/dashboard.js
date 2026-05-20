const API_URL = "https://script.google.com/macros/s/AKfycbzjwwI0-ltt-BZv1FbymmLtikDR9UevoQjRYIUrKthpDCBlVEPZFCbccPTvQUG5zvuGMg/exec";

let allUsers = [];
let filteredUsers = [];

const searchInput = document.getElementById("searchInput");
const paisFilter = document.getElementById("paisFilter");
const comunidadFilter = document.getElementById("comunidadFilter");
const cristianaFilter = document.getElementById("cristianaFilter");
const usersTableBody = document.getElementById("usersTableBody");
const totalCount = document.getElementById("totalCount");
const filteredCount = document.getElementById("filteredCount");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const lastUpdatedText = document.getElementById("lastUpdatedText");

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function pick(obj, keys) {
  for (const key of keys) {
    if (obj && obj[key] != null && String(obj[key]).trim() !== "") {
      return obj[key];
    }
  }
  return "";
}

function normalizeUser(user, index) {
  const nombre = pick(user, ["nombre", "firstName"]);
  const apellido = pick(user, ["apellido", "lastName"]);
  const nombreCompleto = pick(user, ["nombreCompleto", "fullName"]) || `${nombre} ${apellido}`.trim();

  return {
    id: pick(user, ["id"]) || index + 1,
    timestamp: pick(user, ["timestamp", "fecha", "createdAt"]),
    nombre,
    apellido,
    nombreCompleto,
    email: pick(user, ["email", "correo"]),
    telefono: pick(user, ["telefono", "phone", "phoneNumber"]),
    paisResidencia: pick(user, ["paisResidencia", "paisVive", "pais", "country"]),
    comunidad: pick(user, ["comunidad", "community"]),
    cristiana: pick(user, ["cristiana", "cristianaStatus", "faithStatus"])
  };
}

function fillSelectOptions(select, values, defaultLabel = "Todos") {
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = `<option value="">${defaultLabel}</option>`;

  const unique = [...new Set(
    values
      .map((v) => String(v || "").trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "es"));

  unique.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  if ([...select.options].some((opt) => opt.value === currentValue)) {
    select.value = currentValue;
  }
}

function renderTable(users) {
  if (!usersTableBody) return;

  if (!users.length) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-cell">No hay registros para mostrar.</td>
      </tr>
    `;
    return;
  }

  usersTableBody.innerHTML = users.map((user) => `
    <tr>
      <td>${escapeHtml(formatDate(user.timestamp))}</td>
      <td>${escapeHtml(user.nombreCompleto)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(user.telefono)}</td>
      <td>${escapeHtml(user.paisResidencia)}</td>
      <td>${escapeHtml(user.comunidad)}</td>
      <td>${escapeHtml(user.cristiana)}</td>
    </tr>
  `).join("");
}

function updateCounters() {
  if (totalCount) totalCount.textContent = allUsers.length;
  if (filteredCount) filteredCount.textContent = filteredUsers.length;
}

function applyFilters() {
  const search = normalizeText(searchInput?.value);
  const pais = paisFilter?.value || "";
  const comunidad = comunidadFilter?.value || "";
  const cristiana = cristianaFilter?.value || "";

  filteredUsers = allUsers.filter((user) => {
    const haystack = normalizeText([
      user.nombre,
      user.apellido,
      user.nombreCompleto,
      user.email,
      user.telefono,
      user.paisResidencia,
      user.comunidad,
      user.cristiana
    ].join(" "));

    const matchesSearch = !search || haystack.includes(search);
    const matchesPais = !pais || user.paisResidencia === pais;
    const matchesComunidad = !comunidad || user.comunidad === comunidad;
    const matchesCristiana = !cristiana || user.cristiana === cristiana;

    return matchesSearch && matchesPais && matchesComunidad && matchesCristiana;
  });

  renderTable(filteredUsers);
  updateCounters();
}

function clearFilters() {
  if (searchInput) searchInput.value = "";
  if (paisFilter) paisFilter.value = "";
  if (comunidadFilter) comunidadFilter.value = "";
  if (cristianaFilter) cristianaFilter.value = "";
  applyFilters();
}

async function loadDashboardData() {
  try {
    if (lastUpdatedText) lastUpdatedText.textContent = "Cargando datos...";

    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawUsers = Array.isArray(data.usuarios)
      ? data.usuarios
      : Array.isArray(data.Usuarios)
        ? data.Usuarios
        : [];

    allUsers = rawUsers
      .map(normalizeUser)
      .filter((user) =>
        user && (
          String(user.nombre || "").trim() ||
          String(user.apellido || "").trim() ||
          String(user.email || "").trim()
        )
      );

    filteredUsers = [...allUsers];

    fillSelectOptions(paisFilter, allUsers.map((u) => u.paisResidencia), "Todos");
    fillSelectOptions(comunidadFilter, allUsers.map((u) => u.comunidad), "Todas");
    fillSelectOptions(cristianaFilter, allUsers.map((u) => u.cristiana), "Todas");

    renderTable(filteredUsers);
    updateCounters();

    if (lastUpdatedText) {
      lastUpdatedText.textContent = "Actualizado correctamente";
    }
  } catch (error) {
    console.error("ERROR DASHBOARD:", error);

    if (usersTableBody) {
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-cell">Error cargando datos del dashboard.</td>
        </tr>
      `;
    }

    if (lastUpdatedText) {
      lastUpdatedText.textContent = "Error al cargar";
    }
  }
}

async function exportPDF() {
  const area = document.getElementById("pdfArea");
  if (!area || typeof window.jspdf === "undefined" || typeof window.html2canvas === "undefined") {
    alert("No se pudo exportar el PDF.");
    return;
  }

  const { jsPDF } = window.jspdf;

  try {
    if (exportPdfBtn) {
      exportPdfBtn.disabled = true;
    }

    document.body.classList.add("exporting-pdf");

    const canvas = await html2canvas(area, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: document.body.scrollWidth,
      windowHeight: document.body.scrollHeight,
      scrollX: 0,
      scrollY: -window.scrollY
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const leftRightMargin = 15;
    const topMarginFirstPage = 15;
    const topMarginOtherPages = 22;
    const bottomMargin = 22;
    const footerHeight = 10;

    const imgWidth = pageWidth - leftRightMargin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pagePadding = 10; // espacio entre páginas

let yOffset = 0; // cuánto de la imagen ya se ha usado

// Primera página
pdf.addImage(
  imgData,
  "PNG",
  leftRightMargin,
  topMarginFirstPage,
  imgWidth,
  imgHeight
);

yOffset += pageHeight - topMarginFirstPage - bottomMargin - footerHeight;

// Páginas siguientes
while (yOffset < imgHeight) {
  pdf.addPage();

  const position = topMarginOtherPages - yOffset + pagePadding;

  pdf.addImage(
    imgData,
    "PNG",
    leftRightMargin,
    position,
    imgWidth,
    imgHeight
  );

  yOffset += pageHeight - topMarginOtherPages - bottomMargin - footerHeight;
}


    const totalPages = pdf.internal.getNumberOfPages();
    const exportDate = new Date().toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    pdf.setPage(totalPages);
    pdf.setFontSize(10);
    pdf.setTextColor(120, 102, 102);
    pdf.text(
      `Exportado el ${exportDate}`,
      leftRightMargin,
      pageHeight - 8
    );
    pdf.text(
      `Página ${totalPages} de ${totalPages}`,
      pageWidth - leftRightMargin,
      pageHeight - 8,
      { align: "right" }
    );

    pdf.save("dashboard-mujeres-con-proposito.pdf");
  } catch (error) {
    console.error("ERROR PDF:", error);
    alert("No se pudo generar el PDF.");
  } finally {
    document.body.classList.remove("exporting-pdf");

    if (exportPdfBtn) {
      exportPdfBtn.disabled = false;
    }
  }
}

searchInput?.addEventListener("input", applyFilters);
paisFilter?.addEventListener("change", applyFilters);
comunidadFilter?.addEventListener("change", applyFilters);
cristianaFilter?.addEventListener("change", applyFilters);
clearFiltersBtn?.addEventListener("click", clearFilters);
exportPdfBtn?.addEventListener("click", exportPDF);

loadDashboardData();
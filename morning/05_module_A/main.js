// main.js - load paginated course data, render card/list, search, sort, pagination, and language toggle

const STATE = {
  page: 1,
  perPage: 10,
  layout: "card", // or 'list'
  sort: "date",
  lang: "zh",
  courses: [],
  allPages: 1,
  searchQuery: "",
};

const I18N = {
  zh: {
    pageTitle: "課程列表",
    pageSubtitle: "探索澳門生產力暨科技轉移中心的精彩課程",
    searchPlaceholder: "搜尋課程編號或名稱",
    sortBy: "排序方式",
    sortByDate: "按開課日期",
    sortByPrice: "按價格",
    layoutCard: "卡片排版",
    layoutList: "清單排版",
    card: "卡片",
    list: "清單",
    courseCode: "課程編號",
    startDate: "開課日期",
    price: "價格",
    capacity: "名額",
    enroll: "報名",
    details: "查看詳細",
    prevPage: "上一頁",
    nextPage: "下一頁",
    free: "免費",
    enrollAlert: "報名功能尚未開放，敬請期待！",
    dataError: "無法載入資料",
    footerHQ: "總辦事處",
    footerHQAddr: "澳門上海街175號中華總商會大廈六樓",
    footerFashion: "時尚匯點",
    footerFashionAddr: "澳門漁翁街海洋工業中心第二期十樓",
    footerDigital: "數碼匯點",
    footerDigitalAddr: "澳門馬統領街廠商會大廈三樓",
    footerWebsite: "網址",
    footerEmail: "電子郵件",
    switchTo: "切換為",
  },
  en: {
    pageTitle: "Course List",
    pageSubtitle: "Explore amazing courses from CPTTM",
    searchPlaceholder: "Search by course code or name",
    sortBy: "Sort by",
    sortByDate: "By Start Date",
    sortByPrice: "By Price",
    layoutCard: "Card Layout",
    layoutList: "List Layout",
    card: "Card",
    list: "List",
    courseCode: "Code",
    startDate: "Start Date",
    price: "Price",
    capacity: "Capacity",
    enroll: "Enroll",
    details: "Details",
    prevPage: "Prev",
    nextPage: "Next",
    free: "Free",
    enrollAlert: "Enrollment is not yet open, please stay tuned!",
    dataError: "Failed to load data",
    footerHQ: "Head Office",
    footerHQAddr:
      "6/F, Edificio da Associacao Comercial de Macau, No.175, Rua de Xangai, Macau",
    footerFashion: "House of Apparel Technology",
    footerFashionAddr:
      "10/F, Ocean Industrial Centre, Phase II, Rua dos Pescadores, Macau",
    footerDigital: "Cyber-Lab",
    footerDigitalAddr:
      "3/F, Edificio da Associacao dos Industriais de Macau, Rua do Comandante Mata e Oliveira, Macau",
    footerWebsite: "Website",
    footerEmail: "Email",
    switchTo: "Switch to",
  },
};

// --- DOM Elements ---
const coursesContainer = document.getElementById("coursesContainer");
const pagination = document.getElementById("pagination");
const paginationMobile = document.getElementById("paginationMobile");
const searchInputDesktop = document.getElementById("searchInputDesktop");
const clearSearchDesktop = document.getElementById("clearSearchDesktop");
const searchInputMobile = document.getElementById("searchInputMobile");
const clearSearchMobile = document.getElementById("clearSearchMobile");
const cardView = document.getElementById("cardView");
const listView = document.getElementById("listView");
const langToggle = document.getElementById("langToggle");
const mobileMenuContainer = document.getElementById("mobileMenuContainer");

// --- Toast Logic ---
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const closeToast = document.getElementById("closeToast");
let toastTimer = null;

function showToast(message, duration = 3000) {
  if (!toast || !toastMessage) return;

  const currentLang = STATE.lang || "zh";
  const closeText = I18N[currentLang].btnClose;

  toastMessage.textContent = message;
  if (closeToast) closeToast.textContent = closeText;

  toast.classList.remove("opacity-0", "translate-y-6");
  toast.classList.add("opacity-100", "translate-y-0");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    hideToast();
  }, duration);
}

function hideToast() {
  if (!toast) return;
  toast.classList.remove("opacity-100", "translate-y-0");
  toast.classList.add("opacity-0", "translate-y-6");
}

if (closeToast) {
  closeToast.addEventListener("click", hideToast);
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && toast && toast.classList.contains("opacity-100"))
    hideToast();
});

// --- Main Data Loading ---
async function loadPage(page = 1) {
  const url = `https://course-dummy-api-nine.vercel.app/courses/page-${page}.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(I18N[STATE.lang].dataError);
    const json = await res.json();

    STATE.courses = normalizeCourses(json);
    STATE.allPages = calculateTotalPages(json);
    STATE.page = Number(json.page) || page;

    render();
    renderPagination();
  } catch (e) {
    coursesContainer.innerHTML = `<div class="p-6 bg-white rounded shadow">${e.message}</div>`;
  }
}

// --- Data Normalization ---
function normalizeCourses(json) {
  const raw = json.courses || json.data || [];
  return (raw || []).map((r) => {
    const code = r.course_code || r.courseCode || "";
    const nameZh = r.c_title || "";
    const nameEn = r.e_title || "";
    const name = STATE.lang === "en" ? nameEn || nameZh : nameZh || nameEn;

    let price = null;
    if (Array.isArray(r.fees) && r.fees.length) {
      const f = r.fees[0];
      price = f.fee != null ? f.fee : f.amount != null ? f.amount : null;
    }

    return {
      code,
      name,
      price,
      startDate: r.start_date || r.startDate,
      capacity: r.size || r.capacity,
      raw: r,
    };
  });
}

function calculateTotalPages(json) {
  if (json.totalPages) return json.totalPages;
  if (json.per_page && json.total_count) {
    return Math.max(
      1,
      Math.ceil(Number(json.total_count) / Number(json.per_page))
    );
  }
  return 1;
}

// --- Rendering ---
function render() {
  const q = STATE.searchQuery.trim().toLowerCase();
  let items = [...STATE.courses];

  if (q) {
    items = items.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.code && c.code.toLowerCase().includes(q))
    );
  }

  if (STATE.sort === "date") {
    items.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  } else if (STATE.sort === "price") {
    items.sort((a, b) => (a.price || 0) - (b.price || 0));
  }

  coursesContainer.className =
    STATE.layout === "card"
      ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "space-y-3";
  coursesContainer.innerHTML = items
    .map((c) =>
      STATE.layout === "card" ? renderCard(c, q) : renderListItem(c, q)
    )
    .join("");

  // Re-attach click handlers for new buttons
  document.querySelectorAll("[data-details-link]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent card click from firing
      const courseCode = e.currentTarget.dataset.courseCode;
      window.location.href = `details.html?code=${courseCode}`;
    });
  });

  document.querySelectorAll("[data-signup-link]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const button = e.currentTarget;
      const params = new URLSearchParams({
        code: button.dataset.courseCode,
        name: button.dataset.courseName,
        price: button.dataset.coursePrice,
        startDate: button.dataset.courseStartDate,
        image: button.dataset.courseImage,
      });
      window.location.href = `register.html?${params.toString()}`;
    });
  });

  updateActiveButtons();
  if (typeof setupZoomableImages === "function") {
    setupZoomableImages();
  }
}

function renderCard(c, q) {
  const baseCode = c.code.split(/[-.]/)[0];
  const safeCode = baseCode.replace(/[\/\\]/g, "_");
  const imgSrc = `images/${safeCode}.png`;
  const name = highlightText(c.name, q);
  const code = highlightText(c.code, q);
  const t = I18N[STATE.lang];
  return `
  <article class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
    <div class="h-44 bg-gray-100">
      <img src="${imgSrc}" onerror="this.src='images/default.png'" alt="${
    c.name
  }" class="w-full h-full object-cover zoomable" data-large="${imgSrc}">
    </div>
    <div class="p-4 flex flex-col flex-grow">
      <div class="text-xs text-gray-500">${t.courseCode} ${code}</div>
      <h3 class="mt-1 font-semibold text-gray-800 text-lg">${name}</h3>
      <div class="mt-2 text-sm text-gray-500">${t.startDate}: ${formatDate(
    c.startDate
  )}</div>
      <div class="mt-3 flex items-center justify-between">
        <div class="text-teal-600 text-lg font-bold">${formatPrice(
          c.price
        )}</div>
        <div class="text-sm text-gray-600">${t.capacity}: ${
    c.capacity || "-"
  }</div>
      </div>
      <div class="mt-4 pt-4 border-t flex gap-2">
        <button data-signup-link 
                data-course-code="${c.code}" 
                data-course-name="${c.name}" 
                data-course-price="${c.price}" 
                data-course-start-date="${c.startDate}"
                data-course-image="${imgSrc}"
                class="w-full btn-primary px-4 py-2 rounded-md transition-colors">${
                  t.enroll
                }</button>
        <button data-details-link 
                data-course-code="${c.code}"
                class="w-full btn-secondary px-4 py-2 rounded-md transition-colors">${
                  t.details
                }</button>
      </div>
    </div>
  </article>`;
}

function renderListItem(c, q) {
  const baseCode = c.code.split(/[-.]/)[0];
  const safeCode = baseCode.replace(/[\/\\]/g, "_");
  const imgSrc = `images/${safeCode}.png`;
  const name = highlightText(c.name, q);
  const code = highlightText(c.code, q);
  const t = I18N[STATE.lang];
  return `
  <div class="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4 items-center hover:shadow-lg transition-shadow duration-300">
    <div class="w-full sm:w-28 h-32 sm:h-20 flex-shrink-0 overflow-hidden rounded-md">
      <img src="${imgSrc}" onerror="this.src='images/default.png'" alt="${
    c.name
  }" class="w-full h-full object-cover zoomable" data-large="${imgSrc}">
    </div>
    <div class="flex-1 text-center sm:text-left">
      <div class="text-xs text-gray-500">${t.courseCode} ${code}</div>
      <h3 class="font-semibold text-gray-800">${name}</h3>
      <div class="text-sm text-gray-500 mt-1">${t.startDate}: ${formatDate(
    c.startDate
  )} &nbsp; | &nbsp; ${t.capacity}: ${c.capacity || "-"}</div>
    </div>
    <div class="text-center sm:text-right flex-shrink-0">
      <div class="text-teal-600 font-bold text-lg mb-2">${formatPrice(
        c.price
      )}</div>
      <div class="flex gap-2">
        <button data-signup-link 
                data-course-code="${c.code}" 
                data-course-name="${c.name}" 
                data-course-price="${c.price}" 
                data-course-start-date="${c.startDate}"
                data-course-image="${imgSrc}"
                class="btn-primary px-4 py-2 rounded-md transition-colors text-sm">${
                  t.enroll
                }</button>
        <button data-details-link 
                data-course-code="${c.code}"
                class="btn-secondary px-4 py-2 rounded-md transition-colors text-sm">${
                  t.details
                }</button>
      </div>
    </div>
  </div>`;
}

function renderPagination() {
  const t = I18N[STATE.lang];

  // Mobile Pagination
  paginationMobile.innerHTML = `
    <button ${
      STATE.page <= 1 ? "disabled" : ""
    } data-pg="prev" class="px-3 py-1 bg-white border rounded ${
    STATE.page <= 1 ? "opacity-50 cursor-not-allowed" : ""
  }">${t.prevPage}</button>
    <span class="px-2 text-sm">${STATE.page} / ${STATE.allPages}</span>
    <button ${
      STATE.page >= STATE.allPages ? "disabled" : ""
    } data-pg="next" class="px-3 py-1 bg-white border rounded ${
    STATE.page >= STATE.allPages ? "opacity-50 cursor-not-allowed" : ""
  }">${t.nextPage}</button>
  `;

  // Desktop Pagination
  let desktopHtml = "";
  for (let i = 1; i <= STATE.allPages; i++) {
    desktopHtml += `<button data-page="${i}" class="w-8 h-8 flex items-center justify-center bg-white border rounded-full ${
      i === STATE.page ? "pagination-active" : "hover:bg-gray-100"
    }">${i}</button>`;
  }
  pagination.innerHTML = desktopHtml;

  const handlePageClick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const pg = btn.dataset.page;
    if (pg) {
      loadPage(Number(pg));
    }
    const pga = btn.dataset.pg;
    if (pga === "prev") {
      loadPage(Math.max(1, STATE.page - 1));
    }
    if (pga === "next") {
      loadPage(Math.min(STATE.allPages, STATE.page + 1));
    }
  };

  pagination.removeEventListener("click", handlePageClick);
  pagination.addEventListener("click", handlePageClick);
  paginationMobile.removeEventListener("click", handlePageClick);
  paginationMobile.addEventListener("click", handlePageClick);
}

function renderMobileMenu() {
  const t = I18N[STATE.lang];
  mobileMenuContainer.innerHTML = `
        <div class="px-4 py-2 text-sm text-gray-500">${t.sortBy}</div>
        <a href="#" data-sort="date" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
          STATE.sort === "date" ? "bg-gray-100" : ""
        }">${t.sortByDate}</a>
        <a href="#" data-sort="price" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
          STATE.sort === "price" ? "bg-gray-100" : ""
        }">${t.sortByPrice}</a>
        <div class="border-t my-1"></div>
        <div class="px-4 py-2 text-sm text-gray-500">${t.layoutCard.replace(
          "排版",
          ""
        )}</div>
        <a href="#" data-layout="card" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
          STATE.layout === "card" ? "bg-gray-100" : ""
        }">${t.card}</a>
        <a href="#" data-layout="list" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
          STATE.layout === "list" ? "bg-gray-100" : ""
        }">${t.list}</a>
        <div class="border-t my-1"></div>
        <div class="p-4">
            <label for="highContrastToggleMobile" class="flex items-center justify-between cursor-pointer">
                <span class="font-medium">高對比度</span>
                <div class="relative">
                    <input type="checkbox" id="highContrastToggleMobile" class="sr-only" />
                    <div class="block bg-gray-200 w-10 h-6 rounded-full"></div>
                    <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
            </label>
        </div>
        <div class="border-t my-1"></div>
        <a href="#" id="langToggleMobile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">${
          t.switchTo
        } ${STATE.lang === "zh" ? "English" : "中文"}</a>
    `;

  mobileMenuContainer.querySelectorAll("[data-sort]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      STATE.sort = e.target.dataset.sort;
      render();
    });
  });

  mobileMenuContainer.querySelectorAll("[data-layout]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      STATE.layout = e.target.dataset.layout;
      render();
    });
  });

  document.getElementById("langToggleMobile").addEventListener("click", (e) => {
    e.preventDefault();
    toggleLanguage();
  });

  const highContrastToggleMobile = document.getElementById(
    "highContrastToggleMobile"
  );
  highContrastToggleMobile.checked =
    document.body.classList.contains("high-contrast");
  highContrastToggleMobile.addEventListener("change", (e) => {
    toggleHighContrast(e.target.checked);
  });
}

// --- UI Bindings & Event Handlers ---

// --- Accessibility ---
function toggleHighContrast(isHighContrast) {
  document.body.classList.toggle("high-contrast", isHighContrast);
  localStorage.setItem("highContrast", isHighContrast);

  // Sync both toggles
  const highContrastToggleDesktop = document.getElementById(
    "highContrastToggleDesktop"
  );
  if (highContrastToggleDesktop) {
    highContrastToggleDesktop.checked = isHighContrast;
  }
  const highContrastToggleMobile = document.getElementById(
    "highContrastToggleMobile"
  );
  if (highContrastToggleMobile) {
    highContrastToggleMobile.checked = isHighContrast;
  }
}

function setupEventListeners() {
  const handleSearch = () => {
    STATE.searchQuery =
      window.innerWidth < 768
        ? searchInputMobile.value
        : searchInputDesktop.value;
    if (window.innerWidth >= 768) {
      searchInputMobile.value = STATE.searchQuery;
    } else {
      searchInputDesktop.value = STATE.searchQuery;
    }
    render();
  };

  searchInputDesktop.addEventListener("input", handleSearch);
  searchInputMobile.addEventListener("input", handleSearch);

  clearSearchDesktop.addEventListener("click", () => {
    searchInputDesktop.value = "";
    searchInputMobile.value = "";
    STATE.searchQuery = "";
    render();
  });
  clearSearchMobile.addEventListener("click", () => {
    searchInputDesktop.value = "";
    searchInputMobile.value = "";
    STATE.searchQuery = "";
    render();
  });

  // Desktop sort buttons
  document.querySelectorAll("#desktopSort button").forEach((btn) => {
    btn.addEventListener("click", () => {
      STATE.sort = btn.dataset.sort;
      render();
      // Close dropdown
      const details = btn.closest("details");
      if (details) details.removeAttribute("open");
    });
  });

  cardView.addEventListener("click", () => {
    STATE.layout = "card";
    render();
  });
  listView.addEventListener("click", () => {
    STATE.layout = "list";
    render();
  });

  langToggle.addEventListener("click", toggleLanguage);

  window.addEventListener("resize", () => {
    renderPagination();
    renderMobileMenu();
  });

  // --- Accessibility ---
  const highContrastToggleDesktop = document.getElementById(
    "highContrastToggleDesktop"
  );

  highContrastToggleDesktop.addEventListener("change", (e) => {
    toggleHighContrast(e.target.checked);
  });

  // On load, check for saved preference
  const savedHighContrast = localStorage.getItem("highContrast") === "true";
  if (savedHighContrast) {
    toggleHighContrast(true);
  }
}

function toggleLanguage() {
  STATE.lang = STATE.lang === "zh" ? "en" : "zh";
  langToggle.textContent = STATE.lang === "zh" ? "EN" : "中文";
  updateUIText();
  // Reload data with new language preference
  loadPage(STATE.page);
}

function updateUIText() {
  const t = I18N[STATE.lang];
  document.querySelectorAll("[data-lang]").forEach((el) => {
    const key = el.dataset.lang;
    if (t[key]) {
      el.textContent = t[key];
    }
  });
  document.querySelectorAll("[data-lang-placeholder]").forEach((el) => {
    const key = el.dataset.langPlaceholder;
    if (t[key]) {
      el.placeholder = t[key];
    }
  });
  document.querySelectorAll("[data-lang-title]").forEach((el) => {
    const key = el.dataset.langTitle;
    if (t[key]) {
      el.title = t[key];
    }
  });
}

function updateActiveButtons() {
  // Desktop layout buttons
  cardView.classList.toggle("bg-teal-100", STATE.layout === "card");
  cardView.classList.toggle("bg-white", STATE.layout !== "card");
  listView.classList.toggle("bg-teal-100", STATE.layout === "list");
  listView.classList.toggle("bg-white", STATE.layout !== "list");

  // Mobile menu items
  renderMobileMenu();
}

// --- Utility Functions ---
function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString();
}

function formatPrice(p) {
  if (p == null || p === 0) return I18N[STATE.lang].free;
  return `MOP ${p}`;
}

function highlightText(text, q) {
  if (!q) return escapeHtml(text || "");
  const t = text || "";
  const regex = new RegExp(`(${escapeRegExp(q)})`, "gi");
  return escapeHtml(t).replace(regex, '<span class="highlight">$1</span>');
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// --- Initial Load ---
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateUIText();
  loadPage(1);
  renderMobileMenu();

  // Check for registration success message
  if (localStorage.getItem("registrationSuccess") === "true") {
    const lang = localStorage.getItem("lang") || "zh";
    showToast(I18N[lang].registrationSuccess, 4000);
    localStorage.removeItem("registrationSuccess");
  }
});

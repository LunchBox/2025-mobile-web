// 安全初始化
(function () {
  // 工具
  const $ = (s) => document.querySelector(s);

  // 確保有容器：若沒有 #courseContainer，動態加一個
  let container = $("#courseContainer");
  if (!container) {
    container = document.createElement("section");
    container.id = "courseContainer";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  // 嘗試設定進場動畫延遲（容錯）
  try {
    document.querySelectorAll("body > *").forEach((el, i) => {
      el.style.animationDelay = `${i * 0.2}s`;
    });
  } catch (e) {}

  // 狀態
  const STATE = {
    page: 1,
    pages: 7,
    layout: "card",
    sort: "dateAsc",
    keyword: "",
    lang: "zh",
  };

  // 全局存放頁面資料（每頁一個陣列）
  const pages = []; // 渲染用
  // 來自 func.js 的字典（非必須）
  const course_dict = window.course_dict || {};

  // 控件（若不存在不報錯）
  const sortSelect = $("#sortSelect");
  const btnCard = $("#btnCard");
  const btnList = $("#btnList");
  const keywordInput = $("#keyword");
  const clearSearch = $("#clearSearch");
  const prevPageTop = $("#prevPageTop");
  const nextPageTop = $("#nextPageTop");
  const prevPageBottom = $("#prevPageBottom");
  const nextPageBottom = $("#nextPageBottom");
  const pageNumbersTop = $("#pageNumbersTop");
  const pageNumbersBottom = $("#pageNumbersBottom");

  // 工具與高亮
  const escapeHtml = (str = "") =>
    String(str).replace(
      /[&<>"']/g,
      (s) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[s])
    );
  const highlightKeyword = (text, kw) => {
    if (!kw) return escapeHtml(text || "");
    const safe = escapeHtml(text || "");
    const re = new RegExp(
      `(${kw.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})`,
      "ig"
    );
    return safe.replace(re, '<span class="highlight">$1</span>');
  };

  // 圖片

  function courseImageSrc(codeOrId) {
    return `images/${codeOrId}.png`;
  }
  function onImgError(ev) {
    const img = ev.currentTarget;
    if (!img.dataset.fallback) {
      img.dataset.fallback = "1";
      img.src = "images/default.png";
    }
  }
  window.onImgError = onImgError;

  // 映射
  function mapFromRaw(raw, lang = "zh") {
    const code =
      raw.course_code || raw.id || raw.code || raw.CourseNo || "UNKNOWN";
    const nameZH = raw.c_title || raw.title || raw.CourseName;
    const nameEN = raw.e_title || raw.title_en;
    const name =
      lang === "en"
        ? nameEN || nameZH || "未命名課程"
        : nameZH || nameEN || "未命名課程";

    let price = 0;
    if (Array.isArray(raw.fees) && raw.fees.length) {
      const std = raw.fees.find(
        (f) => String(f.background || "").toLowerCase() === "standard"
      );
      price = Number((std && std.fee) ?? raw.fees[0].fee ?? 0);
    } else if (raw.price || raw.fee) {
      price = Number(raw.price || raw.fee);
    }

    const quota = raw.size ?? raw.quota ?? raw.capacity ?? "—";
    const startDate = raw.start_date || raw.startDate || raw.openDate || "";
    return { id: code, code, name, price, quota, startDate, raw };
  }

  function mapLegacy(raw) {
    const id =
      raw.id ||
      raw.courseNo ||
      raw.code ||
      raw.CourseNo ||
      raw.course_code ||
      "UNKNOWN";
    const name =
      raw.c_title || raw.name || raw.title || raw.CourseName || "未命名課程";
    const price = Number(raw.tuition ?? raw.price ?? raw.fee ?? 0);
    const quota =
      raw.size ?? raw.quota ?? raw.capacity ?? raw.seats ?? raw.Quota ?? "—";
    const startDate =
      raw.start_date || raw.startDate || raw.start || raw.openDate || "";
    return { id, code: id, name, price, quota, startDate, raw };
  }

  function formatPrice(n) {
    return n ? `MOP $${Number(n).toLocaleString()}` : "—";
  }
  function formatDate(s) {
    if (!s) return "—";
    const d = new Date(s);
    if (isNaN(d)) return s;
    return d.toISOString().slice(0, 10);
  }

  // 版式
  function applyLayoutClass() {
    if (!container) return;
    if (STATE.layout === "card") {
      container.classList.remove("course-list");
      container.classList.add("course-grid");
    } else {
      container.classList.remove("course-grid");
      container.classList.add("course-list");
    }
  }

  // 模板
  function renderCard(c, kw) {
    const idShown = c.code || c.id || "—";
    return `
      <article class="course-card" tabindex="0" aria-label="${escapeHtml(
        c.name
      )}">
        <img class="course-image" src="${courseImageSrc(
          c.code || c.id
        )}" alt="${escapeHtml(c.name)} 圖片" onerror="onImgError(event)" />
        <h3 class="course-title">${highlightKeyword(c.name, kw)}</h3>
        <div class="course-meta">
          <span class="badge">#${highlightKeyword(idShown, kw)}</span>
          <span class="price">學費：${formatPrice(c.price)}</span>
          <span class="date">開課：${formatDate(c.startDate)}</span>
          <span class="quota">名額：${escapeHtml(c.quota)}</span>
        </div>
        <div class="row-actions">
          <a class="primary-btn" href="details.html?id=${encodeURIComponent(
            c.code || c.id
          )}" aria-label="查看 ${escapeHtml(c.name)} 詳情">查看詳情</a>
        </div>
      </article>
    `;
  }
  function renderRow(c, kw) {
    const idShown = c.code || c.id || "—";
    return `
      <article class="course-row" tabindex="0" aria-label="${escapeHtml(
        c.name
      )}">
        <img class="course-image" src="${courseImageSrc(
          c.code || c.id
        )}" alt="${escapeHtml(c.name)} 圖片" onerror="onImgError(event)" />
        <div class="row-main">
          <h3 class="course-title">${highlightKeyword(
            c.name,
            kw
          )} <span class="badge">#${highlightKeyword(idShown, kw)}</span></h3>
          <div class="course-meta">
            <span class="price">學費：${formatPrice(c.price)}</span>
            <span class="date">開課：${formatDate(c.startDate)}</span>
            <span class="quota">名額：${escapeHtml(c.quota)}</span>
          </div>
        </div>
        <div class="row-actions">
          <a class="primary-btn" href="details.html?id=${encodeURIComponent(
            c.code || c.id
          )}" aria-label="查看 ${escapeHtml(c.name)} 詳情">查看詳情</a>
        </div>
      </article>
    `;
  }
  function renderSkeleton() {
    const c = {
      id: "default",
      code: "default",
      name: "預設課程",
      price: 0,
      quota: "—",
      startDate: "",
    };
    return STATE.layout === "card" ? renderCard(c, "") : renderRow(c, "");
  }

  // 排序/過濾
  function sortArr(arr) {
    const copy = [...arr];
    if (STATE.sort === "dateAsc") {
      copy.sort((a, b) => {
        const na = +new Date(a.startDate || 8640000000000000);
        const nb = +new Date(b.startDate || 8640000000000000);
        return na - nb;
      });
    } else if (STATE.sort === "priceAsc") {
      copy.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    }
    return copy;
  }
  function filterArr(arr, kw) {
    if (!kw) return arr;
    const lower = kw.toLowerCase();
    return arr.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(lower) ||
        (c.code || c.id || "").toLowerCase().includes(lower)
    );
  }

  // 畫面渲染
  function getCurrentPage() {
    const idx = STATE.page - 1;
    return pages[idx] || [];
  }

  function updatePaginationUI() {
    if (!pageNumbersTop || !pageNumbersBottom) return;
    const total = STATE.pages;
    const cur = STATE.page;
    const makeNums = () => {
      let html = "";
      for (let i = 1; i <= total; i++) {
        html += `<button class="page-number ${
          i === cur ? "active" : ""
        }" data-page="${i}" aria-label="前往第 ${i} 頁">${i}</button>`;
      }
      return html;
    };
    pageNumbersTop.innerHTML = makeNums();
    pageNumbersBottom.innerHTML = makeNums();

    const setBtnState = (btnPrev, btnNext) => {
      if (btnPrev) btnPrev.disabled = cur <= 1;
      if (btnNext) btnNext.disabled = cur >= total;
    };
    setBtnState(prevPageTop, nextPageTop);
    setBtnState(prevPageBottom, nextPageBottom);
  }

  function render() {
    if (!container) return;
    container.setAttribute("aria-busy", "true");
    applyLayoutClass();

    const data = getCurrentPage();
    const filtered = filterArr(data, STATE.keyword);
    const sorted = sortArr(filtered);

    if (!sorted.length) {
      // 無資料時也要有骨架
      container.innerHTML = Array.from({ length: 6 })
        .map(renderSkeleton)
        .join("");
    } else {
      const html = sorted
        .map((c) =>
          STATE.layout === "card"
            ? renderCard(c, STATE.keyword)
            : renderRow(c, STATE.keyword)
        )
        .join("");
      container.innerHTML = html;
    }

    updatePaginationUI();
    container.setAttribute("aria-busy", "false");
  }

  // 初始骨架：在 DOM 準備好時就畫
  function initialPlaceholder() {
    applyLayoutClass();
    container.innerHTML = Array.from({ length: 6 })
      .map(renderSkeleton)
      .join("");
  }

  // 綁定事件
  function bindEvents() {
    if (btnCard)
      btnCard.addEventListener("click", () => {
        STATE.layout = "card";
        btnCard.classList.add("active");
        if (btnList) btnList.classList.remove("active");
        render();
      });
    if (btnList)
      btnList.addEventListener("click", () => {
        STATE.layout = "list";
        btnList.classList.add("active");
        if (btnCard) btnCard.classList.remove("active");
        render();
      });
    if (sortSelect)
      sortSelect.addEventListener("change", () => {
        STATE.sort = sortSelect.value;
        render();
      });
    let debounceTimer;
    if (keywordInput)
      keywordInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          STATE.keyword = keywordInput.value.trim();
          render();
        }, 200);
      });
    if (clearSearch)
      clearSearch.addEventListener("click", () => {
        if (keywordInput) keywordInput.value = "";
        STATE.keyword = "";
        render();
      });

    function go(delta) {
      const next = Math.min(Math.max(1, STATE.page + delta), STATE.pages);
      if (next !== STATE.page) {
        STATE.page = next;
        render();
      }
    }
    if (prevPageTop) prevPageTop.addEventListener("click", () => go(-1));
    if (nextPageTop) nextPageTop.addEventListener("click", () => go(1));
    if (prevPageBottom) prevPageBottom.addEventListener("click", () => go(-1));
    if (nextPageBottom) nextPageBottom.addEventListener("click", () => go(1));

    if (pageNumbersTop)
      pageNumbersTop.addEventListener("click", (e) => {
        const btn = e.target.closest(".page-number");
        if (!btn) return;
        STATE.page = Number(btn.dataset.page);
        render();
      });
    if (pageNumbersBottom)
      pageNumbersBottom.addEventListener("click", (e) => {
        const btn = e.target.closest(".page-number");
        if (!btn) return;
        STATE.page = Number(btn.dataset.page);
        render();
      });
  }

  // 資料載入（即使失敗也不影響骨架）
  function fetchPages() {
    for (let i = 1; i < 8; i++) {
      fetch(`https://course-dummy-api-nine.vercel.app/courses/page-${i}.json`)
        .then((r) => {
          if (!r.ok) throw new Error("bad");
          return r.text();
        })
        .then((t) => {
          let json;
          try {
            json = JSON.parse(t);
          } catch (e) {
            json = [];
          }
          let pageArr = [];
          if (Array.isArray(json)) {
            pageArr = json.map(mapLegacy);
          } else if (json && Array.isArray(json.courses)) {
            pageArr = json.courses.map((x) => mapFromRaw(x, STATE.lang));
            if (json.total_count && json.per_page) {
              STATE.pages = Math.ceil(
                Number(json.total_count) / Number(json.per_page)
              );
            }
          } else {
            pageArr = [];
          }
          pages[i - 1] = pageArr; // 按頁索引存入，避免 push 造成順序錯亂
          // 若當前頁就是這一頁，重繪
          if (STATE.page === i) render();
          // 若是第一頁且目前容器仍是骨架，也重繪
          if (STATE.page === 1 && i === 1) render();
        })
        .catch((err) => {
          console.error("load page failed", i, err);
          pages[i - 1] = pages[i - 1] || [];
          if (STATE.page === i) render();
        });
    }
  }

  // 啟動順序：先骨架 -> 綁事件 -> 開始取數據
  document.addEventListener("DOMContentLoaded", () => {
    initialPlaceholder();
    bindEvents();
    fetchPages();
  });
})();

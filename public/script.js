// =====================================================
// 1) CHECK LOGIN + ATTACH USER INFO (INCLUDING GOOGLE)
// =====================================================
async function loadUser() {
  const res = await fetch("/api/check-login");
  const data = await res.json();

  if (!data.loggedIn) return;

  const user = data.user;
  const accountBox = document.querySelector(".account");

  accountBox.innerHTML = `
        <a href="#">${user.name}</a>
        <img src="${user.avatar || "default.png"}" 
             style="width:35px;height:35px;border-radius:50%;margin-left:8px;">
        <a href="/api/logout" style="padding-left:10px">Logout</a>
    `;
}

// =====================================================
// 2) LOAD PRODUCTS FROM API
// =====================================================
const categoryNames = {
  new: "New Releases",
  best: "Best Sellers",
  promo: "Promotions",
  literature: "Literature",
  economy: "Economy",
  psychology: "Psychology - Life Skills",
  kids: "Children's Books",
  foreign: "Foreign Language Books",
  textbook: "Textbook & References",
  comics: "Comics & Manga",
  religion: "Religion & Philosophy",
};

async function loadProducts(category = "new", targetId = "tab-new") {
  const res = await fetch(`/api/products/category/${category}`);
  const list = await res.json();

  renderProducts(list, targetId, category);
}

async function loadProductsByCategory(category) {
  const res = await fetch(`/api/products/category/${category}`);
  const list = await res.json();

  // Get or create category results container
  let resultsSection = document.getElementById("category-results");
  if (!resultsSection) {
    resultsSection = document.createElement("div");
    resultsSection.id = "category-results";
    resultsSection.className = "category-results-section";
    const productDisplay = document.querySelector(".product-display");
    if (productDisplay) {
      productDisplay.parentNode.insertBefore(resultsSection, productDisplay);
    }
  }

  const catName = categoryNames[category] || category;

  if (list.length === 0) {
    resultsSection.innerHTML = `
      <div class="category-header">
        <h2>${catName}</h2>
        <button onclick="hideCategoryResults()" class="close-btn">✕ Close</button>
      </div>
      <p style="padding: 20px; text-align: center; color: #888;">No products found in this category.</p>
    `;
  } else {
    resultsSection.innerHTML = `
      <div class="category-header">
        <h2>${catName}</h2>
        <span style="color: #888; margin-left: 10px;">(${list.length} products)</span>
        <button onclick="hideCategoryResults()" class="close-btn">✕ Close</button>
      </div>
      <div class="product-grid" id="category-products"></div>
    `;
    renderProducts(list, "category-products");
  }

  resultsSection.style.display = "block";
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function hideCategoryResults() {
  const resultsSection = document.getElementById("category-results");
  if (resultsSection) {
    resultsSection.style.display = "none";
  }
}

function renderProducts(products, targetId = "tab-new", category = null) {
  const grid = document.getElementById(targetId) || document.querySelector(`#${targetId}`);
  if (!grid) return;

  grid.innerHTML = "";

  if (products.length === 0) {
    grid.innerHTML = '<p style="padding: 20px; text-align: center; color: #888;">No products available.</p>';
    return;
  }

  products.forEach((p) => {
    grid.innerHTML += `
        <div class="product-item">
            <img src="${p.image}" onerror="this.src='/images/biasach.jpg'">
            <p class="product-title">${p.title}</p>
            <p class="product-price-old">${p.priceOld.toLocaleString()}₫</p>
            <p class="product-price-new">${p.priceNew.toLocaleString()}₫</p>
            <div class="product-actions">
                <button onclick="addToCart(${p.id})">Add to cart</button>
                <button onclick="gotoDetail(${p.id})">Details</button>
            </div>
        </div>
        `;
  });
}

// =====================================================
// 3) ADD TO CART
// =====================================================
async function getUserInfo() {
  const res = await fetch("/api/user/info");
  return await res.json();
}

async function addToCart(id) {
  const user = await getUserInfo();

  if (!user || user.loggedIn === false) {
    alert("Please log in to continue!");
    window.location.href = "/login.html";
    return;
  }

  const res = await fetch("/api/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, qty: 1 }),
  });

  const data = await res.json();

  if (data.cart) {
    const totalQty = data.cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById("numOfProduct").innerText = totalQty;
  }

  alert("Added to cart successfully!");
}

// =====================================================
// 4) GO TO PRODUCT DETAIL
// =====================================================
function gotoDetail(id) {
  // Save id to localStorage for detail.html to retrieve
  localStorage.setItem("selectedProductId", id);
  window.location.href = "/BookDetail.html"; // detail page
}

// =====================================================
// 5) CATEGORY CLICK (SIDEBAR)
// =====================================================
function setupCategoryClick() {
  const links = document.querySelectorAll(".sidebar-menu a[data-category]");
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();

      const cat = link.dataset.category;
      if (!cat) return;

      try {
        const res = await fetch("/api/user/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: cat }),
        });
        if (!res.ok && res.status !== 401) {
          console.warn("Failed to store last category", res.status);
        }
      } catch (err) {
        console.warn("Could not store last category", err);
      }

      links.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");

      const subMenu = link.closest(".sub-menu");
      if (subMenu) {
        const parentLink = subMenu.previousElementSibling;
        if (parentLink && parentLink.dataset.category) {
          parentLink.classList.add("active");
        }
      }

      loadProductsByCategory(cat);
    });
  });

  const defaultLink = document.querySelector(
    '.sidebar-menu a[data-category="new"]'
  );
  if (defaultLink) defaultLink.classList.add("active");
}

// =====================================================
// 6) SEARCH
// =====================================================
function setupSearch() {
  document
    .querySelector(".search button")
    .addEventListener("click", async () => {
      let q = document.querySelector(".search input").value;

      const res = await fetch(`/api/search?q=${q}`);
      const list = await res.json();

      renderProducts(list);
    });
}

// =====================================================
// 7) TAB SẢN PHẨM (HOT NEW / PROMO…)
// =====================================================
function setupTabs() {
  const links = document.querySelectorAll(".product-tabs a");
  const panes = document.querySelectorAll(".tab-pane");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const tab = link.dataset.tab;

      panes.forEach((p) => p.classList.remove("active"));
      document.getElementById(`tab-${tab}`).classList.add("active");

      if (tab === "new") loadProducts("new");
      if (tab === "promo") loadProducts("promo");
    });
  });
}

// =====================================================
// 8) SLIDER BANNER (CAROUSEL)
// =====================================================
function setupCarousel() {
  const wrapper = document.querySelector(".slide-wrapper");
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  if (!wrapper || slides.length <= 2) return;

  const total = slides.length;
  const realTotal = total - 2;
  let index = 1;
  let timer;

  function go(i, smooth = true) {
    wrapper.style.transition = smooth ? "transform 0.8s ease-in-out" : "none";
    index = i;

    wrapper.style.transform = `translateX(${-index * (100 / total)}%)`;

    if (index === total - 1) setTimeout(() => go(1, false), 800);
    if (index === 0) setTimeout(() => go(realTotal, false), 800);
  }

  function auto() {
    clearInterval(timer);
    timer = setInterval(() => go(index + 1), 4000);
  }

  nextBtn.onclick = () => {
    clearInterval(timer);
    go(index + 1);
    auto();
  };
  prevBtn.onclick = () => {
    clearInterval(timer);
    go(index - 1);
    auto();
  };

  go(1, false);
  auto();
}

// =====================================================
// 9) SUGGESTED PRODUCTS
// =====================================================
async function loadSuggest() {
  const res = await fetch("/api/suggest");
  const list = await res.json();

  if (list.length === 0) return;

  const box = document.createElement("div");
  box.innerHTML = "<h3>Recently Viewed</h3>";

  list.forEach((p) => {
    box.innerHTML += `
      <p onclick="gotoDetail(${p.id})" style="cursor:pointer;">
      ${p.title} – ${p.priceNew.toLocaleString()}₫</p>`;
  });

  document.querySelector(".content").appendChild(box);
}

// =====================================================
// 10) RENDER 1 PRODUCT ITEM
// =====================================================
function productHTML(p) {
  return `
        <div class="product-item">
            <img src="${p.image}">
            <p class="product-title">${p.title}</p>
            <p class="product-price-old">${p.priceOld.toLocaleString()}₫</p>
            <p class="product-price-new">${p.priceNew.toLocaleString()}₫</p>
            <div class="product-actions">
                <button onclick="addToCart(${p.id})">Add to cart</button>
                <button onclick="gotoDetail(${p.id})">Details</button>
            </div>
        </div>
    `;
}

// =====================================================
// 11) LOAD SECTION BY CATEGORY
// =====================================================
async function loadSection(category, elementId) {
  const res = await fetch(`/api/products/category/${category}`);
  const data = await res.json();

  const box = document.getElementById(elementId);
  if (!box) return;

  box.innerHTML = "";

  data.forEach((p) => {
    box.innerHTML += productHTML(p);
  });
}

// =====================================================
// 12) LOAD CART COUNT ON PAGE LOAD
// =====================================================
async function loadCartCount() {
  const user = await getUserInfo();
  if (!user || !user.cart) return;

  const totalQty = user.cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("numOfProduct").innerText = totalQty.toLocaleString();
}

// =====================================================
// 13) LOAD USER INFO (AVATAR + LOGOUT BUTTON)
// =====================================================
async function loadUserInfo() {
  const res = await fetch("/api/check-login");
  const data = await res.json();

  if (!data.loggedIn) return;

  const user = data.user;

  document.querySelector(".account").innerHTML = `
        <span class="user-name">${user.name}</span>
        <img src="${user.avatar || "default-avatar.png"}" 
             class="user-avatar"
             style="width:35px;height:35px;border-radius:50%;margin-left:10px;">
        <a id="logoutBtn" href="#" style="margin-left:10px;color:red;">Logout</a>
    `;
}

// =====================================================
// 14) LOGOUT
// =====================================================
document.addEventListener("click", async (e) => {
  if (e.target.id === "logoutBtn") {
    e.preventDefault();

    if (!confirm("Are you sure you want to logout?")) return;

    const res = await fetch("/api/logout");
    const data = await res.json();

    if (data.success) {
      alert("Logged out successfully!");
      window.location.href = "/login.html";
    }
  }
});

// =====================================================
// 15) INIT
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  loadUser();
  loadUserInfo();
  loadCartCount();
  loadProducts();
  setupCategoryClick();
  setupSearch();
  setupTabs();
  setupCarousel();
  loadSuggest();

  loadSection("new", "tab-new");
  loadSection("promo", "tab-promo");
  loadSection("literature", "literature-section");
  loadSection("psychology", "psychology-section");
});

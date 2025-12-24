// searchAutocomplete.js
export function setupSearch(options = {}) {
  const searchInput = document.querySelector(".search input");
  const searchBtn = document.querySelector(".search button");

  if (!searchInput || !searchBtn) return;

  // Options
  const apiUrl = options.apiUrl || "/api/products";
  const localStorageKey = options.localStorageKey || "searchQuery";
  const redirectUrl = options.redirectUrl || "/searchResult.html";

  // Tạo suggestionBox
  const suggestionBox = document.createElement("div");
  suggestionBox.className = "search-suggestions";
  searchInput.parentNode.style.position = "relative";
  searchInput.parentNode.appendChild(suggestionBox);

  let debounceTimer;

  async function fetchSuggestions(query) {
    if (!query) return [];
    try {
      const res = await fetch(apiUrl);
      const products = await res.json();
      return products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            (p.author &&
              p.author.toLowerCase().includes(query.toLowerCase())) ||
            (p.category &&
              p.category.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5);
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async function showSuggestions(query) {
    suggestionBox.innerHTML = "";
    const suggestions = await fetchSuggestions(query);

    suggestions.forEach((p) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.innerText = p.title;

      div.addEventListener("click", () => {
        searchInput.value = p.title;
        suggestionBox.innerHTML = "";
        localStorage.setItem(localStorageKey, p.title);
        window.location.href = redirectUrl;
      });

      suggestionBox.appendChild(div);
    });
  }

  function doSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      alert("Vui lòng nhập từ khóa!");
      return;
    }
    localStorage.setItem(localStorageKey, query);
    window.location.href = redirectUrl;
  }

  // Events
  searchBtn.addEventListener("click", doSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") doSearch();
  });

  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = e.target.value.trim();
      if (query) {
        showSuggestions(query);
      } else {
        suggestionBox.innerHTML = "";
      }
    }, 200);
  });

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !suggestionBox.contains(e.target)) {
      suggestionBox.innerHTML = "";
    }
  });
}

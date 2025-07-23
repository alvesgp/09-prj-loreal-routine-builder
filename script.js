/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

// Store all loaded products for filtering
let allProducts = [];

// Load products and store them for search/filter
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  allProducts = data.products;
  return allProducts;
}

// Helper to filter products by category and search term
function getFilteredProducts() {
  const selectedCategory = categoryFilter.value;
  const searchTerm = productSearch.value.trim().toLowerCase();

  return allProducts.filter((product) => {
    // Filter by category
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    // Filter by search term (name or description)
    const matchesSearch =
      searchTerm &&
      (product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm));
    return matchesCategory && matchesSearch;
  });
}
// Array to hold selected products (empty initially)
const selectedProducts = [];

// Load saved selected products from localStorage on page load
function loadSelectedProducts() {
  const saved = localStorage.getItem("selectedProducts");
  if (saved) {
    try {
      const savedProducts = JSON.parse(saved);
      savedProducts.forEach(p => {
        if (p && p.id && p.name && p.brand && p.image) {
          selectedProducts.push(p);
        }
      });
    } catch (e) {
      console.warn("Failed to parse selectedProducts from localStorage", e);
    }
  }
}

// Save selected products to localStorage
function saveSelectedProducts() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}
// Render selected products list in UI
function renderSelectedProducts() {
  const container = document.getElementById("selectedProductsList");
  if (!selectedProducts.length) {
    container.innerHTML = `<div class="placeholder-message">No products selected</div>`;
    return;
  }

  container.innerHTML = `
    <div style="display:flex; justify-content:flex-end; margin-bottom:8px;">
      <button id="clearAllBtn" style="background:#e3a535; color:#fff; border:none; border-radius:8px; padding:6px 16px; cursor:pointer; font-size:14px;">Clear All</button>
    </div>
    <div class="selected-products-list">
      ${selectedProducts
        .map((p, i) => `
          <div class="selected-product-item">
            <img src="${p.image}" alt="${p.name}" width="50" height="50" style="object-fit: contain; border-radius: 6px; background:#fafafa;"/>
            <div>
              <div>${p.name}</div>
              <div style="font-size: 13px; color: #666;">${p.brand}</div>
            </div>
            <button class="remove-btn" data-index="${i}" title="Remove" style="color:#ff003b; border:none; background:none; font-size:18px; cursor:pointer;">&times;</button>
          </div>
        `)
        .join("")}
    </div>
  `;

  // Attach remove listeners
  container.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      selectedProducts.splice(index, 1);
      saveSelectedProducts();
      renderSelectedProducts();
      updateProductCardSelection(); // If you have this function to update UI selection state
    });
  });

  // Attach clear all listener
  const clearAllBtn = document.getElementById("clearAllBtn");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      selectedProducts.length = 0;
      saveSelectedProducts();
      renderSelectedProducts();
      updateProductCardSelection();
    });
  }
}

// Call this function on page load
loadSelectedProducts();
renderSelectedProducts();
updateProductCardSelection();  // Make sure this highlights selected product cards


// This function updates the "Selected Products" section
function renderSelectedProducts() {
  const selectedProductsList = document.getElementById("selectedProductsList");
  if (!selectedProducts.length) {
    selectedProductsList.innerHTML = `<div class="placeholder-message" style="padding:16px;font-size:15px;">No products selected</div>`;
    return;
  }
  selectedProductsList.innerHTML = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
      <button id="clearAllBtn" style="background:#e3a535;color:#fff;border:none;border-radius:8px;padding:6px 16px;cursor:pointer;font-size:14px;">Clear All</button>
    </div>
    <div class="selected-products-list">
      ${selectedProducts
        .map(
          (p, i) => `
        <div class="selected-product-item" style="display:flex;align-items:center;gap:14px;padding:12px 10px;background:#fff;border:1.5px solid #e3a535;border-radius:12px;box-shadow:0 2px 10px rgba(227,165,53,0.06);margin-bottom:8px;">
          <img src="${p.image}" alt="${p.name}" style="width:70px;height:70px;object-fit:contain;border-radius:10px;background:#fafafa;">
          <div style="flex:1;">
            <div style="font-weight:600;font-size:16px;color:#222;">${p.name}</div>
            <div style="font-size:14px;color:#888;">${p.brand}</div>
          </div>
          <button class="remove-btn" data-index="${i}" title="Remove" style="font-size:22px;background:none;border:none;color:#ff003b;cursor:pointer;">&times;</button>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  // Remove individual product
  selectedProductsList.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = Number(btn.dataset.index);
      selectedProducts.splice(idx, 1);
      saveSelectedProducts();
      renderSelectedProducts();
      updateProductCardSelection();
    });
  });

  // Clear all products
  const clearAllBtn = document.getElementById("clearAllBtn");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      selectedProducts.length = 0;
      saveSelectedProducts();
      renderSelectedProducts();
      updateProductCardSelection();
    });
  }
}

// This function visually marks selected products in the grid
function updateProductCardSelection() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const pid = card.dataset.pid;
    if (selectedProducts.some((p) => p.id === pid)) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });
  saveSelectedProducts();
}

// This function displays products and sets up selection and description logic
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
      <div class="product-card" data-pid="${product.id}">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="brand">${product.brand}</p>
          <button class="desc-toggle" type="button">Show Description</button>
          <div class="product-description" style="display:none; margin-top:10px; color:#444; font-size:15px; background:#fffbe9; border-radius:8px; padding:10px 12px;"></div>
        </div>
      </div>
    `
    )
    .join("");

  // Card selection logic
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("desc-toggle") ||
        e.target.classList.contains("close-desc")
      )
        return;
      const pid = card.dataset.pid;
      const product = products.find((p) => String(p.id) === pid);
      const selIdx = selectedProducts.findIndex((p) => String(p.id) === pid);
      if (selIdx === -1) {
        selectedProducts.push(product);
      } else {
        selectedProducts.splice(selIdx, 1);
      }
      renderSelectedProducts();
      updateProductCardSelection();
    });
  });

  // Show/hide description inside the card
  document.querySelectorAll(".desc-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = btn.closest(".product-card");
      const pid = card.dataset.pid;
      const product = products.find((p) => String(p.id) === pid);
      const descDiv = card.querySelector(".product-description");
      if (descDiv.style.display === "none" || descDiv.style.display === "") {
        descDiv.textContent = product.description;
        descDiv.style.display = "block";
        btn.textContent = "Hide Description";
      } else {
        descDiv.style.display = "none";
        btn.textContent = "Show Description";
      }
    });
  });

  updateProductCardSelection();
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );
  displayProducts(filteredProducts);
});

// When search input changes, show filtered products
const productSearch = document.getElementById("productSearch");
productSearch.addEventListener("input", () => {
  displayProducts(getFilteredProducts());
});

// On page load, fetch products and show initial grid
loadProducts().then(() => {
  displayProducts(getFilteredProducts());
});

/* Helper: Get unique categories from products */
async function populateCategoryFilter() {
  const products = await loadProducts();
  const categories = [...new Set(products.map((p) => p.category))];
  categoryFilter.innerHTML = `
    <option value="" disabled selected>Select category</option>
    ${categories
      .map(
        (cat) =>
          `<option value="${cat}">${
            cat.charAt(0).toUpperCase() + cat.slice(1)
          }</option>`
      )
      .join("")}
  `;
}

// Populate the category filter on page load
populateCategoryFilter();

// Initial render for selected products
renderSelectedProducts();

// Get reference to the generate button
const generateBtn = document.getElementById("generateBtn");

// Store the chat history for context
let chatHistory = [
  {
    role: "system",
    content:
      "You are a friendly beauty advisor. Only answer questions about skincare, haircare, makeup, fragrance, and routines. If asked about other topics, politely say you can only help with beauty advice.",
  },
];

// Replace this with your Cloudflare Worker URL
const WORKER_URL = "https://loreal-worker.alvesgp.workers.dev";

// Show a loading bubble on the left where the AI replies
function showLoadingMessage() {
  const chatWindow = document.getElementById("chatWindow");
  chatWindow.innerHTML += `<div class="chat-message assistant" id="loadingBubble">Thinking<span class="loading-dots">...</span></div>`;
  // Scroll to bottom as new messages appear
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Remove the loading bubble after AI responds
function removeLoadingMessage() {
  const loadingBubble = document.getElementById("loadingBubble");
  if (loadingBubble) {
    loadingBubble.remove();
  }
}

// When the user clicks "Generate Routine"
generateBtn.addEventListener("click", async () => {
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML += `<div class="chat-message system">Please select at least one product to generate a routine.</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return;
  }

  // Prepare product data for OpenAI
  const productData = selectedProducts.map((p) => ({
    name: p.name,
    brand: p.brand,
    category: p.category,
    description: p.description,
  }));

  // Show loading message
  showLoadingMessage();

  // Add the user's request to the chat history
  chatHistory.push({
    role: "user",
    content: `Please create a step-by-step routine using these products:\n${JSON.stringify(
      productData,
      null,
      2
    )}`,
  });

  // Send the chat history to your Cloudflare Worker
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: chatHistory,
    }),
  });
  const data = await response.json();

  // Remove loading message
  removeLoadingMessage();

  // Show the routine and add it to chat history
  if (
    data.choices &&
    data.choices[0].message &&
    data.choices[0].message.content
  ) {
    const routine = data.choices[0].message.content;
    chatWindow.innerHTML += `<div class="chat-message assistant">${routine.replace(
      /\n/g,
      "<br>"
    )}</div>`;
    chatHistory.push({
      role: "assistant",
      content: routine,
    });
  } else {
    chatWindow.innerHTML += `<div class="chat-message system">Sorry, something went wrong. Please try again.</div>`;
  }
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Handle follow-up questions in the chatbox
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInput = document.getElementById("userInput").value.trim();
  if (!userInput) return;

  // Add user's question to chat history and show in chat window
  chatHistory.push({
    role: "user",
    content: userInput,
  });
  chatWindow.innerHTML += `<div class="chat-message user">${userInput}</div>`;
  document.getElementById("userInput").value = "";

  // Show loading message
  showLoadingMessage();

  // Send updated chat history to your Cloudflare Worker
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: chatHistory,
    }),
  });
  const data = await response.json();

  // Remove loading message
  removeLoadingMessage();

  // Show the assistant's reply and add it to chat history
  if (
    data.choices &&
    data.choices[0].message &&
    data.choices[0].message.content
  ) {
    const reply = data.choices[0].message.content;
    chatWindow.innerHTML += `<div class="chat-message assistant">${reply.replace(
      /\n/g,
      "<br>"
    )}</div>`;
    chatHistory.push({
      role: "assistant",
      content: reply,
    });
  } else {
    chatWindow.innerHTML += `<div class="chat-message system">Sorry, something went wrong. Please try again.</div>`;
  }
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Automatically set RTL mode if the page language is an RTL language
// This will set RTL layout if <html lang="ar">, <html lang="he">, <html lang="fa">, or <html lang="ur">
const rtlLanguages = ["ar", "he", "fa", "ur"];
const htmlLang = document.documentElement.lang;
if (rtlLanguages.includes(htmlLang)) {
  document.body.setAttribute("dir", "rtl");
} else {
  document.body.setAttribute("dir", "ltr");
}

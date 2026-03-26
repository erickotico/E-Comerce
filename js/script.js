// Array de produtos: cada produto tem id, nome, preço, imagem, tipo de variante (especificação de cor ou tamanho), variantes disponíveis(se não tiver a variante de tamanho ou cor é só retirar o campo especifico), categoria, estoque e ficha técnicas
const products = [
  { id: 1, name: "Smartphone X", price: 50.20, image: "img/img.jpg", variantType: "color", variants: ["Preto", "Branco", "Azul"], category: "Eletrônicos", stock: 15, specifications: { "Processador": "Snapdragon 888", "RAM": "6GB", "Armazenamento": "128GB", "Bateria": "4500mAh", "Tela": "6.1 polegadas" } },
  { id: 2, name: "Camiseta Azul", price: 30.00, image: "img/img.jpg", variantType: "size", variants: ["PP", "P", "M", "G"], category: "Roupas", stock: 45, specifications: { "Material": "100% Algodão", "Peso": "180g", "Modelagem": "Reta", "Cuidados": "Lavar com água morna" } },
  { id: 3, name: "Fone de Ouvido", price: 70.00, image: "img/img.jpg", variantType: "color", variants: ["Preto", "Branco", "Vermelho"], category: "Eletrônicos", stock: 22, specifications: { "Tipo": "Over-ear", "Conectividade": "Bluetooth 5.0", "Bateria": "20 horas", "Peso": "250g", "Driver": "40mm" } },
  { id: 4, name: "Short Esportivo", price: 20.20, image: "img/img.jpg", variantType: "size", variants: ["P", "M"], category: "Roupas", stock: 30, specifications: { "Material": "Poliéster 88% + Elastano 12%", "Cintura": "Ajustável", "Bolsos": "Sim, laterais", "Secagem": "Rápida" } },
  { id: 5, name: "Relógio", price: 70.00, image: "img/img.jpg", variantType: "color", variants: ["Prata", "Dourado", "Preto"], category: "Acessórios", stock: 18, specifications: { "Movimento": "Quartzo", "Resistência à água": "5ATM", "Material da caixa": "Aço inoxidável", "Tipo de pulseira": "Couro genuíno" } },
  { id: 6, name: "Boné", price: 70.00, image: "img/img.jpg", variantType: "size", variants: ["M", "G", "GG"], category: "Acessórios", stock: 50, specifications: { "Material": "100% Algodão", "Fechamento": "Ajustável", "Proteção UV": "UPF 50+", "Peso": "80g" } },
  { id: 7, name: "Maquina de Lavar", price: 70.00, image: "img/img.jpg", variantType: "color", variants: ["Preto", "Branco", "Cinza"], category: "Casa", stock: 8, specifications: { "Capacidade": "10kg", "Programas": "15", "Voltagem": "110V/220V", "Dimensões": "0,60m x 0,85m x 0,65m", "Peso": "65kg" } }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

const productsDiv = document.getElementById("products");
const categoryList = document.getElementById("category-list");
const searchInput = document.getElementById("search");
const cartItems = document.getElementById("cart-items");
const totalText = document.getElementById("total");
const cartCount = document.getElementById("cart-count");
const cartDiv = document.getElementById("cart");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");
const checkoutBtn = document.getElementById("checkout");
const modal = document.getElementById("product-modal");
const modalImage = document.getElementById("modal-image");
const modalName = document.getElementById("modal-name");
const modalPrice = document.getElementById("modal-price");
const addToCartModal = document.getElementById("add-to-cart-modal");
const sizeBtns = document.querySelectorAll(".size-btn");

const categories = ["Todos"]; 

let selectedCategory = "Todos";
let searchTerm = "";
let selectedProduct = null;
let selectedSize = null;

// Função que formata o preço para o padrão brasileiro
function formatPrice(price) {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}
 // Extrair categorias únicas dos produtos e renderizar botões de filtro
function renderCategories() {
 
  const uniqueCategories = [...new Set(products.map(p => p.category))];
  categories.length = 1; // Manter "Todos"
  categories.push(...uniqueCategories);

  categoryList.innerHTML = "";
  categories.forEach(category => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = category;
    btn.classList.toggle("active", category === selectedCategory);
    btn.addEventListener("click", () => {
      selectedCategory = category;
      renderCategories();
      renderProducts();
    });
    li.appendChild(btn);
    categoryList.appendChild(li);
  });
}

// Render dos produtos
function renderProducts() {
  productsDiv.innerHTML = "";

  const filtered = products.filter(p => {
    const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  filtered.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.style.opacity = 0;

    const stockStatus = p.stock > 0 ? `<p class="stock-info">📦 ${p.stock} em estoque</p>` : '<p class="stock-info unavailable">Fora de estoque</p>';

    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onclick="openModal(${p.id})">
      <h3>${p.name}</h3>
      <p>${formatPrice(p.price)}</p>
      ${stockStatus}
      <button class="add-btn" onclick="openModal(${p.id})">Ver Detalhes</button>
    `;

    productsDiv.appendChild(div);
    setTimeout(() => {
      div.style.opacity = 1;
      div.style.transform = "translateY(0)";
    }, 10);
  });

  if (filtered.length === 0) {
    productsDiv.innerHTML = '<p>Nenhum produto encontrado.</p>';
  }
}


// Abri o modal do produto
function openModal(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  selectedProduct = product;
  selectedSize = null;

  modalImage.src = product.image;
  modalName.textContent = product.name;
  modalPrice.textContent = formatPrice(product.price);

  // Atualiza o texto do seletor
  const selectorText = product.variantType === "color" ? "Selecione a cor:" : "Selecione o tamanho:";
  document.querySelector("#size-selection h3").textContent = selectorText;

  // Gera botões dinâmicos de acordo com as variants
  const sizesDiv = document.querySelector(".sizes");
  sizesDiv.innerHTML = "";
  product.variants.forEach(variant => {
    const btn = document.createElement("button");
    btn.classList.add("size-btn");
    btn.textContent = variant;
    btn.dataset.size = variant;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedSize = variant;
    });
    sizesDiv.appendChild(btn);
  });

  // Gera as fichas técnicas dinâmica
  let specificationsHTML = '<div class="specifications"><h3>Especificações Técnicas:</h3><table class="specs-table">';
  if (product.specifications && Object.keys(product.specifications).length > 0) {
    for (const [key, value] of Object.entries(product.specifications)) {
      specificationsHTML += `<tr><td class="spec-label">${key}</td><td class="spec-value">${value}</td></tr>`;
    }
  }
  specificationsHTML += '</table></div>';
  
  // Insere especificações antes do botão
  const modalContent = document.querySelector(".modal-content");
  let existingSpecs = modalContent.querySelector(".specifications");
  if (existingSpecs) existingSpecs.remove();

  const modalDescription = document.getElementById("modal-description");
  modalDescription.insertAdjacentHTML("afterend", specificationsHTML);

  // Insere o estoque
  const stockStatus = `<p class="modal-stock">Disponível: ${product.stock} unidades</p>`;
  let existingStock = modalContent.querySelector(".modal-stock");
  if (existingStock) existingStock.remove();
  modalDescription.insertAdjacentHTML("afterend", stockStatus);

  modal.style.display = "block";
}

// Fecha o modal
document.querySelector(".close").onclick = () => {
  modal.style.display = "none";
};

window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Seleciona o tamanho
sizeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("disabled")) return;
    sizeBtns.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedSize = btn.dataset.size;
  });
});

// Adiciona o produto no modal
addToCartModal.addEventListener("click", () => {
  if (!selectedProduct || !selectedSize) {
    alert(`Selecione uma ${selectedProduct.variantType === "color" ? "cor" : "tamanho"}!`);
    return;
  }
  const added = addToCart(selectedProduct.id, selectedSize);
  if (!added) return;
  modal.style.display = "none";
});

// Adiciona o produto ao carrinho
function addToCart(id, variant = null) {
  const product = products.find(p => p.id === id);
  if (!product) return false;

  // Verifica se tem produto no estoque
  if (product.stock <= 0) {
    showToast("❌ Produto fora de estoque!");
    return false;
  }

  const key = variant ? `${id}-${variant}` : id.toString();
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1, variant: variant, key: key });
  }
  saveCart();
  updateCart();
  showToast(`${product.name}${variant ? ` (${variant})` : ''} adicionado ao carrinho.`);
  return true;
}

// Remove produtos do carrinho
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCart();
}

// Atualiza a quantidade de produtos disponiveis
function updateQuantity(index, quantity) {
  if (quantity < 1) return;
  cart[index].quantity = parseInt(quantity);
  saveCart();
  updateCart();
}

// Salva o carrinho com o localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Atualiza o carrinho
function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const variantLabel = item.variantType === "color" ? "Cor" : "Tamanho";
    const li = document.createElement("li");
    li.classList.add("cart-item");
    li.innerHTML = `
      <span>${item.name} (${variantLabel}: ${item.variant}) - ${formatPrice(item.price)}</span>
      <div class="quantity-controls">
        <button onclick="updateQuantity(${index}, ${item.quantity - 1})">-</button>
        <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)">
        <button onclick="updateQuantity(${index}, ${item.quantity + 1})">+</button>
        <button class="remove-btn" onclick="removeFromCart(${index})">×</button>
      </div>
    `;
    cartItems.appendChild(li);
    total += item.price * item.quantity;
  });

  totalText.textContent = `Total: ${formatPrice(total)}`;
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  checkoutBtn.disabled = cart.length === 0;
}

// Abre/fecha o carrinho
function toggleCart() {
  cartDiv.classList.toggle("open");
  overlay.classList.toggle("show");
}

document.getElementById("cart-btn").addEventListener("click", toggleCart);
overlay.addEventListener("click", toggleCart);

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderProducts();
});

// Toast de feedback para o usuário
function showToast(message = "Produto adicionado ao carrinho!") {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

//Formatação da mensagem do pedido para o WhatsApp
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  const cep = document.getElementById("input-cep").value.trim();
  const address = document.getElementById("input-address").value.trim();
  const complement = document.getElementById("input-complement").value.trim();

  if (!cep || !address) {
    showToast("Preencha CEP e endereço (número) antes de finalizar.");
    return;
  }

  let message = "Pedido:\n";
  cart.forEach(item => {
    const variantLabel = item.variantType === "color" ? "Cor" : "Tamanho";
    message += `• ${item.name} (${variantLabel}: ${item.variant}) x${item.quantity} - ${formatPrice(item.price * item.quantity)}\n`;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  message += `Total: ${formatPrice(total)}\n`;
  message += `CEP: ${cep}\n`;
  message += `Endereço: ${address}\n`;
  message += `Complemento: ${complement || 'Não informado'}`;

  const phone = "5511945922993"; // Substitua pelo numero a ser utilizado para os pedidos.
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
});

// Inicializar
renderCategories();
renderProducts();
updateCart();

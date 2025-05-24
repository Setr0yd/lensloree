document.addEventListener('DOMContentLoaded', async () => {
  await loadAndRenderProducts();
});

async function loadAndRenderProducts() {
  try {
    const response = await fetch('http://localhost:3000/api/products');
    if (!response.ok) throw new Error('Ошибка загрузки товаров');
    
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error('Ошибка:', error);
    showError('Не удалось загрузить товары');
  }
}

function renderProducts(products) {
  const productGrid = document.querySelector('.product-grid');
  if (!productGrid) return;

  productGrid.innerHTML = products.map(product => `
    <div class="product-card">
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.title}" 
             onerror="this.src='/images/default-product.jpg'" 
             class="product-image">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.title}</h3>
        <p class="product-desc">${product.description || 'Нет описания'}</p>
        <div class="product-bottom">
          <span class="product-price">${product.price} ₽</span>
          <button class="product-button">В корзину</button>
        </div>
      </div>
    </div>
  `).join('');
}

function showError(message) {
  const container = document.querySelector('.products-container') || document.body;
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  container.prepend(errorElement);
}

// Обновляем товары при изменениях
window.addEventListener('productsUpdated', loadAndRenderProducts);
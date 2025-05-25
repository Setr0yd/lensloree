async function renderCategories() {
  const res = await fetch('/api/products');
  const products = await res.json();

  const categoryMap = {};

  // Группировка по категориям
  products.forEach(product => {
    const category = product.category || 'Без категории';
    if (!categoryMap[category]) categoryMap[category] = [];
    categoryMap[category].push(product);
  });

  const container = document.getElementById('categorySections');
  container.innerHTML = '';

  for (const [category, items] of Object.entries(categoryMap)) {
    const section = document.createElement('section');
    section.className = 'popular-products'; // Используем существующий стиль
    section.id = `cat-${category.replace(/\s+/g, '-')}`;

    section.innerHTML = `
      <div class="container">
        <h2 class="section-title">${category}</h2>
        <div class="product-grid">
          ${items.map(product => `
            <div class="product-card" data-id="${product.id}">
              <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.title}" class="product-image" />
              </div>
              <div class="product-info">
                <h3 class="product-name">${product.title}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-bottom">
                  <span class="product-price">${product.price} ₽</span>
                  <button class="product-button" data-id="${product.id}">В корзину</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.appendChild(section);
  }

  // Добавляем обработчики для кнопок "В корзину" после рендеринга
  document.querySelectorAll('.product-button').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const productId = parseInt(btn.dataset.id);
      if (!productId) {
        console.error('Не удалось определить ID товара для кнопки:', btn);
        return;
      }
      
      if (window.cart) {
        const added = await window.cart.addToCart(productId);
        if (added) {
          alert('Товар добавлен в корзину');
        }
      } else {
        console.error('Объект корзины не найден');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', renderCategories);

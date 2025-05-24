const form = document.getElementById('productForm');
const productList = document.getElementById('productList');
const API_URL = 'http://localhost:3000/api/products';
const modal = document.getElementById('modal');
const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');
const modalTitle = document.querySelector('.modal-content h2');

let currentProductId = null;

// Управление модальным окном
openModalBtn.addEventListener('click', () => {
  modalTitle.textContent = 'Добавить товар';
  form.reset();
  currentProductId = null;
  modal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Загрузка товаров
async function loadProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Ошибка загрузки');
    
    const products = await response.json();
    renderProducts(products);
    
    // Оповещаем главную страницу об обновлении
    window.dispatchEvent(new Event('productsUpdated'));
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Не удалось загрузить товары');
  }
}

// Отображение товаров
function renderProducts(products) {
  productList.innerHTML = products.map(product => `
    <div class="card">
      <img src="${product.image}" alt="${product.title}" onerror="this.src='/images/default.jpg'">
      <div class="info">
        <h3>${product.title}</h3>
        <p>Категория: ${product.category}</p>
        <p class="price">Цена: ${product.price} ₽</p>
        <p>Остаток: ${product.stock}</p>
        <p>${product.description}</p>
        <div class="actions">
          <button class="edit-btn" data-id="${product.id}">Редактировать</button>
          <button class="delete-btn" data-id="${product.id}">Удалить</button>
        </div>
      </div>
    </div>
  `).join('');

  // Назначение обработчиков
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editProduct(btn.dataset.id));
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
  });
}

// Редактирование товара
async function editProduct(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Ошибка загрузки товара');
    
    const product = await response.json();
    currentProductId = product.id;
    
    // Заполняем форму
    document.getElementById('title').value = product.title;
    document.getElementById('category').value = product.category;
    document.getElementById('price').value = product.price;
    document.getElementById('description').value = product.description;
    document.getElementById('image').value = product.image;
    document.getElementById('stock').value = product.stock;
    
    modalTitle.textContent = 'Редактировать товар';
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Не удалось загрузить товар');
  }
}

// Обработка формы
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const productData = {
    title: document.getElementById('title').value.trim(),
    category: document.getElementById('category').value.trim(),
    price: parseFloat(document.getElementById('price').value),
    description: document.getElementById('description').value.trim(),
    image: document.getElementById('image').value.trim(),
    stock: parseInt(document.getElementById('stock').value) || 0
  };

  // Валидация
  if (!productData.title || isNaN(productData.price)) {
    alert('Заполните название и цену');
    return;
  }

  try {
    const url = currentProductId ? `${API_URL}/${currentProductId}` : API_URL;
    const method = currentProductId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка сервера');
    }
    
    await loadProducts();
    modal.style.display = 'none';
  } catch (error) {
    console.error('Ошибка:', error);
    alert(error.message);
  }
});

// Удаление товара
async function deleteProduct(id) {
  if (!confirm('Удалить товар?')) return;
  
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    
    if (!response.ok) throw new Error('Ошибка удаления');
    
    await loadProducts();
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Не удалось удалить товар');
  }
}

// Инициализация
loadProducts();

// выпадающий список
const categories = ["Зеркальные", "Беззеркальные", "Объективы", "Аксессуары"];

function populateCategories() {
  const categorySelect = document.getElementById('category');
  categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

document.addEventListener('DOMContentLoaded', populateCategories);
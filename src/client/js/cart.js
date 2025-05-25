// Класс для работы с корзиной
class Cart {
  constructor() {
    this.items = [];
    this.isAuthenticated = this.checkAuthentication();
    this.userId = this.getUserId();
    this.init();
  }
  
  // Проверка авторизации пользователя
  checkAuthentication() {
    return localStorage.getItem('userLoggedIn') === 'true' && localStorage.getItem('token');
  }
  
  // Получение ID пользователя из токена
  getUserId() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // Простая проверка - в реальном проекте нужно декодировать JWT
      return token.split('.')[1] || 'user';
    } catch (error) {
      console.error('Ошибка получения ID пользователя:', error);
      return null;
    }
  }
  
  // Инициализация корзины
  async init() {
    console.log("Инициализация корзины...");
    if (this.isAuthenticated) {
      // Для авторизованных пользователей загружаем корзину с сервера
      await this.loadCartFromServer();
    } else {
      // Для неавторизованных пользователей корзина пуста
      this.items = [];
      this.clearLocalStorage();
    }
    this.updateCartIcon();
    console.log("Корзина инициализирована:", this.items);
  }
  
  // Загрузка корзины с сервера
  async loadCartFromServer() {
    try {
      console.log("Загрузка корзины с сервера...");
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.items = data.items || [];
        // Сохраняем корзину в localStorage для быстрого доступа
        localStorage.setItem('cartItems', JSON.stringify(this.items));
        console.log("Корзина загружена с сервера:", this.items);
      } else {
        console.error('Ошибка загрузки корзины с сервера:', response.status);
        this.items = [];
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины с сервера:', error);
      this.items = [];
    }
  }
  
  // Очистка localStorage от данных корзины
  clearLocalStorage() {
    try {
      localStorage.removeItem('cartItems');
      console.log("Данные корзины удалены из localStorage");
    } catch (error) {
      console.error('Ошибка очистки localStorage:', error);
    }
  }
  
  // Сохранение корзины
  async saveCart() {
    if (this.isAuthenticated) {
      // Для авторизованных пользователей сохраняем на сервере
      await this.saveCartToServer();
    } else {
      // Для неавторизованных пользователей корзина не сохраняется
      this.items = [];
      this.clearLocalStorage();
    }
    this.updateCartIcon();
  }
  
  // Сохранение корзины на сервере
  async saveCartToServer() {
    try {
      console.log("Сохранение корзины на сервере...");
      const token = localStorage.getItem('token');
      
      // Проверяем, что токен существует
      if (!token) {
        console.error('Ошибка сохранения корзины: отсутствует токен авторизации');
        return;
      }
      
      // Проверяем, что корзина не пуста
      if (!this.items || this.items.length === 0) {
        console.log('Корзина пуста, нечего сохранять');
        return;
      }
      
      console.log('Отправляем данные корзины:', JSON.stringify(this.items));
      
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: this.items })
      });
      
      if (!response.ok) {
        console.error('Ошибка сохранения корзины на сервере:', response.status);
        const errorText = await response.text();
        console.error('Текст ошибки:', errorText);
      } else {
        const result = await response.json();
        console.log("Корзина успешно сохранена на сервере:", result);
        // Сохраняем корзину в localStorage для быстрого доступа
        localStorage.setItem('cartItems', JSON.stringify(this.items));
      }
    } catch (error) {
      console.error('Ошибка сохранения корзины на сервере:', error);
    }
  }
  
  // Добавление товара в корзину
  async addToCart(productId, quantity = 1) {
    console.log(`Добавление товара в корзину: ID=${productId}, количество=${quantity}`);
    
    if (!this.isAuthenticated) {
      // Если пользователь не авторизован, показываем сообщение
      alert('Для добавления товаров в корзину необходимо авторизоваться');
      // Открываем модальное окно авторизации
      document.getElementById('loginModal')?.classList.add('active');
      return false;
    }
    
    // Проверяем, есть ли уже такой товар в корзине
    const existingItem = this.items.find(item => item.productId === productId);
    
    if (existingItem) {
      // Если товар уже есть, увеличиваем количество
      existingItem.quantity += quantity;
      console.log(`Увеличено количество товара ID=${productId} до ${existingItem.quantity}`);
    } else {
      // Если товара нет, добавляем новый
      this.items.push({
        productId,
        quantity,
        addedAt: new Date().toISOString()
      });
      console.log(`Добавлен новый товар в корзину: ID=${productId}, количество=${quantity}`);
    }
    
    // Сохраняем изменения
    await this.saveCart();
    
    // Показываем уведомление
    alert('Товар добавлен в корзину');
    
    return true;
  }
  
  // Обновление количества товара в корзине
  async updateQuantity(productId, quantity) {
    console.log(`Обновление количества товара: ID=${productId}, новое количество=${quantity}`);
    const itemIndex = this.items.findIndex(item => item.productId === productId);
    
    if (itemIndex !== -1) {
      if (quantity <= 0) {
        // Если количество <= 0, удаляем товар из корзины
        this.items.splice(itemIndex, 1);
        console.log(`Товар ID=${productId} удален из корзины (количество <= 0)`);
      } else {
        // Иначе обновляем количество
        this.items[itemIndex].quantity = quantity;
        console.log(`Количество товара ID=${productId} обновлено до ${quantity}`);
      }
      
      // Сохраняем изменения
      await this.saveCart();
      return true;
    }
    
    return false;
  }
  
  // Удаление товара из корзины
  async removeFromCart(productId) {
    console.log(`Удаление товара из корзины: ID=${productId}`);
    const itemIndex = this.items.findIndex(item => item.productId === productId);
    
    if (itemIndex !== -1) {
      this.items.splice(itemIndex, 1);
      console.log(`Товар ID=${productId} удален из корзины`);
      
      // Сохраняем изменения
      await this.saveCart();
      return true;
    }
    
    return false;
  }
  
  // Очистка корзины
  async clearCart() {
    console.log("Очистка корзины");
    this.items = [];
    
    // Сохраняем изменения
    await this.saveCart();
  }
  
  // Получение общего количества товаров в корзине
  getTotalQuantity() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
  
  // Получение общей стоимости товаров в корзине
  async getTotalPrice() {
    // Получаем информацию о товарах для расчета стоимости
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
      
      return this.items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return total + (product ? product.price * item.quantity : 0);
      }, 0);
    } catch (error) {
      console.error('Ошибка расчета стоимости корзины:', error);
      return 0;
    }
  }
  
  // Обновление иконки корзины
  updateCartIcon() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
      const count = this.getTotalQuantity();
      cartCountElement.textContent = count;
      cartCountElement.style.display = count > 0 ? 'flex' : 'none';
    }
  }
  
  // Отображение содержимого корзины
  async renderCartItems() {
    const cartItemsElement = document.getElementById('cartItems');
    if (!cartItemsElement) return;
    
    // Получаем информацию о товарах
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
      
      if (this.items.length === 0) {
        cartItemsElement.innerHTML = '<div class="empty-cart">Ваша корзина пуста</div>';
        return;
      }
      
      // Формируем HTML для каждого товара в корзине
      const itemsHTML = this.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return '';
        
        return `
          <div class="cart-item" data-id="${product.id}">
            <img src="${product.image}" alt="${product.title}" class="cart-item-image">
            <div class="cart-item-details">
              <h3 class="cart-item-title">${product.title}</h3>
              <div class="cart-item-price">${product.price} ₽</div>
            </div>
            <div class="cart-item-quantity">
              <button class="quantity-btn minus">-</button>
              <input type="number" value="${item.quantity}" min="1" class="quantity-input">
              <button class="quantity-btn plus">+</button>
            </div>
            <div class="cart-item-total">${product.price * item.quantity} ₽</div>
            <button class="remove-item-btn">&times;</button>
          </div>
        `;
      }).join('');
      
      // Добавляем итоговую стоимость
      const totalPrice = await this.getTotalPrice();
      const totalHTML = `
        <div class="cart-total">
          <div class="cart-total-label">Итого:</div>
          <div class="cart-total-price">${totalPrice} ₽</div>
        </div>
        <div class="cart-buttons">
          <button class="clear-cart-btn">Очистить корзину</button>
          <button class="checkout-btn">Оформить заказ</button>
        </div>
      `;
      
      cartItemsElement.innerHTML = itemsHTML + totalHTML;
      
      // Добавляем обработчики событий
      this.addCartEventListeners();
    } catch (error) {
      console.error('Ошибка отображения корзины:', error);
      cartItemsElement.innerHTML = '<div class="error-message">Ошибка загрузки корзины</div>';
    }
  }
  
  // Добавление обработчиков событий для элементов корзины
  addCartEventListeners() {
    const cartItemsElement = document.getElementById('cartItems');
    if (!cartItemsElement) return;
    
    // Обработчик кнопок изменения количества
    cartItemsElement.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const cartItem = e.target.closest('.cart-item');
        const productId = parseInt(cartItem.dataset.id);
        const quantityInput = cartItem.querySelector('.quantity-input');
        let quantity = parseInt(quantityInput.value);
        
        if (e.target.classList.contains('minus')) {
          quantity = Math.max(1, quantity - 1);
        } else if (e.target.classList.contains('plus')) {
          quantity += 1;
        }
        
        quantityInput.value = quantity;
        await this.updateQuantity(productId, quantity);
        this.renderCartItems();
      });
    });
    
    // Обработчик изменения значения в поле ввода количества
    cartItemsElement.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', async (e) => {
        const cartItem = e.target.closest('.cart-item');
        const productId = parseInt(cartItem.dataset.id);
        const quantity = Math.max(1, parseInt(e.target.value) || 1);
        
        e.target.value = quantity;
        await this.updateQuantity(productId, quantity);
        this.renderCartItems();
      });
    });
    
    // Обработчик кнопок удаления товара
    cartItemsElement.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const cartItem = e.target.closest('.cart-item');
        const productId = parseInt(cartItem.dataset.id);
        
        if (confirm('Вы уверены, что хотите удалить этот товар из корзины?')) {
          await this.removeFromCart(productId);
          this.renderCartItems();
        }
      });
    });
    
    // Обработчик кнопки очистки корзины
    const clearCartBtn = cartItemsElement.querySelector('.clear-cart-btn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', async () => {
        if (confirm('Вы уверены, что хотите очистить корзину?')) {
          await this.clearCart();
          this.renderCartItems();
        }
      });
    }
    
    // Обработчик кнопки оформления заказа
    const checkoutBtn = cartItemsElement.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        alert('Функционал оформления заказа находится в разработке');
      });
    }
  }
  
  // Сброс корзины при выходе из аккаунта
  resetCart() {
    console.log("Сброс корзины при выходе из аккаунта");
    // Не очищаем корзину на сервере, только локально
    this.items = [];
    this.isAuthenticated = false;
    this.userId = null;
    this.clearLocalStorage();
    this.updateCartIcon();
  }
}

// Инициализация корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ cart.js загружен и DOM готов");
  
  // Создаем экземпляр корзины
  const cart = new Cart();
  
  // Делаем корзину доступной глобально
  window.cart = cart;
  
  // Добавляем иконку корзины в шапку
  addCartIconToHeader();
  
  // Добавляем модальное окно корзины
  addCartModalToPage();
  
  // Добавляем обработчики событий
  addCartEventListeners();
  
  // Обновляем состояние корзины при изменении авторизации
  window.addEventListener('storage', (e) => {
    if (e.key === 'userLoggedIn' || e.key === 'token') {
      cart.isAuthenticated = cart.checkAuthentication();
      cart.userId = cart.getUserId();
      cart.init();
    }
  });
  
  // Добавляем обработчик для кнопки выхода из аккаунта
  setupLogoutHandler();
});

// Настройка обработчика выхода из аккаунта
function setupLogoutHandler() {
  // Находим кнопку выхода по классу или ID
  const logoutBtn = document.querySelector('.logout-btn') || document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    // Добавляем обработчик события клика
    logoutBtn.addEventListener('click', () => {
      // Сбрасываем корзину при выходе
      if (window.cart) {
        window.cart.resetCart();
      }
    });
  }
  
  // Также перехватываем стандартный процесс выхода
  const originalLogout = window.logout;
  if (typeof originalLogout === 'function') {
    window.logout = function() {
      // Сбрасываем корзину перед стандартным выходом
      if (window.cart) {
        window.cart.resetCart();
      }
      // Вызываем оригинальную функцию выхода
      originalLogout.apply(this, arguments);
    };
  }
}

// Добавление иконки корзины в шапку
function addCartIconToHeader() {
  const headerRight = document.querySelector('.nav-actions');
  if (!headerRight) return;
  
  // Проверяем, нет ли уже иконки корзины
  if (document.getElementById('cartIcon')) return;
  
  // Находим существующую иконку корзины
  const existingCartItem = document.querySelector('.action-item:has(#iconBasket)');
  if (existingCartItem) {
    // Добавляем счетчик к существующей иконке
    existingCartItem.classList.add('cart-icon');
    existingCartItem.id = 'cartIcon';
    existingCartItem.innerHTML = `
      <img src="icons/BlueBar/Basket.svg" alt="Корзина" id="iconBasket">
      <div id="cartCount" class="cart-count" style="display: none;">0</div>
      <span>Корзина</span>
    `;
  }
}

// Добавление модального окна корзины
function addCartModalToPage() {
  // Проверяем, нет ли уже модального окна корзины
  if (document.getElementById('cartModal')) return;
  
  // Создаем элемент модального окна
  const cartModalHTML = `
    <div id="cartModal" class="cart-modal">
      <div class="cart-modal-content">
        <div class="cart-modal-header">
          <div class="cart-modal-title">Корзина</div>
          <span id="closeCartModal" class="cart-close">&times;</span>
        </div>
        <div id="cartItems" class="cart-items">
          <div class="empty-cart">Ваша корзина пуста</div>
        </div>
      </div>
    </div>
  `;
  
  // Добавляем модальное окно в конец body
  document.body.insertAdjacentHTML('beforeend', cartModalHTML);
}

// Добавление обработчиков событий для корзины
function addCartEventListeners() {
  // Открытие модального окна корзины
  const cartIcon = document.getElementById('cartIcon');
  const cartModal = document.getElementById('cartModal');
  
  if (cartIcon && cartModal) {
    cartIcon.addEventListener('click', () => {
      cartModal.classList.add('active');
      window.cart.renderCartItems();
    });
  }
  
  // Закрытие модального окна корзины
  const closeCartModal = document.getElementById('closeCartModal');
  
  if (closeCartModal && cartModal) {
    closeCartModal.addEventListener('click', () => {
      cartModal.classList.remove('active');
    });
    
    // Закрытие при клике вне модального окна
    cartModal.addEventListener('click', (e) => {
      if (e.target === cartModal) {
        cartModal.classList.remove('active');
      }
    });
  }
  
  // Добавление обработчиков для кнопок "В корзину"
  document.querySelectorAll('.product-button').forEach(btn => {
    // Находим ID товара из родительской карточки
    const productCard = btn.closest('.product-card');
    if (!productCard) return;
    
    // Добавляем атрибут data-id к кнопке, если его нет
    if (!btn.dataset.id) {
      // Пытаемся найти ID товара в карточке
      const productId = productCard.dataset.id;
      if (productId) {
        btn.dataset.id = productId;
      }
    }
    
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Если у кнопки нет data-id, пытаемся найти его в родительской карточке
      if (!btn.dataset.id && productCard.dataset.id) {
        btn.dataset.id = productCard.dataset.id;
      }
      
      const productId = parseInt(btn.dataset.id);
      if (!productId) {
        console.error('Не удалось определить ID товара для кнопки:', btn);
        return;
      }
      
      const added = await window.cart.addToCart(productId);
      if (added) {
        console.log(`Товар ID=${productId} успешно добавлен в корзину`);
      }
    });
  });
}

// Функция для добавления товара в корзину (может вызываться из других скриптов)
function addToCart(productId, quantity = 1) {
  if (window.cart) {
    return window.cart.addToCart(productId, quantity);
  }
  return false;
}

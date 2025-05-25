// Модальное окно карточки товара
class ProductModal {
  constructor() {
    this.modal = null;
    this.currentProduct = null;
    this.currentImageIndex = 0;
    this.images = [];
    
    this.init();
  }
  
  init() {
    // Создаем модальное окно и добавляем в DOM
    this.createModal();
    
    // Добавляем обработчики событий
    this.addEventListeners();
  }
  
  createModal() {
    // Создаем элемент модального окна, если его еще нет
    if (!document.getElementById('productModal')) {
      const modalHTML = `
        <div id="productModal" class="product-modal">
          <span class="product-modal-close">&times;</span>
          <div class="product-modal-content">
            <div class="product-gallery">
              <img src="" alt="" class="product-main-image" id="productMainImage">
              <div class="gallery-nav">
                <button class="gallery-prev">&lt;</button>
                <button class="gallery-next">&gt;</button>
              </div>
              <div class="product-thumbnails" id="productThumbnails">
                <!-- Миниатюры будут добавлены динамически -->
              </div>
            </div>
            <div class="product-details">
              <h2 class="product-modal-title" id="productTitle"></h2>
              <div class="product-modal-category" id="productCategory"></div>
              <div class="product-modal-price" id="productPrice"></div>
              <div class="product-modal-description" id="productDescription"></div>
              <div class="product-modal-stock" id="productStock"></div>
              <div class="product-modal-actions">
                <button class="product-modal-add-to-cart" id="addToCartBtn">Добавить в корзину</button>
              </div>
              <div class="product-modal-specs">
                <h3>Характеристики</h3>
                <table class="specs-table" id="productSpecs">
                  <!-- Характеристики будут добавлены динамически -->
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this.modal = document.getElementById('productModal');
    } else {
      this.modal = document.getElementById('productModal');
    }
  }
  
  addEventListeners() {
    // Обработчик для открытия модального окна при клике на карточку товара
    document.addEventListener('click', (e) => {
      const productCard = e.target.closest('.product-card');
      if (productCard && !e.target.classList.contains('product-button')) {
        this.openProductModal(productCard);
      }
    });
    
    // Обработчик для закрытия модального окна
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('product-modal-close') || 
          (e.target.classList.contains('product-modal') && !e.target.closest('.product-modal-content'))) {
        this.closeModal();
      }
    });
    
    // Обработчики для галереи изображений
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('gallery-prev')) {
        this.prevImage();
      } else if (e.target.classList.contains('gallery-next')) {
        this.nextImage();
      } else if (e.target.classList.contains('product-thumbnail')) {
        const index = parseInt(e.target.dataset.index);
        this.showImage(index);
      }
    });
    
    // Обработчик для кнопки "Добавить в корзину"
    document.getElementById('addToCartBtn')?.addEventListener('click', () => {
      if (this.currentProduct && window.cart) {
        window.cart.addToCart(this.currentProduct.id);
      }
    });
  }
  
  async openProductModal(productCard) {
    const productId = productCard.dataset.id;
    
    try {
      // Получаем данные о товаре из API
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        // Если не удалось получить товар по ID, пробуем найти по имени
        const allProductsResponse = await fetch('/api/products');
        if (!allProductsResponse.ok) throw new Error('Ошибка загрузки товаров');
        
        const products = await allProductsResponse.json();
        const productName = productCard.querySelector('.product-name')?.textContent;
        const product = products.find(p => p.title === productName);
        
        if (product) {
          this.currentProduct = product;
          this.renderProductDetails(product);
          this.modal.style.display = 'block';
          this.prepareGalleryImages(product);
        } else {
          throw new Error('Товар не найден');
        }
      } else {
        // Если удалось получить товар по ID
        const product = await response.json();
        this.currentProduct = product;
        this.renderProductDetails(product);
        this.modal.style.display = 'block';
        this.prepareGalleryImages(product);
      }
    } catch (error) {
      console.error('Ошибка при получении данных о товаре:', error);
    }
  }
  
  renderProductDetails(product) {
    // Заполняем данные товара
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('productCategory').textContent = `Категория: ${product.category}`;
    document.getElementById('productPrice').textContent = `${product.price} ₽`;
    document.getElementById('productDescription').textContent = product.description || 'Описание отсутствует';
    
    // Отображаем статус наличия
    const stockElement = document.getElementById('productStock');
    if (product.stock > 5) {
      stockElement.textContent = `В наличии: ${product.stock} шт.`;
      stockElement.className = 'product-modal-stock in-stock';
    } else if (product.stock > 0) {
      stockElement.textContent = `Осталось мало: ${product.stock} шт.`;
      stockElement.className = 'product-modal-stock low-stock';
    } else {
      stockElement.textContent = 'Нет в наличии';
      stockElement.className = 'product-modal-stock out-of-stock';
    }
    
    // Устанавливаем основное изображение
    const mainImage = document.getElementById('productMainImage');
    mainImage.src = product.image;
    mainImage.alt = product.title;
    
    // Обновляем кнопку "Добавить в корзину" с ID товара
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.dataset.id = product.id;
    }
    
    // Заполняем характеристики из объекта товара
    this.renderProductSpecs(product);
  }
  
  renderProductSpecs(product) {
    const specsTable = document.getElementById('productSpecs');
    
    // Проверяем, есть ли у товара характеристики
    if (product.specifications && Object.keys(product.specifications).length > 0) {
      // Используем характеристики из объекта товара
      const specs = Object.entries(product.specifications).map(([name, value]) => {
        return { name, value };
      });
      
      // Заполняем таблицу характеристик
      specsTable.innerHTML = specs.map(spec => `
        <tr>
          <td>${spec.name}</td>
          <td>${spec.value}</td>
        </tr>
      `).join('');
    } else {
      // Если характеристик нет, показываем сообщение
      specsTable.innerHTML = `
        <tr>
          <td colspan="2">Характеристики не указаны</td>
        </tr>
      `;
    }
  }
  
  prepareGalleryImages(product) {
    // Сбрасываем текущий индекс и массив изображений
    this.currentImageIndex = 0;
    this.images = [];
    
    // Добавляем основное изображение
    if (product.image) {
      this.images.push({ src: product.image, alt: product.title });
    }
    
    // Добавляем дополнительные изображения, если они есть
    if (product.additionalImages && Array.isArray(product.additionalImages) && product.additionalImages.length > 0) {
      product.additionalImages.forEach((imgSrc, index) => {
        this.images.push({ 
          src: imgSrc, 
          alt: `${product.title} - изображение ${index + 2}` 
        });
      });
    }
    
    // Если изображений нет или только одно, добавляем заглушки для демонстрации функционала
    if (this.images.length <= 1) {
      // Добавляем заглушки только для демонстрации, в реальном проекте этот код нужно удалить
      if (product.category === 'Зеркальные' || product.category === 'Беззеркальные') {
        this.images.push(
          { src: 'https://cdn.fotosklad.ru/upload/size_1136_1136/560/uf3xs0wq948sc1syt4ip9cevaxpl4v3j_thumb_5cac9d18490c304.png', alt: `${product.title} - вид сбоку` },
          { src: 'https://cdn.fotosklad.ru/upload/size_478_478/faa/o03t82lelr533cvgzlyq2h3zqb5vnbgp_thumb_74cec6cc895c056.jpg', alt: `${product.title} - вид сзади` }
        );
      } else {
        this.images.push(
          { src: 'https://cdn.fotosklad.ru/upload/size_478_478/e49/e490b6ad5004f4fe1a15cf406afd33a0_thumb_74cec6cc895c056.jpg', alt: `${product.title} - дополнительное фото` }
        );
      }
    }
    
    // Отображаем миниатюры
    this.renderThumbnails();
  }
  
  renderThumbnails() {
    const thumbnailsContainer = document.getElementById('productThumbnails');
    thumbnailsContainer.innerHTML = this.images.map((image, index) => `
      <img src="${image.src}" alt="${image.alt}" 
           class="product-thumbnail ${index === this.currentImageIndex ? 'active' : ''}" 
           data-index="${index}">
    `).join('');
  }
  
  showImage(index) {
    if (index >= 0 && index < this.images.length) {
      this.currentImageIndex = index;
      
      // Обновляем основное изображение
      const mainImage = document.getElementById('productMainImage');
      mainImage.src = this.images[index].src;
      mainImage.alt = this.images[index].alt;
      
      // Обновляем активную миниатюру
      const thumbnails = document.querySelectorAll('.product-thumbnail');
      thumbnails.forEach((thumb, i) => {
        if (i === index) {
          thumb.classList.add('active');
        } else {
          thumb.classList.remove('active');
        }
      });
    }
  }
  
  nextImage() {
    const newIndex = (this.currentImageIndex + 1) % this.images.length;
    this.showImage(newIndex);
  }
  
  prevImage() {
    const newIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
    this.showImage(newIndex);
  }
  
  closeModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

// Инициализация модального окна карточки товара при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.productModal = new ProductModal();
});

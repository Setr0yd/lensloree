// Расширенное модальное окно редактирования товара для панели продавца
class SupplierModal {
  constructor() {
    this.currentProduct = null;
    this.currentImageIndex = 0;
    this.images = [];
    this.specifications = [];
    this.init();
  }
  
  // Инициализация модального окна
  init() {
    // Создаем модальное окно, если его еще нет
    this.createModal();
    
    // Добавляем обработчики событий для карточек товаров в панели продавца
    this.addProductCardEventListeners();
    
    // Добавляем кнопку "Добавить товар"
    this.addNewProductButton();
  }
  
  // Создание модального окна
  createModal() {
    // Проверяем, нет ли уже модального окна
    if (document.getElementById('supplierModal')) return;
    
    // Создаем элемент модального окна
    const modalHTML = `
      <div id="supplierModal" class="supplier-modal">
        <div class="supplier-modal-content">
          <div class="supplier-modal-header">
            <div class="supplier-modal-title">Редактирование товара</div>
            <span id="closeSupplierModal" class="supplier-modal-close">&times;</span>
          </div>
          <div class="supplier-modal-body">
            <div class="supplier-gallery">
              <div class="supplier-main-image-container">
                <img src="" alt="" class="supplier-main-image" id="supplierMainImage">
                <div class="supplier-main-image-placeholder" id="supplierMainImagePlaceholder">
                  Нет изображения
                </div>
              </div>
              <div class="supplier-thumbnails" id="supplierThumbnails">
                <!-- Миниатюры будут добавлены динамически -->
              </div>
              <div class="supplier-image-upload">
                <!-- Добавляем поле для загрузки изображений по URL -->
                <div class="supplier-image-url-upload">
                  <input type="text" id="imageUrlInput" placeholder="URL изображения" class="form-control">
                  <button id="addImageUrlBtn" class="supplier-image-url-btn">Добавить по URL</button>
                </div>
                
                <!-- Индикатор загрузки -->
                <div id="uploadStatusIndicator" class="upload-status-indicator" style="display: none;">
                  <div class="upload-spinner"></div>
                  <span id="uploadStatusText">Проверка изображения...</span>
                </div>
              </div>
            </div>
            <div class="supplier-product-form">
              <div class="form-group">
                <label for="productTitle" class="form-label">Название товара</label>
                <input type="text" id="productTitle" class="form-control" placeholder="Введите название товара">
              </div>
              <div class="form-group">
                <label for="productPrice" class="form-label">Цена (₽)</label>
                <input type="number" id="productPrice" class="form-control" placeholder="Введите цену">
              </div>
              <div class="form-group">
                <label for="productCategory" class="form-label">Категория</label>
                <select id="productCategory" class="form-control">
                  <option value="">Выберите категорию</option>
                </select>
              </div>
              <div class="form-group">
                <label for="productStock" class="form-label">Количество</label>
                <input type="number" id="productStock" class="form-control" placeholder="Введите количество">
              </div>
              <div class="form-group">
                <label for="productDescription" class="form-label">Описание</label>
                <textarea id="productDescription" class="form-control" placeholder="Введите описание товара"></textarea>
              </div>
              <div class="supplier-specs">
                <div class="supplier-specs-title">
                  <span>Характеристики</span>
                  <button id="addSpecBtn" class="add-spec-btn">+ Добавить</button>
                </div>
                <ul class="supplier-specs-list" id="supplierSpecsList">
                  <!-- Характеристики будут добавлены динамически -->
                </ul>
              </div>
            </div>
          </div>
          <div class="supplier-modal-actions">
            <button id="cancelBtn" class="cancel-btn">Отмена</button>
            <button id="saveBtn" class="save-btn">Сохранить</button>
          </div>
        </div>
      </div>
    `;
    
    // Добавляем модальное окно в конец body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Добавляем стили для новых элементов
    this.addStyles();
    
    // Добавляем обработчики событий для модального окна
    this.addModalEventListeners();
    
    // Заполняем выпадающий список категорий
    this.populateCategories();
  }
  
  // Добавление стилей для новых элементов
  addStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .supplier-image-url-upload {
        margin-top: 10px;
        display: flex;
        gap: 10px;
      }
      
      .supplier-image-url-btn {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .supplier-image-url-btn:hover {
        background-color: #45a049;
      }
      
      .upload-status-indicator {
        margin-top: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #1D4ED8;
      }
      
      .upload-spinner {
        width: 20px;
        height: 20px;
        border: 3px solid rgba(29, 78, 216, 0.3);
        border-radius: 50%;
        border-top-color: #1D4ED8;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      
      .upload-error {
        color: #e53e3e;
      }
      
      .upload-success {
        color: #38a169;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Заполнение выпадающего списка категорий
  populateCategories() {
    const categories = ["Зеркальные", "Беззеркальные", "Объективы", "Аксессуары"];
    const categorySelect = document.getElementById('productCategory');
    
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
      });
    }
  }
  
  // Добавление кнопки "Добавить товар"
  addNewProductButton() {
    // Находим существующую кнопку
    const existingButton = document.getElementById('openModal');
    
    if (existingButton) {
      // Переопределяем обработчик клика
      existingButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.openSupplierModal({
          title: '',
          price: '',
          category: '',
          description: '',
          stock: 0,
          specifications: {},
          image: '',
          additionalImages: []
        });
      });
    }
  }
  
  // Добавление обработчиков событий для модального окна
  addModalEventListeners() {
    const modal = document.getElementById('supplierModal');
    const closeBtn = document.getElementById('closeSupplierModal');
    
    // Закрытие модального окна при клике на крестик
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }
    
    // Закрытие модального окна при клике вне его содержимого
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }
    
    // Обработчик для кнопки добавления изображения по URL
    const addImageUrlBtn = document.getElementById('addImageUrlBtn');
    const imageUrlInput = document.getElementById('imageUrlInput');
    
    if (addImageUrlBtn && imageUrlInput) {
      addImageUrlBtn.addEventListener('click', () => {
        const url = imageUrlInput.value.trim();
        if (url) {
          this.addImageByUrl(url);
          imageUrlInput.value = '';
        }
      });
      
      // Добавление по Enter
      imageUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const url = imageUrlInput.value.trim();
          if (url) {
            this.addImageByUrl(url);
            imageUrlInput.value = '';
          }
        }
      });
    }
    
    // Обработчик для кнопки добавления характеристики
    const addSpecBtn = document.getElementById('addSpecBtn');
    
    if (addSpecBtn) {
      addSpecBtn.addEventListener('click', () => {
        this.addSpecification('', '');
      });
    }
    
    // Обработчики для кнопок отмены и сохранения
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }
    
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveProduct();
      });
    }
  }
  
  // Показать индикатор загрузки
  showUploadIndicator(message = 'Проверка изображения...', isError = false, isSuccess = false) {
    const indicator = document.getElementById('uploadStatusIndicator');
    const statusText = document.getElementById('uploadStatusText');
    
    if (indicator && statusText) {
      statusText.textContent = message;
      
      // Сбрасываем классы
      statusText.classList.remove('upload-error', 'upload-success');
      
      // Добавляем соответствующий класс
      if (isError) {
        statusText.classList.add('upload-error');
      } else if (isSuccess) {
        statusText.classList.add('upload-success');
      }
      
      indicator.style.display = 'flex';
    }
  }
  
  // Скрыть индикатор загрузки
  hideUploadIndicator(delay = 0) {
    setTimeout(() => {
      const indicator = document.getElementById('uploadStatusIndicator');
      if (indicator) {
        indicator.style.display = 'none';
      }
    }, delay);
  }
  
  // Проверка, является ли URL изображением
  async isImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve(true);
      };
      
      img.onerror = () => {
        resolve(false);
      };
      
      img.src = url;
    });
  }
  
  // Добавление изображения по URL
  async addImageByUrl(url) {
    if (!url) return;
    
    try {
      this.showUploadIndicator('Проверка изображения...');
      
      // Проверяем, является ли URL изображением
      const isImage = await this.isImageUrl(url);
      
      if (isImage) {
        // Добавляем URL в массив
        this.images.push(url);
        
        // Если это первое изображение, устанавливаем его как основное
        if (this.images.length === 1) {
          this.currentImageIndex = 0;
        }
        
        // Обновляем изображения
        this.updateImages();
        
        this.showUploadIndicator('Изображение успешно добавлено!', false, true);
        this.hideUploadIndicator(2000);
      } else {
        throw new Error('Указанный URL не является изображением');
      }
    } catch (error) {
      console.error('Ошибка при добавлении изображения по URL:', error);
      this.showUploadIndicator(`Ошибка: ${error.message}`, true);
      this.hideUploadIndicator(3000);
    }
  }
  
  // Добавление обработчиков событий для карточек товаров в панели продавца
  addProductCardEventListeners() {
    // Используем делегирование событий для обработки кликов по кнопкам редактирования
    document.addEventListener('click', async (e) => {
      // Проверяем, что клик был по кнопке редактирования
      if (e.target.classList.contains('edit-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        // Находим ID товара
        const productId = e.target.dataset.id;
        if (!productId) return;
        
        // Получаем информацию о товаре
        try {
          const response = await fetch(`/api/products/${productId}`);
          const product = await response.json();
          
          if (product) {
            this.openSupplierModal(product);
          }
        } catch (error) {
          console.error('Ошибка получения информации о товаре:', error);
        }
      }
    });
  }
  
  // Открытие модального окна с информацией о товаре
  openSupplierModal(product) {
    this.currentProduct = product;
    
    // Подготавливаем изображения
    this.prepareImages(product);
    
    // Подготавливаем характеристики
    this.prepareSpecifications(product);
    
    // Обновляем информацию в модальном окне
    this.updateModalContent(product);
    
    // Показываем модальное окно
    const modal = document.getElementById('supplierModal');
    if (modal) {
      modal.classList.add('active');
    }
  }
  
  // Подготовка изображений для галереи
  prepareImages(product) {
    // Сбрасываем текущий индекс
    this.currentImageIndex = 0;
    
    // Подготавливаем массив изображений
    this.images = [];
    
    // Добавляем основное изображение
    if (product.image) {
      this.images.push(product.image);
    }
    
    // Добавляем дополнительные изображения, если они есть
    if (product.additionalImages && Array.isArray(product.additionalImages)) {
      this.images = this.images.concat(product.additionalImages);
    }
  }
  
  // Подготовка характеристик товара
  prepareSpecifications(product) {
    this.specifications = [];
    
    if (product.specifications && typeof product.specifications === 'object') {
      // Преобразуем объект характеристик в массив пар [имя, значение]
      this.specifications = Object.entries(product.specifications);
    }
  }
  
  // Обновление содержимого модального окна
  updateModalContent(product) {
    const modal = document.getElementById('supplierModal');
    if (!modal) return;
    
    // Обновляем заголовок
    const title = modal.querySelector('.supplier-modal-title');
    if (title) {
      title.textContent = product.id ? 'Редактирование товара' : 'Добавление товара';
    }
    
    // Обновляем основное изображение и миниатюры
    this.updateImages();
    
    // Обновляем поля формы
    const titleInput = document.getElementById('productTitle');
    const priceInput = document.getElementById('productPrice');
    const categoryInput = document.getElementById('productCategory');
    const stockInput = document.getElementById('productStock');
    const descriptionInput = document.getElementById('productDescription');
    
    if (titleInput) titleInput.value = product.title || '';
    if (priceInput) priceInput.value = product.price || '';
    if (categoryInput) categoryInput.value = product.category || '';
    if (stockInput) stockInput.value = product.stock || 0;
    if (descriptionInput) descriptionInput.value = product.description || '';
    
    // Обновляем характеристики
    this.updateSpecifications();
  }
  
  // Обновление изображений
  updateImages() {
    const mainImage = document.getElementById('supplierMainImage');
    const mainImagePlaceholder = document.getElementById('supplierMainImagePlaceholder');
    const thumbnails = document.getElementById('supplierThumbnails');
    
    if (!mainImage || !mainImagePlaceholder || !thumbnails) return;
    
    // Обновляем основное изображение
    if (this.images.length > 0) {
      mainImage.src = this.images[this.currentImageIndex];
      mainImage.style.display = 'block';
      mainImagePlaceholder.style.display = 'none';
    } else {
      mainImage.style.display = 'none';
      mainImagePlaceholder.style.display = 'flex';
    }
    
    // Обновляем миниатюры
    thumbnails.innerHTML = '';
    
    this.images.forEach((imageUrl, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'supplier-thumbnail';
      if (index === this.currentImageIndex) {
        thumbnail.classList.add('active');
      }
      
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = '';
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'supplier-thumbnail-remove';
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeImage(index);
      });
      
      thumbnail.appendChild(img);
      thumbnail.appendChild(removeBtn);
      
      thumbnail.addEventListener('click', () => {
        this.currentImageIndex = index;
        this.updateImages();
      });
      
      thumbnails.appendChild(thumbnail);
    });
  }
  
  // Обновление характеристик
  updateSpecifications() {
    const specsList = document.getElementById('supplierSpecsList');
    if (!specsList) return;
    
    // Очищаем список характеристик
    specsList.innerHTML = '';
    
    // Добавляем характеристики
    this.specifications.forEach(([name, value]) => {
      this.addSpecification(name, value);
    });
  }
  
  // Добавление характеристики
  addSpecification(name, value) {
    const specsList = document.getElementById('supplierSpecsList');
    if (!specsList) return;
    
    const specItem = document.createElement('li');
    specItem.className = 'supplier-spec-item';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'spec-input';
    nameInput.placeholder = 'Название';
    nameInput.value = name;
    
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'spec-input';
    valueInput.placeholder = 'Значение';
    valueInput.value = value;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-spec-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', () => {
      specItem.remove();
    });
    
    specItem.appendChild(nameInput);
    specItem.appendChild(valueInput);
    specItem.appendChild(removeBtn);
    specsList.appendChild(specItem);
  }
  
  // Удаление изображения
  removeImage(index) {
    if (index < 0 || index >= this.images.length) return;
    
    // Удаляем изображение из массива
    this.images.splice(index, 1);
    
    // Если удалили текущее изображение, обновляем индекс
    if (index === this.currentImageIndex) {
      this.currentImageIndex = Math.min(index, this.images.length - 1);
      if (this.currentImageIndex < 0) this.currentImageIndex = 0;
    } else if (index < this.currentImageIndex) {
      // Если удалили изображение перед текущим, уменьшаем индекс
      this.currentImageIndex--;
    }
    
    // Обновляем изображения
    this.updateImages();
  }
  
  // Сохранение товара
  async saveProduct() {
    // Получаем данные из формы
    const titleInput = document.getElementById('productTitle');
    const priceInput = document.getElementById('productPrice');
    const categoryInput = document.getElementById('productCategory');
    const stockInput = document.getElementById('productStock');
    const descriptionInput = document.getElementById('productDescription');
    
    // Проверяем обязательные поля
    if (!titleInput.value || !priceInput.value || !categoryInput.value) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    // Собираем характеристики
    const specsList = document.getElementById('supplierSpecsList');
    const specifications = {};
    
    if (specsList) {
      specsList.querySelectorAll('.supplier-spec-item').forEach(item => {
        const nameInput = item.querySelector('.spec-input:first-child');
        const valueInput = item.querySelector('.spec-input:last-of-type');
        
        if (nameInput && valueInput && nameInput.value && valueInput.value) {
          specifications[nameInput.value] = valueInput.value;
        }
      });
    }
    
    // Формируем данные товара
    const productData = {
      title: titleInput.value,
      price: parseFloat(priceInput.value),
      category: categoryInput.value,
      stock: parseInt(stockInput.value) || 0,
      description: descriptionInput.value,
      specifications,
      image: this.images.length > 0 ? this.images[0] : '',
      additionalImages: this.images.slice(1)
    };
    
    // Если редактируем существующий товар, добавляем ID
    if (this.currentProduct && this.currentProduct.id) {
      productData.id = this.currentProduct.id;
    }
    
    try {
      // Определяем URL и метод запроса
      const url = productData.id 
        ? `/api/products/${productData.id}` 
        : '/api/products';
      const method = productData.id ? 'PUT' : 'POST';
      
      // Отправляем запрос
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при сохранении товара');
      }
      
      // Получаем ответ
      const result = await response.json();
      
      // Закрываем модальное окно
      this.closeModal();
      
      // Обновляем список товаров
      if (typeof loadProducts === 'function') {
        loadProducts();
      }
    } catch (error) {
      console.error('Ошибка при сохранении товара:', error);
      alert('Произошла ошибка при сохранении товара');
    }
  }
  
  // Закрытие модального окна
  closeModal() {
    const modal = document.getElementById('supplierModal');
    if (modal) {
      modal.classList.remove('active');
    }
    
    // Сбрасываем текущий товар
    this.currentProduct = null;
    
    // Сбрасываем изображения
    this.images = [];
    this.currentImageIndex = 0;
    
    // Сбрасываем характеристики
    this.specifications = [];
  }
}

// Создаем экземпляр класса при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new SupplierModal();
  
  // Загружаем товары при загрузке страницы
  if (typeof loadProducts === 'function') {
    loadProducts();
  }
});

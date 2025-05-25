document.querySelectorAll('a[href^="#cat-"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


// Скрипт для управления поведением header-wrapper и blue-bar_inner при скролле
document.addEventListener('DOMContentLoaded', function() {
  // Получаем элементы
  const headerWrapper = document.querySelector('.header-wrapper');
  const blueBar = document.querySelector('.blue-bar');
  const blueBarInner = document.querySelector('.blue-bar_inner');
  
  // Получаем начальные позиции элементов
  const headerWrapperTop = headerWrapper ? headerWrapper.offsetTop : 0;
  const blueBarTop = blueBar ? blueBar.offsetTop : 0;
  
  // Создаем placeholder для предотвращения скачков контента
  const headerPlaceholder = document.createElement('div');
  const blueBarPlaceholder = document.createElement('div');
  
  // Добавляем placeholders в DOM
  if (headerWrapper) {
    headerPlaceholder.style.height = headerWrapper.offsetHeight + 'px';
    headerPlaceholder.style.display = 'none';
    headerWrapper.parentNode.insertBefore(headerPlaceholder, headerWrapper);
  }
  
  if (blueBar) {
    blueBarPlaceholder.style.height = blueBar.offsetHeight + 'px';
    blueBarPlaceholder.style.display = 'none';
    blueBar.parentNode.insertBefore(blueBarPlaceholder, blueBar);
  }
  
  // Функция для обработки скролла
  function handleScroll() {
    const scrollPosition = window.scrollY;
    
    // Если прокрутили дальше позиции header-wrapper
    if (scrollPosition > headerWrapperTop) {
      // Фиксируем header-wrapper
      if (headerWrapper) {
        headerWrapper.classList.add('fixed');
        headerPlaceholder.style.display = 'block';
      }
      
      // Фиксируем blue-bar под header-wrapper
      if (blueBar) {
        blueBar.classList.add('fixed');
        blueBar.style.top = (headerWrapper ? headerWrapper.offsetHeight : 0) + 'px';
        blueBarPlaceholder.style.display = 'block';
      }
    } else {
      // Возвращаем элементы в нормальное положение
      if (headerWrapper) {
        headerWrapper.classList.remove('fixed');
        headerPlaceholder.style.display = 'none';
      }
      
      if (blueBar) {
        blueBar.classList.remove('fixed');
        blueBar.style.top = '';
        blueBarPlaceholder.style.display = 'none';
      }
    }
  }
  
  // Добавляем обработчик события скролла
  window.addEventListener('scroll', handleScroll);
  
  // Вызываем функцию при загрузке страницы
  handleScroll();
  
  // Обновляем размеры при изменении размера окна
  window.addEventListener('resize', function() {
    if (headerWrapper && headerPlaceholder) {
      headerPlaceholder.style.height = headerWrapper.offsetHeight + 'px';
    }
    
    if (blueBar && blueBarPlaceholder) {
      blueBarPlaceholder.style.height = blueBar.offsetHeight + 'px';
    }
    
    handleScroll();
  });
});

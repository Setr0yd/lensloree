// API endpoints
const API_URL = 'http://localhost:3000/api';
const REGISTER_URL = `${API_URL}/auth/register`;
const LOGIN_URL = `${API_URL}/auth/login`;
const CHECK_EMAIL_URL = `${API_URL}/auth/check-email`;

// Элементы формы
const registerForm = document.getElementById('registerForm');
const emailInput = document.getElementById('email-signup');
const emailError = document.getElementById('email-error');

// Проверка почты на существование
emailInput.addEventListener('blur', async () => {
  const email = emailInput.value.trim();
  if (!email) return;

  try {
    const response = await fetch(CHECK_EMAIL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    
    if (data.exists) {
      emailError.textContent = 'Этот email уже зарегистрирован';
      emailInput.classList.add('error');
    } else {
      emailError.textContent = '';
      emailInput.classList.remove('error');
    }
  } catch (error) {
    console.error('Ошибка проверки email:', error);
  }
});

// Обработка регистрации
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value.trim(),
    email: emailInput.value.trim(),
    password: document.getElementById('password-signup').value,
    role: document.getElementById('user-role').value
  };
  
  const confirmPassword = document.getElementById('confirm-password').value;

  // Валидация
  if (formData.password !== confirmPassword) {
    alert('Пароли не совпадают');
    return;
  }

  try {
    const response = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка регистрации');
    }

    const user = await response.json();
    
    // Сохраняем данные пользователя
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userLoggedIn', 'true');
    
    // Обновляем UI
    updateUserUI();
    alert('Регистрация прошла успешно!');
    document.getElementById('loginModal').classList.remove('active');
    
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    alert(error.message);
  }
});

// Функция обновления интерфейса
function updateUserUI() {
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  
  const guestBtn = document.getElementById('guestUserBtn');
  const authMenu = document.getElementById('authUserMenu');
  const addProductIcon = document.getElementById('addProductIcon');

  if (isLoggedIn && user) {
    guestBtn.style.display = 'none';
    authMenu.style.display = 'flex';
    
    // Показываем иконку добавления для поставщиков
    addProductIcon.style.display = user.role === 'supplier' ? 'flex' : 'none';
    
    // Обновляем имя в меню
    document.querySelector('#userDropdownBtn span').textContent = user.name;
  } else {
    guestBtn.style.display = 'flex';
    authMenu.style.display = 'none';
    addProductIcon.style.display = 'none';
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', updateUserUI);

// Обработка входа
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка входа');
    }

    const { user, token } = await response.json();
    
    // Сохраняем данные
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('userLoggedIn', 'true');
    
    updateUserUI();
    document.getElementById('loginModal').classList.remove('active');
    
  } catch (error) {
    console.error('Ошибка входа:', error);
    alert(error.message);
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('userLoggedIn');
  updateUserUI();
});
// Открытие модального окна при клике на иконку пользователя
document.getElementById('guestUserBtn').addEventListener('click', function(e) {
  e.preventDefault();
  const modal = document.getElementById('loginModal');
  
  // Сброс форм и отображение формы входа
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginFormElement').reset();
  
  modal.classList.add('active');
});

// Закрытие модального окна
document.getElementById('closeModal').addEventListener('click', function() {
  document.getElementById('loginModal').classList.remove('active');
});

document.querySelector('.modal-overlay').addEventListener('click', function() {
  document.getElementById('loginModal').classList.remove('active');
});



<<<<<<< HEAD
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


=======
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ auth.js загружен и DOM готов");

  // --- Константы URL API ---
  const API_URL = 'http://localhost:3000/api';
  const REGISTER_URL = `${API_URL}/auth/register`;
  const LOGIN_URL = `${API_URL}/auth/login`;
  const CHECK_EMAIL_URL = `${API_URL}/auth/check-email`;
  const DELETE_ACCOUNT_URL = `${API_URL}/auth/delete-account`;

  // --- Элементы формы ---
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById('email-signup');
  const emailError = document.getElementById('email-error');
  const guestBtn = document.getElementById('guestUserBtn');
  const authMenu = document.getElementById('authUserMenu');
  const addProductIcon = document.getElementById('addProductIcon');
  const loginModal = document.getElementById('loginModal');
  const closeModalBtn = document.getElementById('closeModal');
  const modalOverlay = document.querySelector('.modal-overlay');
  const logoutBtn = document.getElementById('logoutBtn');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  const showSignupLink = document.getElementById('showSignup');
  const showLoginLink = document.getElementById('showLogin');
  const loginFormContainer = document.getElementById('loginFormContainer');
  const userDropdownBtn = document.getElementById('userDropdownBtn');
  const userDropdown = document.getElementById('userDropdown');

  // --- Инициализация ---
  initEventListeners();
  updateUserUI();

  function initEventListeners() {
    // Проверка email при уходе с поля
    emailInput?.addEventListener('blur', checkEmailAvailability);

    // Обработка регистрации
    registerForm?.addEventListener('submit', handleRegistration);

    // Обработка входа
    loginForm?.addEventListener('submit', handleLogin);

    // Выход пользователя
    logoutBtn?.addEventListener('click', handleLogout);

    // Удаление аккаунта
    deleteAccountBtn?.addEventListener('click', confirmDeleteAccount);

    // Открытие модального окна
    guestBtn?.addEventListener('click', openAuthModal);

    // Закрытие модального окна
    closeModalBtn?.addEventListener('click', closeAuthModal);
    modalOverlay?.addEventListener('click', closeAuthModal);

    // Переключение между формами
    showSignupLink?.addEventListener('click', showSignupForm);
    showLoginLink?.addEventListener('click', showLoginForm);

    // Открытие/закрытие выпадающего меню пользователя
    userDropdownBtn?.addEventListener('click', toggleUserDropdown);

    // Закрытие выпадающего меню при клике вне его
    document.addEventListener('click', (e) => {
      if (userDropdown && userDropdownBtn && !userDropdownBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('active');
      }
    });
  }

  // --- Функции для работы с формами ---
  async function checkEmailAvailability() {
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
  }

  async function handleRegistration(e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById('name').value.trim(),
      email: emailInput.value.trim(),
      password: document.getElementById('password-signup').value,
      role: document.getElementById('user-role').value
    };

    const confirmPassword = document.getElementById('confirm-password').value;

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

      const data = await response.json();
      
      // Сохраняем только объект пользователя, а не весь ответ
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('userLoggedIn', 'true');

      updateUserUI();
      alert('Регистрация прошла успешно!');
      closeAuthModal();
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      alert(error.message);
    }
  }

  async function handleLogin(e) {
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

      const data = await response.json();

      // Сохраняем только объект пользователя, а не весь ответ
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('userLoggedIn', 'true');

      updateUserUI();
      closeAuthModal();
    } catch (error) {
      console.error('Ошибка входа:', error);
      alert(error.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userLoggedIn');
    updateUserUI();
  }

  function confirmDeleteAccount() {
    if (confirm('Вы действительно хотите удалить аккаунт?')) {
      deleteAccount();
    }
  }

  async function deleteAccount() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!user || !token) {
        throw new Error('Пользователь не авторизован');
      }

      const response = await fetch(DELETE_ACCOUNT_URL, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка удаления аккаунта');
      }

      // Очищаем данные пользователя
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userLoggedIn');
      
      updateUserUI();
      alert('Ваш аккаунт был успешно удален');
    } catch (error) {
      console.error('Ошибка удаления аккаунта:', error);
      alert(error.message);
    }
  }

  // --- Функции для работы с модальным окном ---
  function openAuthModal(e) {
    e.preventDefault();
    showLoginForm();
    loginModal.classList.add('active');
  }

  function closeAuthModal() {
    loginModal.classList.remove('active');
  }

  function showSignupForm(e) {
    if (e) e.preventDefault();
    loginFormContainer.classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
  }

  function showLoginForm(e) {
    if (e) e.preventDefault();
    document.getElementById('signupForm').classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
  }

  // --- Функции для работы с выпадающим меню пользователя ---
  function toggleUserDropdown(e) {
    e.preventDefault();
    console.log('Переключение меню пользователя');
    userDropdown.classList.toggle('active');
  }

  // --- Обновление интерфейса ---
  function updateUserUI() {
    const user = JSON.parse(localStorage.getItem('user'));
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';

    console.log('updateUserUI:', { user, isLoggedIn });

    if (isLoggedIn && user) {
      if (guestBtn) guestBtn.style.display = 'none';
      if (authMenu) authMenu.style.display = 'flex';
      if (addProductIcon) addProductIcon.style.display = user.role === 'supplier' ? 'flex' : 'none';
      
      // Текст "Профиль" уже установлен в HTML
    } else {
      if (guestBtn) guestBtn.style.display = 'flex';
      if (authMenu) authMenu.style.display = 'none';
      if (addProductIcon) addProductIcon.style.display = 'none';
    }
  }
});
>>>>>>> 73c3102 (Guss)

  const langSelect = document.getElementById('langSelect');
  const langDropdown = document.getElementById('langDropdown');
  const currentLang = document.getElementById('currentLang');
  const currentFlag = document.getElementById('currentFlag');

  langSelect.addEventListener('click', () => {
    langDropdown.style.display = langDropdown.style.display === 'block' ? 'none' : 'block';
  });

  langDropdown.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
      const selectedLang = item.getAttribute('data-lang');
      const selectedFlag = item.getAttribute('data-flag');
      currentLang.textContent = selectedLang;
      currentFlag.src = selectedFlag;
      langDropdown.style.display = 'none';
    });
  });

  // Закрыть, если клик вне селектора
  document.addEventListener('click', (e) => {
    if (!langSelect.contains(e.target)) {
      langDropdown.style.display = 'none';
    }
  });
  // список категории
  document.getElementById('catalogBtn').addEventListener('click', () => {
  const menu = document.getElementById('catalogMenu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});
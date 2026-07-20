const frame = document.getElementById('appFrame');
const loader = document.getElementById('loader');

if (frame && loader) {
  frame.addEventListener('load', () => loader.classList.add('hide'));
  setTimeout(() => loader.classList.add('hide'), 9000);
}

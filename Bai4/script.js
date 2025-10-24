// === TÌM KIẾM / LỌC SẢN PHẨM ===
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

function filterProducts() {
  const keyword = (searchInput.value || '').trim().toLowerCase();
  const items = document.querySelectorAll('#san-pham .product-item'); // luôn lấy mới

  items.forEach((item) => {
    const name = (
      item.querySelector('.product-name')?.textContent || ''
    ).toLowerCase();
    item.style.display = !keyword || name.includes(keyword) ? '' : 'none';
  });
}

searchBtn.addEventListener('click', filterProducts);
searchInput.addEventListener('keyup', filterProducts); // lọc realtime

// === ẨN/HIỆN FORM THÊM SẢN PHẨM ===
const addProductBtn = document.getElementById('addProductBtn');
const addProductForm = document.getElementById('addProductForm');
const cancelBtn = document.getElementById('cancelBtn');
const errorMsg = document.getElementById('errorMsg');

addProductBtn?.addEventListener('click', () => {
  addProductForm.classList.toggle('hidden');
  clearError();
});

cancelBtn?.addEventListener('click', () => {
  addProductForm.reset();
  addProductForm.classList.add('hidden');
  clearError();
});

// === SUBMIT FORM: VALIDATE + THÊM SẢN PHẨM ===
addProductForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('pname').value.trim();
  const img = document.getElementById('pimg').value.trim();
  const desc = document.getElementById('pdesc').value.trim();
  const priceVal = document.getElementById('pprice').value.trim();
  const priceNum = Number(priceVal);

  // Validate
  if (!name) return showError('Vui lòng nhập tên sản phẩm.');
  if (!priceVal || Number.isNaN(priceNum) || priceNum <= 0)
    return showError('Giá phải là số dương (ví dụ: 149000).');
  if (desc && desc.length < 5)
    return showError('Mô tả quá ngắn (ít nhất 5 ký tự) hoặc để trống.');

  clearError();

  // Tạo phần tử sản phẩm
  const article = document.createElement('article');
  article.className = 'product-item';
  article.innerHTML = `
    <h3 class="product-name">${escapeHTML(name)}</h3>
    ${img ? `<img src="${escapeAttr(img)}" alt="Ảnh ${escapeAttr(name)}">` : ''}
    ${desc ? `<p>${escapeHTML(desc)}</p>` : ''}
    <p>Giá: ${formatPriceVND(priceNum)}</p>
  `;

  // Chèn NGAY DƯỚI tiêu đề "Sản phẩm nổi bật"
  const productSection = document.getElementById('san-pham');
  const heading = productSection.querySelector('h2');
  const afterHeading = heading.nextElementSibling;
  if (afterHeading) productSection.insertBefore(article, afterHeading);
  else productSection.appendChild(article);

  // Reset + ẩn form + áp dụng filter hiện tại
  addProductForm.reset();
  addProductForm.classList.add('hidden');
  filterProducts();
});

/* ===== Helpers ===== */
function showError(msg) {
  if (!errorMsg) return alert(msg);
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
}
function clearError() {
  if (!errorMsg) return;
  errorMsg.textContent = '';
  errorMsg.classList.add('hidden');
}
function formatPriceVND(n) {
  try {
    return n.toLocaleString('vi-VN') + '₫';
  } catch {
    return `${n}₫`;
  }
}
function escapeHTML(str) {
  return str.replace(
    /[&<>"']/g,
    (s) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[
        s
      ])
  );
}
function escapeAttr(str) {
  return escapeHTML(str);
}

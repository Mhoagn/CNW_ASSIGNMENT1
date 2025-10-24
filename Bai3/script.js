// === TÌM KIẾM / LỌC SẢN PHẨM ===
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

function filterProducts() {
  const keyword = (searchInput.value || '').trim().toLowerCase();

  // Lấy danh sách sản phẩm hiện tại (dynamic – để sản phẩm mới thêm cũng được lọc)
  const items = document.querySelectorAll('#san-pham .product-item');

  items.forEach((item) => {
    const nameEl = item.querySelector('.product-name');
    const name = (nameEl?.textContent || '').toLowerCase();

    // Hiện những sản phẩm khớp, ẩn sản phẩm không khớp
    if (!keyword || name.includes(keyword)) {
      item.style.display = ''; // reset về mặc định
    } else {
      item.style.display = 'none';
    }
  });
}

searchBtn.addEventListener('click', filterProducts);
// Lọc realtime khi gõ
searchInput.addEventListener('keyup', filterProducts);

// === ẨN/HIỆN FORM THÊM SẢN PHẨM ===
const addProductBtn = document.getElementById('addProductBtn');
const addProductForm = document.getElementById('addProductForm');

addProductBtn.addEventListener('click', () => {
  addProductForm.classList.toggle('hidden');
});

// === SUBMIT FORM: THÊM SẢN PHẨM MỚI VÀO LIST ===
addProductForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const pname = document.getElementById('pname').value.trim();
  const pimg = document.getElementById('pimg').value.trim();
  const pdesc = document.getElementById('pdesc').value.trim();
  const pprice = document.getElementById('pprice').value.trim();

  if (!pname || !pprice) {
    alert('Vui lòng nhập tối thiểu Tên sản phẩm và Giá.');
    return;
  }

  // Tạo thẻ article mới
  const article = document.createElement('article');
  article.className = 'product-item';
  article.innerHTML = `
    <h3 class="product-name">${escapeHTML(pname)}</h3>
    ${
      pimg
        ? `<img src="${escapeAttr(pimg)}" alt="Ảnh ${escapeAttr(pname)}">`
        : ''
    }
    ${pdesc ? `<p>${escapeHTML(pdesc)}</p>` : ''}
    <p>Giá: ${escapeHTML(pprice)}</p>
  `;

  // Gắn vào cuối danh sách sản phẩm
  document.getElementById('san-pham').appendChild(article);

  // Reset form, ẩn form, và nếu đang lọc thì lọc lại để áp dụng cho item mới
  addProductForm.reset();
  addProductForm.classList.add('hidden');
  filterProducts();
});

/* ===== Helpers nho nhỏ để tránh chèn HTML bừa bãi ===== */
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
  // đơn giản tái dùng escapeHTML cho thuộc tính
  return escapeHTML(str);
}

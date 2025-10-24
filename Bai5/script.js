const STORAGE_KEY = 'products';

// Format giá (số) -> "123.000₫"
function formatPriceVND(n) {
  try {
    return Number(n).toLocaleString('vi-VN') + '₫';
  } catch {
    return `${n}₫`;
  }
}

// Chuyển "189.000₫" -> 189000 (số)
function parsePriceToNumber(text) {
  if (typeof text !== 'string') return Number(text) || 0;
  const digits = text.replace(/[^\d]/g, '');
  return Number(digits) || 0;
}

// Escape để tránh chèn HTML
function escapeHTML(str) {
  return String(str).replace(
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

// Lấy/ghi LocalStorage
function getStoredProducts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return null;
  } catch {
    return null;
  }
}
function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ================== RENDER SẢN PHẨM ==================
function createProductArticle(p) {
  const article = document.createElement('article');
  article.className = 'product-item';
  article.innerHTML = `
    <h3 class="product-name">${escapeHTML(p.name)}</h3>
    ${
      p.img
        ? `<img src="${escapeAttr(p.img)}" alt="Ảnh ${escapeAttr(p.name)}">`
        : ''
    }
    ${p.desc ? `<p>${escapeHTML(p.desc)}</p>` : ''}
    <p>Giá: ${formatPriceVND(p.price)}</p>
  `;
  return article;
}

function renderProducts(products) {
  const section = document.getElementById('san-pham');
  section.querySelectorAll('article').forEach((a) => a.remove());

  const frag = document.createDocumentFragment();
  products.forEach((p) => frag.appendChild(createProductArticle(p)));
  section.appendChild(frag);

  console.log('[RENDER] Đã render', products.length, 'sản phẩm lên màn hình.');
}

// Thu thập các sản phẩm mẫu từ DOM (lần đầu nếu chưa có LocalStorage)
function collectSampleProductsFromDOM() {
  const nodes = document.querySelectorAll('#san-pham .product-item');
  const arr = [];
  nodes.forEach((item) => {
    const name = (
      item.querySelector('.product-name')?.textContent || ''
    ).trim();
    const img = item.querySelector('img')?.getAttribute('src') || '';
    // tìm p chứa giá (giả định p cuối cùng)
    const priceText = item.querySelector('p:last-of-type')?.textContent || '';
    const price = parsePriceToNumber(priceText);
    // mô tả: lấy p đầu tiên KHÁC p giá
    let desc = '';
    const pEls = item.querySelectorAll('p');
    if (pEls.length > 1) {
      // p cuối là giá → mô tả lấy các p trước đó gộp lại
      const mids = Array.from(pEls)
        .slice(0, pEls.length - 1)
        .map((p) => p.textContent.trim());
      desc = mids.join(' ');
    } else if (pEls.length === 1) {
      const maybeDesc = pEls[0].textContent.trim();
      // nếu p duy nhất không chứa 'Giá:' thì coi là mô tả
      desc = /giá\s*:?/i.test(maybeDesc) ? '' : maybeDesc;
    }

    if (name) arr.push({ name, img, desc, price });
  });
  return arr;
}

// Khởi tạo dữ liệu từ LocalStorage hoặc DOM
function initProducts() {
  let products = getStoredProducts();

  if (!products || !products.length) {
    // Chưa có dữ liệu → đọc từ DOM mẫu
    products = collectSampleProductsFromDOM();
    saveProducts(products);
    console.log(
      '[INIT] Khởi tạo từ DOM mẫu và lưu vào localStorage:',
      products
    );
  } else {
    console.log(
      '[INIT] Khôi phục từ localStorage. Số sản phẩm:',
      products.length,
      products
    );
  }

  renderProducts(products);
}

// ================== TÌM KIẾM / LỌC ==================
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

function filterProducts() {
  const keyword = (searchInput?.value || '').trim().toLowerCase();
  const items = document.querySelectorAll('#san-pham .product-item'); // luôn lấy mới

  items.forEach((item) => {
    const name = (
      item.querySelector('.product-name')?.textContent || ''
    ).toLowerCase();
    item.style.display = !keyword || name.includes(keyword) ? '' : 'none';
  });
}

searchBtn?.addEventListener('click', filterProducts);
searchInput?.addEventListener('keyup', filterProducts); // lọc realtime

// ================== THÊM SẢN PHẨM (VALIDATE + LƯU LOCALSTORAGE) ==================
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

addProductForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('pname').value.trim();
  const img = document.getElementById('pimg').value.trim();
  const desc = document.getElementById('pdesc').value.trim();
  const priceVal = document.getElementById('pprice').value.trim();
  const priceNum = Number(priceVal);

  if (!name) return showError('Vui lòng nhập tên sản phẩm.');
  if (!priceVal || Number.isNaN(priceNum) || priceNum <= 0)
    return showError('Giá phải là số dương (ví dụ: 149000).');
  if (desc && desc.length < 5)
    return showError('Mô tả quá ngắn (ít nhất 5 ký tự) hoặc để trống.');

  clearError();

  const products = getStoredProducts() || [];
  const newProduct = { name, img, desc, price: priceNum };

  // Thêm vào đầu
  products.unshift(newProduct);
  saveProducts(products);

  console.log('[ADD] Đã thêm & lưu vào localStorage:', newProduct);
  console.log('[ADD] Tổng số sản phẩm sau khi lưu:', products.length);
  console.log(
    '[ADD] Bạn có thể nhấn F5 – dữ liệu vẫn còn do đã lưu trong localStorage.'
  );

  renderProducts(products);

  addProductForm.reset();
  addProductForm.classList.add('hidden');
  filterProducts();
});

/* ===== Helpers UI lỗi ===== */
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

// ================== CHẠY KHỞI TẠO ==================
initProducts();

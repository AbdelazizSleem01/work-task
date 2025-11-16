const themeToggle = document.getElementById("themeToggle");
const langToggle = document.getElementById("langToggle");

const orderModal = document.getElementById("orderModal");
const addOrderBtn = document.getElementById("addOrderBtn");
const closeModal = document.getElementById("closeModal");

const orderForm = document.getElementById("orderForm");
const ordersTableBody = document.getElementById("ordersTableBody");

let editMode = false;
let editId = null;

let currentPage = 1;
const itemsPerPage = 10;

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

let currentLang = localStorage.getItem("lang") || "ar";

function applyLanguage() {
    document.querySelectorAll("[data-lang]").forEach(el => {
        el.style.display = el.getAttribute("data-lang") === currentLang ? "" : "none";
    });
    document.body.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");
    document.documentElement.lang = currentLang;
}

applyLanguage();

langToggle.addEventListener("click", () => {
    currentLang = currentLang === "ar" ? "en" : "ar";
    localStorage.setItem("lang", currentLang);
    applyLanguage();
    renderTable();
});

addOrderBtn.addEventListener("click", () => {
    editMode = false;
    orderForm.reset();
    document.getElementById("quantity").value = 50;
    orderModal.classList.add("show");
    document.body.style.overflow = "hidden";
});

closeModal.addEventListener("click", () => {
    orderModal.classList.remove("show");
    document.body.style.overflow = "";
});

window.addEventListener("click", (e) => {
    if (e.target === orderModal) {
        orderModal.classList.remove("show");
        document.body.style.overflow = "";
    }
});

let orders = JSON.parse(localStorage.getItem("orders")) || [];

const realCustomers = [
    "أحمد محمد علي", "فاطمة أحمد حسن", "محمد إبراهيم السيد", "نور عبد الرحمن",
    "سارة خالد محمود", "عمر علي عبد الله", "ليلى حسني الجزار", "يوسف مصطفى كامل",
    "ريم جمال عبد الناصر", "خالد سامي الديب", "منى طارق الشريف", "إسلام رضا فتحي",
    "هبة الله أشرف", "مصطفى جمال الدين", "زينب صلاح عبد الفتاح", "عبد الرحمن حازم",
    "مريم سعيد الجندي", "أية الله عادل", "حسن عبد المنعم", "نرمين إيهاب"
];

const realProducts = [
    "لابتوب ديل انسبايرون 15", "هاتف سامسونج جالاكسي A54", "تابلت أبل آيباد اير",
    "سماعات سوني WH-1000XM5", "شاحن أنكر باور كور 20 ألف", "ماوس لوجيتك MX Master 3S",
    "كيبورد ميكانيكي كورسير K70", "شاشة سامسونج 27 بوصة منحنية", "راوتر تي بي لينك Archer AX73",
    "كاميرا كانون EOS 2000D", "طابعة اتش بي ليزر جيت M404n", "باور بانك شاومي 10000mAh",
    "سماعات أبل AirPods Pro 2", "لابتوب لينوفو ثينك باد X1", "هاتف شاومي 13T برو",
    "تابلت سامسونج جالاكسي تاب S9", "نظارات واقع افتراضي ميتا كويست 3",
    "برج تبريد NZXT Kraken", "كارت شاشة RTX 4070", "هارد SSD سامسونج 990 PRO 1TB"
];

if (orders.length === 0) {
    orders = [];

    for (let i = 1; i <= 50; i++) {
        const customer = realCustomers[Math.floor(Math.random() * realCustomers.length)];
        const product = realProducts[Math.floor(Math.random() * realProducts.length)];
        const qty = Math.floor(Math.random() * 10) + 1;
        const price = (Math.random() * 8000 + 500).toFixed(2);
        const statuses = ["مكتمل", "قيد المعالجة", "ملغى", "جديد", "تم التوصيل"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        orders.push({
            id: i,
            customer: customer,
            product: product,
            qty: qty,
            price: price,
            status: status,
            date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
                .toLocaleDateString("ar-EG")
        });
    }

    localStorage.setItem("orders", JSON.stringify(orders));
}

function renderTable() {
    ordersTableBody.innerHTML = "";

    if (orders.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="8" style="text-align: center; padding: 30px;">
            <i class="fas fa-inbox" style="font-size: 48px; color: var(--primary-light);"></i>
            <p data-lang="ar">لا توجد طلبات مضافة بعد</p>
            <p data-lang="en" style="display: none;">No orders added yet</p>
        </td>`;
        ordersTableBody.appendChild(row);
        renderPagination();
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageOrders = orders.slice(start, end);

    pageOrders.forEach(order => {
        const total = (order.qty * order.price).toFixed(2);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td>${order.qty}</td>
            <td class="highlight">${total} ج.م</td>
            <td>${order.date}</td>
            <td class="${order.status.includes('مكتمل') || order.status.includes('Completed') ? 'status-completed' :
                       order.status.includes('قيد') || order.status.includes('Processing') ? 'status-pending' : 'status-cancelled'}">
                ${order.status}
            </td>
            <td class="actions-cell">
                <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;

        row.dataset.id = order.id;
        ordersTableBody.appendChild(row);
    });

    renderPagination();
}

function renderPagination() {
    const existingPagination = document.getElementById("paginationContainer");
    if (existingPagination) {
        existingPagination.remove();
    }

    const totalPages = Math.ceil(orders.length / itemsPerPage);

    if (totalPages <= 1) return; 

    const paginationContainer = document.createElement("div");
    paginationContainer.id = "paginationContainer";
    paginationContainer.className = "pagination-container";

    const prevBtn = document.createElement("button");
    prevBtn.className = "pagination-btn";
    prevBtn.innerHTML = currentLang === "ar" ? "السابق ←" : "← Previous";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    };
    paginationContainer.appendChild(prevBtn);

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        const btn = document.createElement("button");
        btn.className = "pagination-btn";
        btn.textContent = "1";
        btn.onclick = () => { currentPage = 1; renderTable(); };
        paginationContainer.appendChild(btn);

        if (startPage > 2) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-ellipsis";
            ellipsis.textContent = "...";
            paginationContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.className = "pagination-btn";
        if (i === currentPage) btn.classList.add("active");
        btn.textContent = i;
        btn.onclick = () => { currentPage = i; renderTable(); };
        paginationContainer.appendChild(btn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-ellipsis";
            ellipsis.textContent = "...";
            paginationContainer.appendChild(ellipsis);
        }

        const btn = document.createElement("button");
        btn.className = "pagination-btn";
        btn.textContent = totalPages;
        btn.onclick = () => { currentPage = totalPages; renderTable(); };
        paginationContainer.appendChild(btn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.className = "pagination-btn";
    nextBtn.innerHTML = currentLang === "ar" ? "التالي →" : "Next →";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    };
    paginationContainer.appendChild(nextBtn);

    const dataTable = document.querySelector(".data-table");
    dataTable.appendChild(paginationContainer);
}

renderTable();

orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const customer = document.getElementById("customerName").value;
    const product = document.getElementById("product").value;
    const qty = document.getElementById("quantity").value || 50;
    const price = document.getElementById("price").value;
    const status = document.getElementById("status").value;

    if (editMode) {
        const order = orders.find(o => o.id === editId);
        order.customer = customer;
        order.product = product;
        order.qty = qty;
        order.price = price;
        order.status = status;
    } else {
        const newOrder = {
            id: orders.length ? orders[orders.length - 1].id + 1 : 1,
            customer,
            product,
            qty,
            price,
            status,
            date: new Date().toLocaleDateString("ar-EG")
        };
        orders.push(newOrder);
    }

    localStorage.setItem("orders", JSON.stringify(orders));
    renderTable();
    orderModal.classList.remove("show");
    document.body.style.overflow = "";
});

ordersTableBody.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    if (!row || !row.dataset.id) return;
    const id = parseInt(row.dataset.id);

    if (e.target.classList.contains("delete-btn")) {
        if (confirm(currentLang === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure?")) {
            orders = orders.filter(o => o.id !== id);
            const totalPages = Math.ceil(orders.length / itemsPerPage);
            if (currentPage > totalPages) {
                currentPage = Math.max(1, totalPages);
            }
            localStorage.setItem("orders", JSON.stringify(orders));
            renderTable();
        }
    }

    if (e.target.classList.contains("edit-btn")) {
        const order = orders.find(o => o.id === id);
        document.getElementById("customerName").value = order.customer;
        document.getElementById("product").value = order.product;
        document.getElementById("quantity").value = order.qty;
        document.getElementById("price").value = order.price;
        document.getElementById("status").value = order.status;

        editMode = true;
        editId = id;
        orderModal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
});

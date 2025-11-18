// Dữ liệu mẫu — bạn có thể thay bằng localStorage hoặc API
let cart = [
    { name: "Xứ Mèo", price: 79200, quantity: 1, img: "../public/Anh/biasach.jpg" },
    { name: "Việt Nam – Ăn Mặc Thong Dong", price: 171000, quantity: 1, img: "../public/Anh/biasach.jpg" },
    { name: "Thực Hành Dịch Tiếng Trung", price: 79200, quantity: 1, img: "../public/Anh/biasach.jpg" },
    { name: "Tân Thanh", price: 79200, quantity: 1, img: "../public/Anh/biasach.jpg" },
    { name: "Ngôn Ngữ Trong Thể Thao Việt - Hán", price: 108000, quantity: 1, img: "../public/Anh/biasach.jpg" }
];

// ------- TÍNH TỔNG SỐ LƯỢNG TẤT CẢ SẢN PHẨM -------
function getTotalItems() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ------- HIỂN THỊ GIỎ HÀNG -------
function loadCart() {
    let tbody = document.getElementById("cart-body");
    tbody.innerHTML = "";
    let totalAll = 0;

    cart.forEach((item, index) => {
        let totalPrice = item.quantity * item.price;
        totalAll += totalPrice;

        let row = `
        <tr>
            <td class="product-image"><img src="${item.img}" /></td>
            <td class="product-name">${item.name}</td>
            <td>${item.price.toLocaleString()}đ</td>

            <td>
                <div class="quantity">
                    <button onclick="changeQtyButton(${index}, -1)">-</button>

                    <input type="number" min="1" 
                        value="${item.quantity}"
                        onfocus="this.select()"
                        oninput="changeQtyInput(${index}, this.value)"
                    >

                    <button onclick="changeQtyButton(${index}, 1)">+</button>
                </div>
            </td>

            <td class="total red-price">${totalPrice.toLocaleString()}đ</td>
            <td><div class="remove-btn" onclick="removeItem(${index})">✕</div></td>
        </tr>`;

        tbody.innerHTML += row;
    });

    document.getElementById("cart-total").textContent = totalAll.toLocaleString() + "đ";
    document.getElementById("total-items").textContent = getTotalItems() + " items";
}

// ------- TĂNG / GIẢM SỐ LƯỢNG -------
function changeQty(index, num) {
    cart[index].quantity += num;

    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }

    loadCart();
}

// ------- XOÁ SẢN PHẨM -------
function removeItem(index) {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        cart.splice(index, 1);
        loadCart();
    }
}

// ------- KHỞI CHẠY -------
loadCart();
function changeQtyButton(index, amount) {
    cart[index].quantity += amount;

    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }

    loadCart();
}
function changeQtyInput(index, value) {
    value = parseInt(value);

    if (isNaN(value) || value < 1) {
        value = 1;
    }

    cart[index].quantity = value;

    loadCart();
}


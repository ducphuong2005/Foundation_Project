let inventory = [
    {id:1, name:"Book A", category:"Fiction", stock:25, price:12},
    {id:2, name:"Book B", category:"Education", stock:5, price:20},
    {id:3, name:"Book C", category:"Novel", stock:0, price:15},
];

let editID = null;

function renderInventory() {
    let tbody = document.getElementById("inventoryTable");
    tbody.innerHTML = "";

    inventory.forEach(item => {
        let statusClass = item.stock === 0 ? "status-red" :
                          item.stock <= 5 ? "status-yellow" :
                          "status-green";

        let statusText = item.stock === 0 ? "Out of Stock" :
                         item.stock <= 5 ? "Low Stock" :
                         "In Stock";

        tbody.innerHTML += `
        <tr class="fade-in">
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.stock}</td>
            <td>$${item.price}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-edit" onclick="openEditModal(${item.id})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${item.id})">Delete</button>
            </td>
        </tr>`;
    });

    updateSummary();
}

function updateSummary() {
    document.getElementById("totalItems").textContent = inventory.length;
    document.getElementById("lowStock").textContent = inventory.filter(x => x.stock > 0 && x.stock <= 5).length;
    document.getElementById("outStock").textContent = inventory.filter(x => x.stock === 0).length;
}

function openAddModal() {
    editID = null;
    document.getElementById("modalTitle").textContent = "Add Product";
    resetForm();
    document.getElementById("inventoryModal").classList.remove("hidden");
}

function openEditModal(id) {
    editID = id;
    let p = inventory.find(x => x.id === id);

    document.getElementById("modalTitle").textContent = "Edit Product";
    document.getElementById("pName").value = p.name;
    document.getElementById("pCategory").value = p.category;
    document.getElementById("pStock").value = p.stock;
    document.getElementById("pPrice").value = p.price;

    document.getElementById("inventoryModal").classList.remove("hidden");
}

function saveProduct() {
    let name = document.getElementById("pName").value;
    let cat = document.getElementById("pCategory").value;
    let stock = Number(document.getElementById("pStock").value);
    let price = Number(document.getElementById("pPrice").value);

    if (!name || !cat) return alert("Please fill all fields!");

    if (editID !== null) { // check rõ
        let p = inventory.find(x => x.id === editID);
        p.name = name; p.category = cat; p.stock = stock; p.price = price;
    } else {
        inventory.push({
            id: Date.now(),
            name, category: cat, stock, price
        });
    }

    closeModal();
    renderInventory();
}

function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    inventory = inventory.filter(x => x.id !== id);
    renderInventory();
}

function closeModal() {
    document.getElementById("inventoryModal").classList.add("hidden");
}

function resetForm() {
    document.getElementById("pName").value = "";
    document.getElementById("pCategory").value = "";
    document.getElementById("pStock").value = "";
    document.getElementById("pPrice").value = "";
}

// render lần đầu
renderInventory();

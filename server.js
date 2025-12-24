// ================= CUSTOMER ORDER API =================
// (Moved below app initialization)
// ...existing code...
// Place these routes after 'const app = express();'

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const multer = require("multer");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();
const PORT = 3000;

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "public", "images");
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || "");
        const base = path
            .basename(file.originalname || "image", ext)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "image";
        const uniqueSuffix = Date.now();
        cb(null, `${base}-${uniqueSuffix}${ext}`);
    }
});

const imageUpload = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype || !file.mimetype.startsWith("image/")) {
            return cb(new Error("Chỉ hỗ trợ tải lên tệp ảnh"));
        }
        cb(null, true);
    }
});

/* =========================
    SESSION & PASSPORT
========================= */
app.use(session({
    secret: "hahabook_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((u, done) => done(null, u));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
        },
        (accessToken, refresh, profile, done) => {
            const user = {
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
            };
            done(null, user);
        }
    )
);

/* =========================
        MIDDLEWARE
========================= */
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

/* =========================
     JSON DATABASE ACCESS
========================= */
function getUsers() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, "users.json"), "utf-8"));
}
function saveUsers(users) {
    fs.writeFileSync(path.join(__dirname, "users.json"), JSON.stringify(users, null, 2));
}

function getDB() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, "database.json"), "utf-8"));
}
function saveDB(db) {
    fs.writeFileSync(path.join(__dirname, "database.json"), JSON.stringify(db, null, 2));
}

/* =========================
         LOGIN / REGISTER
========================= */
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.json({ success: false, message: "Sai email hoặc mật khẩu!" });

    req.session.user = {
        name: user.name,
        email: user.email,
        role: email === "admin@happybook.com" ? "admin" : "user"
    };

    res.json({ success: true, role: req.session.user.role, name: user.name });
});

app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;

    let users = getUsers();
    if (users.find(u => u.email === email))
        return res.json({ success: false, message: "Email đã tồn tại!" });

    users.push({
        name, email, password,
        cart: [],
        orders: [],
        history: [],
        lastCategory: ""
    });

    saveUsers(users);
    res.json({ success: true });
});

app.get("/api/logout", (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
});

/* =========================
       GOOGLE LOGIN
========================= */
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login.html" }),
    (req, res) => {
        const users = getUsers();
        const g = req.user;

        let exist = users.find(u => u.email === g.email);
        if (!exist) {
            users.push({
                name: g.name,
                email: g.email,
                avatar: g.avatar,
                cart: [],
                orders: [],
                history: [],
                lastCategory: ""
            });
            saveUsers(users);
        }

        req.session.user = g;
        res.redirect("/home");
    }
);

/* =========================
       USER INFO
========================= */
app.get("/api/user/info", (req, res) => {
    if (!req.session.user) return res.json({ loggedIn: false });

    const users = getUsers();
    const user = users.find(u => u.email === req.session.user.email);

    res.json({
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        cart: user.cart || [],
        history: user.history || [],
        lastCategory: user.lastCategory || "",
    });
});

/* =========================
          CART API
========================= */
app.get("/api/cart", (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Chưa đăng nhập" });

    const users = getUsers();
    const user = users.find(u => u.email === req.session.user.email);

    res.json(user.cart || []);
});

app.post("/api/cart/add", (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: "Chưa đăng nhập" });

    const { id, qty } = req.body;

    let users = getUsers();
    let index = users.findIndex(u => u.email === req.session.user.email);

    let cart = users[index].cart || [];
    let item = cart.find(p => p.id === id);

    if (item) item.qty += qty;
    else cart.push({ id, qty });

    users[index].cart = cart;
    saveUsers(users);

    res.json({ success: true, cart });
});
/* ============================================================
   CATEGORY + VIEW HISTORY
============================================================ */
app.post("/api/user/category", (req, res) => {
    if (!req.session.user)
        return res.status(401).json({ message: "Chưa đăng nhập" });

    const { category } = req.body;

    let users = getUsers();
    let index = users.findIndex(u => u.email === req.session.user.email);

    users[index].lastCategory = category;
    saveUsers(users);

    res.json({ success: true });
});

app.post("/api/user/viewed", (req, res) => {
    if (!req.session.user)
        return res.status(401).json({ message: "Chưa đăng nhập" });

    const { productId } = req.body;

    let users = getUsers();
    let index = users.findIndex(u => u.email === req.session.user.email);

    let history = users[index].history || [];
    if (!history.includes(productId)) history.push(productId);

    users[index].history = history;
    saveUsers(users);

    res.json({ success: true });
});

/* ============================================================
   PRODUCT API (PUBLIC)
============================================================ */

// Lấy toàn bộ sản phẩm
app.get("/api/products", (req, res) => {
    const db = getDB();
    res.json(db.products);
});

// Lấy sản phẩm theo category
app.get("/api/products/category/:cat", (req, res) => {
    const db = getDB();
    const cat = req.params.cat;

    const result = db.products.filter(p => p.category === cat);
    res.json(result);
});

// Lấy chi tiết 1 sản phẩm
app.get("/api/product/:id", (req, res) => {
    const db = getDB();
    const id = Number(req.params.id);

    const product = db.products.find(p => p.id === id);
    if (!product)
        return res.status(404).json({ message: "Product not found" });

    res.json(product);
});

/* ============================================================
   CHECKOUT API (CREATE ORDER)
============================================================ */
app.post("/api/cart/checkout", (req, res) => {
    if (!req.session.user)
        return res.status(401).json({ success: false, message: "Chưa đăng nhập" });

    let users = getUsers();
    const userIndex = users.findIndex(u => u.email === req.session.user.email);

    if (userIndex === -1)
        return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });

    const cart = users[userIndex].cart || [];
    if (cart.length === 0)
        return res.json({ success: false, message: "Giỏ hàng trống!" });

    // Tạo ID đơn hàng dạng HPYYMMDDXXX
    const today = new Date().toISOString().slice(2, 10).replace(/-/g, ""); 
    const todayCount =
        users
            .flatMap(u => u.orders || [])
            .filter(o => o.id && o.id.startsWith("HP" + today))
            .length + 1;

    const orderId = `HP${today}${String(todayCount).padStart(3, "0")}`;

    // Tính tổng giá
    const db = getDB();
    let total = 0;

    const orderItems = cart.map(item => {
        const p = db.products.find(x => x.id === item.id);
        const price = p?.priceNew || 0;
        total += price * item.qty;

        return {
            id: item.id,
            qty: item.qty,
            price: price,
            title: p?.title || "Unknown Product"
        };
    });

    // Tạo đơn hàng
    const newOrder = {
        id: orderId,
        date: new Date().toLocaleString("vi-VN"),
        items: orderItems,
        total: total,
        status: "Đang xử lý"
    };

    // Lưu đơn hàng vào user
    if (!users[userIndex].orders) users[userIndex].orders = [];
    users[userIndex].orders.unshift(newOrder);

    // Xóa giỏ hàng
    users[userIndex].cart = [];

    saveUsers(users);

    res.json({
        success: true,
        message: "Đặt hàng thành công!",
        orderId: orderId
    });
});
/* ============================================================
   ADMIN MIDDLEWARE (Protect Admin Pages)
============================================================ */
function isAdmin(req, res, next) {
    if (!req.session.user || req.session.user.email !== "admin@happybook.com") {
        return res.status(403).json({ message: "Bạn không có quyền admin" });
    }
    next();
}

/* ============================================================
   ADMIN: UPLOAD COVER IMAGE
============================================================ */
app.post("/api/admin/upload-image", isAdmin, (req, res) => {
    imageUpload.single("image")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Không nhận được tệp ảnh" });
        }

        res.json({
            success: true,
            fileName: req.file.filename,
            url: `/images/${req.file.filename}`
        });
    });
});

/* ============================================================
   ADMIN: GET ALL PRODUCTS (For ManageInventory.html)
============================================================ */
app.get("/api/admin/products", isAdmin, (req, res) => {
    const db = getDB();
    res.json(db.products);
});

/* ============================================================
   ADMIN: ADD PRODUCT  (From addbook.html)
============================================================ */
app.post("/api/admin/add", isAdmin, (req, res) => {
    const db = getDB();

    // Tạo ID mới đảm bảo không trùng
    const maxID = db.products.reduce((m, p) => Math.max(m, p.id), 0);
    const newID = maxID + 1;

    const body = req.body;

    const newProduct = {
        id: newID,
        title: body.title,
        author: body.author,
        publisher: body.publisher || "",
        category: body.category,
        priceOld: Number(body.priceOld),
        priceNew: Number(body.priceNew),
        stock: Number(body.stock),
        description: body.description || "",
        image: "/images/" + (body.image || "biasach.jpg")
    };

    db.products.push(newProduct);
    saveDB(db);

    res.json({ success: true, product: newProduct });
});

/* ============================================================
   ADMIN: UPDATE PRODUCT (From ManageInventory.html)
============================================================ */
app.put("/api/admin/update/:id", isAdmin, (req, res) => {
    let db = getDB();
    const id = Number(req.params.id);

    const index = db.products.findIndex(p => p.id === id);
    if (index === -1)
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    // Giữ lại ảnh cũ nếu admin không upload ảnh mới
    const oldImage = db.products[index].image.replace("/images/", "");

    const updated = {
        ...db.products[index],
        ...req.body,
        priceOld: Number(req.body.priceOld),
        priceNew: Number(req.body.priceNew),
        stock: Number(req.body.stock),
        image: "/images/" + (req.body.image || oldImage)
    };

    db.products[index] = updated;
    saveDB(db);

    res.json({ success: true, product: updated });
});

/* ============================================================
   ADMIN: DELETE PRODUCT
============================================================ */
app.delete("/api/admin/delete/:id", isAdmin, (req, res) => {
    let db = getDB();
    const id = Number(req.params.id);

    db.products = db.products.filter(p => p.id !== id);
    saveDB(db);

    res.json({ success: true });
});
/* ============================================================
   ADMIN: VIEW ALL ORDERS (for manageOrderAdmin.html)
============================================================ */
app.get("/api/admin/orders", isAdmin, (req, res) => {
    const users = getUsers();
    const db = getDB();

    let allOrders = [];

    users.forEach(user => {
        if (user.orders && user.orders.length > 0) {
            user.orders.forEach(order => {
                // Map product titles to each item
                const items = order.items.map(it => {
                    const p = db.products.find(x => x.id === it.id);
                    return {
                        ...it,
                        title: p?.title || "Unknown Product",
                        price: it.price || p?.priceNew || 0,
                    };
                });

                allOrders.push({
                    email: user.email,
                    id: order.id,
                    date: order.date,
                    items: items,
                    total: order.total,
                    status: order.status
                });
            });
        }
    });

    // Sort by date (newest first)
    allOrders.sort((a, b) => {
        // Parse date string to Date object
        const da = new Date(a.date.split(',')[0]);
        const db_ = new Date(b.date.split(',')[0]);
        return db_ - da;
    });

    res.json(allOrders);
});

/* ============================================================
   ADMIN: UPDATE ORDER STATUS (manageOrderAdmin.html)
============================================================ */
app.post("/api/admin/orders/update", isAdmin, (req, res) => {
    const { orderId, newStatus } = req.body;

    let users = getUsers();
    let updated = false;

    users.forEach(u => {
        if (u.orders) {
            u.orders.forEach(o => {
                if (o.id === orderId) {
                    o.status = newStatus;
                    updated = true;
                }
            });
        }
    });

    if (!updated)
        return res.status(404).json({ message: "Order not found" });

    saveUsers(users);
    res.json({ success: true });
});

/* ============================================================
   CUSTOMER ORDER API
============================================================ */
app.get('/api/customer/orders', (req, res) => {
    if (!req.session.user) return res.status(401).json({ orders: [] });
    const users = getUsers();
    const user = users.find(u => u.email === req.session.user.email);
    res.json({ orders: user?.orders || [] });
});

app.post('/api/customer/orders/cancel', (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false, message: 'Not logged in' });
    const { orderId } = req.body;
    let users = getUsers();
    let userIdx = users.findIndex(u => u.email === req.session.user.email);
    if (userIdx === -1) return res.status(404).json({ success: false, message: 'User not found' });
    let orders = users[userIdx].orders || [];
    let order = orders.find(o => o.id === orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status === 'shipping') return res.json({ success: false, message: 'Order is shipping and cannot be canceled.' });
    if (order.status === 'canceled') return res.json({ success: false, message: 'Order already canceled.' });
    order.status = 'canceled';
    saveUsers(users);
    res.json({ success: true });
});

/* ============================================================
   PROTECT HOME PAGE
============================================================ */
app.get("/home", (req, res) => {
    if (!req.session.user)
        return res.redirect("/login.html");

    res.sendFile(path.join(__dirname, "public", "home.html"));
});



// ================= CHATBOT ChatGPT API =================
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
app.post("/api/chatbot", async (req, res) => {
    const { message } = req.body;

    console.log("Chatbot request:", message);

    if (!message) {
        return res.status(400).json({ error: "Missing message" });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Bạn là trợ lý của website bán sách HappyBook, trả lời ngắn gọn, lịch sự."
                },
                {
                    role: "user",
                    content: message
                }
            ],
        });

        const reply = completion.choices[0].message.content;

        res.json({ reply });

    } catch (err) {
        console.error("OpenAI ERROR:", err.message);
        res.status(500).json({
            error: "OpenAI API error",
            detail: err.message
        });
    }
});



/* ============================================================
   START SERVER
============================================================ */

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

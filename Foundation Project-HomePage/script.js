document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Lấy các phần tử cần thiết
    const wrapper = document.querySelector('.slide-wrapper');
    // Lưu ý: totalSlides bao gồm các bản sao
    const slides = document.querySelectorAll('.slide'); 
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    const totalSlides = slides.length; // Ví dụ: 5 (1 copy + 3 gốc + 1 copy)
    const numRealSlides = totalSlides - 2; // Ví dụ: 3
    
    // Bắt đầu từ index 1 (Vị trí của slide gốc đầu tiên)
    let slideIndex = 1; 
    const slideDuration = 4000; // 4 giây
    let autoSlideTimer; // Biến lưu trữ timer

    // Đặt vị trí ban đầu: Dịch sang trái 1 lần để hiển thị slide gốc đầu tiên
    wrapper.style.transform = `translateX(${-1 * (100 / totalSlides)}%)`;
    
    
    // --- 2. Hàm chuyển slide chính ---
    // 'smooth' = true: dùng transition; 'smooth' = false: nhảy tức thì
    function goToSlide(index, smooth = true) {
        
        // Bật/tắt hiệu ứng transition CSS
        wrapper.style.transition = smooth ? 'transform 0.8s ease-in-out' : 'none';
        
        slideIndex = index;
        
        // Tính toán độ dịch chuyển ngang
        const offset = -slideIndex * (100 / totalSlides);
        wrapper.style.transform = `translateX(${offset}%)`;

        // ----------------------------------------------------
        // LOGIC NHẢY MƯỢT (SEAMLESS LOOPING)
        // ----------------------------------------------------
        
        // Index 0 là Bản sao của slide cuối (ví dụ: Slide 3 copy)
        // Index cuối (totalSlides - 1) là Bản sao của slide đầu (ví dụ: Slide 1 copy)
        
        if (slideIndex === totalSlides - 1) {
            // Khi trượt đến bản sao cuối cùng (Slide 1 copy),
            // chờ hiệu ứng trượt mượt xong (800ms) thì nhảy về slide gốc đầu tiên (index 1)
            setTimeout(() => {
                goToSlide(1, false); 
            }, 800); 
        } else if (slideIndex === 0) {
            // Khi trượt đến bản sao đầu tiên (Slide 3 copy),
            // chờ hiệu ứng trượt mượt xong thì nhảy về slide gốc cuối cùng (index 3)
             setTimeout(() => {
                goToSlide(numRealSlides, false); 
            }, 800); 
        }
    }
    
    // --- 3. Hàm Tự động Chuyển Slide (Sử dụng setInterval) ---
    function startAutoSlide() {
        // Xóa timer cũ nếu có để tránh lỗi
        clearInterval(autoSlideTimer); 
        
        // Thiết lập timer mới để chuyển slide sau mỗi 4 giây
        autoSlideTimer = setInterval(() => {
            goToSlide(slideIndex + 1);
        }, slideDuration); 
    }
    
    // --- 4. Xử lý sự kiện (Nếu có nút bấm) ---
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // Dừng timer khi người dùng tương tác
            clearInterval(autoSlideTimer);
            goToSlide(slideIndex + 1);
            // Bắt đầu timer lại sau khi người dùng bấm
            startAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            // Dừng timer khi người dùng tương tác
            clearInterval(autoSlideTimer);
            goToSlide(slideIndex - 1);
            // Bắt đầu timer lại sau khi người dùng bấm
            startAutoSlide();
        });
    }

    // --- BẮT ĐẦU TỰ ĐỘNG CHUYỂN ĐỘNG KHI TRANG TẢI XONG ---
    startAutoSlide(); 
});
document.addEventListener('DOMContentLoaded', () => {
    
    // =====================================
    // LOGIC TAB SẢN PHẨM (MỚI NỔI BẬT / KHUYẾN MÃI)
    // =====================================
    
    const tabLinks = document.querySelectorAll('.product-tabs a');
    
    // Nếu bạn có logic ẩn/hiện lưới sản phẩm, cần thêm:
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Ngăn trình duyệt chuyển trang
            
            // 1. Lấy tên tab đích (được lưu trong thuộc tính data-tab của HTML)
            const targetTab = this.getAttribute('data-tab');

            // 2. Xóa class 'active' khỏi tất cả các liên kết tab
            tabLinks.forEach(l => l.classList.remove('active'));

            // 3. Đặt class 'active' cho tab vừa được click (để áp dụng CSS nổi bật)
            this.classList.add('active'); 
            
            
            // ----------------------------------------------------
            // LOGIC ẨN/HIỆN LƯỚI SẢN PHẨM (Nếu bạn muốn nội dung thay đổi)
            // ----------------------------------------------------
            if (tabPanes.length > 0) {
                // Xóa class 'active' khỏi tất cả các khối nội dung
                tabPanes.forEach(p => p.classList.remove('active'));

                // Hiển thị khối nội dung tương ứng
                const targetPane = document.getElementById(`tab-${targetTab}`);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            }
        });
    });
    
    
    // =====================================
    // CODE CAROUSEL (CẦN CÓ ĐỂ BANNER SLIDE)
    // =====================================
    
    const wrapper = document.querySelector('.slide-wrapper');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (wrapper && slides.length > 2) { // Kiểm tra nếu carousel tồn tại
        const totalSlides = slides.length; 
        const numRealSlides = totalSlides - 2; 

        let slideIndex = 1; 
        const slideDuration = 4000; 
        let autoSlideTimer; 

        // Đặt vị trí ban đầu
        wrapper.style.transform = `translateX(${-1 * (100 / totalSlides)}%)`;
        
        function goToSlide(index, smooth = true) {
            wrapper.style.transition = smooth ? 'transform 0.8s ease-in-out' : 'none';
            slideIndex = index;
            const offset = -slideIndex * (100 / totalSlides);
            wrapper.style.transform = `translateX(${offset}%)`;

            // Logic nhảy mượt
            if (slideIndex === totalSlides - 1) {
                setTimeout(() => { goToSlide(1, false); }, 800); 
            } else if (slideIndex === 0) {
                 setTimeout(() => { goToSlide(numRealSlides, false); }, 800); 
            }
        }
        
        function startAutoSlide() {
            clearInterval(autoSlideTimer);
            autoSlideTimer = setInterval(() => {
                goToSlide(slideIndex + 1);
            }, slideDuration); 
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => { clearInterval(autoSlideTimer); goToSlide(slideIndex + 1); startAutoSlide(); });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => { clearInterval(autoSlideTimer); goToSlide(slideIndex - 1); startAutoSlide(); });
        }

        startAutoSlide();
    }
});
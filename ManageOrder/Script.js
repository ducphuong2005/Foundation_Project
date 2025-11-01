// Đợi cho toàn bộ trang HTML tải xong rồi mới chạy code
document.addEventListener('DOMContentLoaded', function() {

    // 1. Tìm nút "Hủy Đơn Hàng" trong file HTML
    const cancelBtn = document.getElementById('cancel-btn');

    // Hàm để tạo và hiển thị form
    function showCancelForm() {
        // Tạo lớp phủ nền màu đen mờ
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        // Tạo khung chứa nội dung form
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Dùng innerHTML để tạo cấu trúc bên trong form cho nhanh
        modalContent.innerHTML = `
            <button class="close-btn">&times;</button>
            <h2>Lý do hủy đơn hàng</h2>
            <p>Vui lòng cho chúng tôi biết tại sao bạn muốn hủy đơn hàng này.</p>
            <form id="js-cancel-form" method="POST" action="#">
                <textarea id="js-cancel-reason" placeholder="Nhập lý do của bạn..." rows="5" required style="width: 100%;"></textarea>
                <button type="submit" class="btn btn-submit">Gửi Yêu Cầu Hủy</button>
            </form>
        `;

        // Gắn các phần tử vừa tạo vào trang web
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // --- Gắn sự kiện cho các nút trên form vừa tạo ---

        const closeModal = () => {
            document.body.removeChild(modalOverlay);
        };
        
        // Sự kiện đóng form khi nhấn nút 'x'
        modalContent.querySelector('.close-btn').addEventListener('click', closeModal);

        // Sự kiện đóng form khi nhấn ra ngoài
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });

        // Sự kiện khi người dùng nộp form
        modalContent.querySelector('#js-cancel-form').addEventListener('submit', function(event) {
            event.preventDefault();
            const reason = document.getElementById('js-cancel-reason').value;

            // Hiện hộp thoại xác nhận
            const isConfirmed = confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?");

            if (isConfirmed) {
                alert("Đã gửi yêu cầu hủy với lý do: " + reason);
                closeModal(); // Đóng form
                
                // Vô hiệu hóa nút hủy chính
                cancelBtn.disabled = true;
                cancelBtn.style.opacity = '0.6';
                cancelBtn.style.cursor = 'not-allowed';
            }
        });
    }

    // 2. Gán sự kiện: Khi người dùng nhấn vào nút "Hủy Đơn Hàng", gọi hàm showCancelForm
    cancelBtn.addEventListener('click', showCancelForm);
});
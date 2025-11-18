// === REVENUE CHART ===
const revCtx = document.getElementById('revenueChart').getContext('2d');
const gradientRev = revCtx.createLinearGradient(0, 0, 0, 400);
gradientRev.addColorStop(0, '#ff5f6d');
gradientRev.addColorStop(1, '#ffc371');

new Chart(revCtx, {
  type: 'bar',
  data: {
    labels: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    datasets: [{
      label: 'Revenue ($)',
      data: [15000, 12000, 22430, 13000, 19000, 22000, 17000],
      backgroundColor: gradientRev,
      borderRadius: 10,
      borderSkipped: false,
      hoverBackgroundColor: '#ff784e',
      barPercentage: 0.6, // Giảm độ rộng mỗi cột
      categoryPercentage: 0.8 // Giãn khoảng cách giữa các nhóm cột
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 20, bottom: 10, left: 10, right: 10 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (context) => {
            let value = context.parsed.y;
            return 'Revenue: $' + value.toLocaleString();
          }
        }
      },
      datalabels: {
        display: false // ẩn label mặc định (sẽ hiện qua tooltip khi hover)
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#555', font: { weight: '500' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          color: '#777',
          stepSize: 5000,
          callback: v => '$' + v.toLocaleString()
        }
      }
    },
    animation: { duration: 1000, easing: 'easeOutQuart' },
    hover: { mode: 'index', intersect: false }
  }
});


// === INCOME CHART (cột to, rõ, cân đối hơn) ===
const incomeCtx = document.getElementById('incomeChart').getContext('2d');

// Gradient cho Profit
const gradientProfit = incomeCtx.createLinearGradient(0, 0, 0, 400);
gradientProfit.addColorStop(0, '#ff512f');
gradientProfit.addColorStop(1, '#f09819');

new Chart(incomeCtx, {
  type: 'bar',
  data: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'],
    datasets: [
      {
        label: 'Profit',
        data: [25000, 30000, 40000, 38000, 42000, 45000, 47000, 50000],
        backgroundColor: gradientProfit,
        borderRadius: 10,
        borderSkipped: false,
        barPercentage: 0.9,       // 👈 to hơn (mặc định 0.7)
        categoryPercentage: 0.7   // 👈 giãn vừa phải giữa nhóm cột
      },
      {
        label: 'Loss',
        data: [5000, 7000, 10000, 8000, 12000, 15000, 10000, 9000],
        backgroundColor: '#111',
        borderRadius: 10,
        borderSkipped: false,
        barPercentage: 0.9,
        categoryPercentage: 0.7
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 20, bottom: 10, left: 10, right: 10 } },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#333', font: { weight: '600' } }
      },
      tooltip: {
        backgroundColor: '#222',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label;
            let value = context.parsed.y;
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#555', font: { weight: '500', size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          color: '#777',
          callback: v => '$' + v.toLocaleString()
        }
      }
    },
    animation: { duration: 1000, easing: 'easeOutQuart' }
  }
});



// 🧾 Enhanced Recent Orders with Animation
const orders = [
  {id:'#879001', date:'5 Dec 2026', customer:'Sophia Nguyen', category:'Jacket, Jeans', status:'Completed', items:2, total:'$1,120.00'},
  {id:'#879002', date:'4 Dec 2026', customer:'Liam Tran', category:'T-shirt, Shorts', status:'Pending', items:4, total:'$690.00'},
  {id:'#879003', date:'3 Dec 2026', customer:'Olivia Pham', category:'Sneakers, Cap', status:'Completed', items:3, total:'$890.00'},
  {id:'#879004', date:'2 Dec 2026', customer:'Ethan Le', category:'Suit, Tie', status:'Pending', items:1, total:'$540.00'},
  {id:'#879005', date:'1 Dec 2026', customer:'Ava Do', category:'Dress, Bag', status:'Completed', items:2, total:'$1,020.00'},
  {id:'#879006', date:'29 Nov 2026', customer:'Noah Vo', category:'Shoes, Shirt', status:'Pending', items:3, total:'$780.00'},
  {id:'#879005', date:'1 Dec 2026', customer:'Ava Do', category:'Dress, Bag', status:'Completed', items:2, total:'$1,020.00'},
  {id:'#879005', date:'1 Dec 2026', customer:'Ava Do', category:'Dress, Bag', status:'Completed', items:2, total:'$1,020.00'},
  {id:'#879005', date:'1 Dec 2026', customer:'Ava Do', category:'Dress, Bag', status:'Completed', items:2, total:'$1,020.00'},
  {id:'#879005', date:'1 Dec 2026', customer:'Ava Do', category:'Dress, Bag', status:'Completed', items:2, total:'$1,020.00'}

];

const orderTable = document.getElementById('orderTable');
orderTable.innerHTML = ''; // reset table

orders.forEach((o, i) => {
  const row = document.createElement('tr');
  row.classList.add('fade-in');
  row.style.animationDelay = `${i * 0.1}s`; // stagger animation
  
  row.innerHTML = `
    <td>${o.id}</td>
    <td>${o.date}</td>
    <td>${o.customer}</td>
    <td>${o.category}</td>
    <td><span class="status ${o.status.toLowerCase()}">${o.status}</span></td>
    <td>${o.items} items</td>
    <td><strong>${o.total}</strong></td>
  `;
  orderTable.appendChild(row);
});

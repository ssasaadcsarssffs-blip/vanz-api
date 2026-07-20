document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link");
    const tabContents = document.querySelectorAll(".tab-content");

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            
            navLinks.forEach(item => item.classList.remove("active"));
            link.classList.add("active");

            const targetTab = link.getAttribute("data-target");

            tabContents.forEach(content => {
                if (content.id === targetTab) {
                    content.classList.add("active");
                } else {
                    content.classList.remove("active");
                }
            });

            // Jika pindah ke tab Endpoints secara manual dari Navbar, tampilkan semua tanpa filter
            if(targetTab === 'endpoints') {
                document.querySelectorAll('.endpoint-group').forEach(group => {
                    group.style.display = 'block';
                });
            }
        });
    });
});

// Fungsi Switch Halaman Utama
function switchTab(tabId) {
    const targetLink = document.querySelector(`.nav-link[data-target="${tabId}"]`);
    if (targetLink) {
        targetLink.click();
    }
}

// Fungsi Kategori Terhubung Otomatis ke Halaman Endpoints
function openCategory(categoryName) {
    // 1. Pindah Halaman ke tab Endpoints terlebih dahulu
    switchTab('endpoints');
    
    // 2. Filter isi endpoint berdasarkan kategori yang dipilih
    const groups = document.querySelectorAll('.endpoint-group');
    groups.forEach(group => {
        if (group.getAttribute('data-category') === categoryName) {
            group.style.display = 'block'; // Tampilkan yang cocok
        } else {
            group.style.display = 'none';  // Sembunyikan kategori lain
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link");
    const tabContents = document.querySelectorAll(".tab-content");

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Hapus kelas active dari semua link menu
            navLinks.forEach(item => item.classList.remove("active"));
            // Tambahkan kelas active ke menu yang baru saja diklik
            link.classList.add("active");

            // Ambil ID target section dari atribut data-target
            const targetTab = link.getAttribute("data-target");

            // Sembunyikan semua section dan tampilkan yang sesuai target
            tabContents.forEach(content => {
                if (content.id === targetTab) {
                    content.classList.add("active");
                } else {
                    content.classList.remove("active");
                }
            });
        });
    });
});

// Fungsi bantuan untuk perpindahan via tombol di dalam konten (seperti tombol 'Mulai Sekarang')
function switchTab(tabId) {
    const targetLink = document.querySelector(`.nav-link[data-target="${tabId}"]`);
    if (targetLink) {
        targetLink.click();
    }
}

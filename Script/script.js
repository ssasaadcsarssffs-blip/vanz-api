const DEPLOYED_BASE_URL = "https://vanz-api-one.vercel.app";

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

            if(targetTab === 'endpoints') {
                document.querySelectorAll('.endpoint-group').forEach(group => {
                    group.style.display = 'block';
                });
            }
        });
    });

    const testInputs = document.querySelectorAll(".api-test-input");
    testInputs.forEach(input => {
        input.addEventListener("input", (e) => {
            const card = e.target.closest(".api-card");
            updateUrlBox(card);
        });
    });
});

function switchTab(tabId) {
    const targetLink = document.querySelector(`.nav-link[data-target="${tabId}"]`);
    if (targetLink) {
        targetLink.click();
    }
}

function openCategory(categoryName) {
    switchTab('endpoints');
    const groups = document.querySelectorAll('.endpoint-group');
    groups.forEach(group => {
        if (group.getAttribute('data-category') === categoryName) {
            group.style.display = 'block';
        } else {
            group.style.display = 'none';
        }
    });
}

function updateUrlBox(cardElement) {
    const basePath = cardElement.getAttribute("data-base-path");
    const paramName = cardElement.getAttribute("data-param-name");
    const inputValue = cardElement.querySelector(".api-test-input").value;
    const urlDisplay = cardElement.querySelector(".url-text-display");

    const encodedValue = encodeURIComponent(inputValue);
    const builtUrl = `${DEPLOYED_BASE_URL}${basePath}?${paramName}=${encodedValue}`;
    urlDisplay.textContent = builtUrl;
}

function testRequest(buttonElement) {
    const card = buttonElement.closest(".api-card");
    updateUrlBox(card);
    const generatedUrl = card.querySelector(".url-text-display").textContent;
    window.open(generatedUrl, '_blank');
}

function copyUrlFromBox(buttonElement) {
    const box = buttonElement.closest(".api-url-preview-box");
    const textToCopy = box.querySelector(".url-text-display").textContent;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const icon = buttonElement.querySelector("i");
        icon.className = "fas fa-check";
        icon.style.color = "#22c55e";
        
        setTimeout(() => {
            icon.className = "far fa-copy";
            icon.style.color = "";
        }, 1500);
    }).catch(err => {
        console.error("Gagal menyalin text: ", err);
    });
}

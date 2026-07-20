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

function handleFileUpload(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    const card = fileInput.closest(".api-card");
    const urlInput = card.querySelector('.multi-param[data-param="ppurl"]');
    const reader = new FileReader();

    reader.onload = function (e) {
        urlInput.value = e.target.result;
        updateUrlBox(card);
    };
    reader.readAsDataURL(file);
}

function updateUrlBox(cardElement) {
    const basePath = cardElement.getAttribute("data-base-path");
    const type = cardElement.getAttribute("data-type");
    const urlDisplay = cardElement.querySelector(".url-text-display");
    
    let builtUrl = `${DEPLOYED_BASE_URL}${basePath}`;

    if (type === "multi") {
        const params = [];
        const inputs = cardElement.querySelectorAll(".multi-param");
        inputs.forEach(input => {
            const key = input.getAttribute("data-param");
            const val = input.value;
            params.push(`${key}=${encodeURIComponent(val)}`);
        });
        if (params.length > 0) {
            builtUrl += `?${params.join("&")}`;
        }
    } else {
        const paramName = cardElement.getAttribute("data-param-name");
        const inputValue = cardElement.querySelector(".api-test-input").value;
        builtUrl += `?${paramName}=${encodeURIComponent(inputValue)}`;
    }

    urlDisplay.textContent = builtUrl;
}

function testRequest(buttonElement) {
    const card = buttonElement.closest(".api-card");
    updateUrlBox(card);
    
    const generatedUrl = card.querySelector(".url-text-display").textContent;
    const resultBox = card.querySelector(".api-result-box");
    const jsonOutput = card.querySelector(".json-output");
    const imgContainer = card.querySelector(".image-output-container");
    const imgOutput = card.querySelector(".image-output");
    
    let icon = buttonElement.querySelector("i");
    let isMultiButton = false;
    if (!icon) {
        icon = buttonElement;
        isMultiButton = true;
    }
    
    const originalText = buttonElement.innerHTML;
    if (isMultiButton) {
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GENERATING...';
    } else {
        icon.className = "fas fa-spinner fa-spin";
    }

    resultBox.style.display = "block";
    const responseType = card.getAttribute("data-response-type");

    if (responseType === "image") {
        jsonOutput.style.display = "none";
        imgContainer.style.display = "block";
        
        imgOutput.src = generatedUrl;
        imgOutput.onload = () => {
            if (isMultiButton) buttonElement.innerHTML = originalText;
            else icon.className = "fas fa-paper-plane";
        };
        imgOutput.onerror = () => {
            imgContainer.style.display = "none";
            jsonOutput.style.display = "block";
            jsonOutput.textContent = JSON.stringify({ error: "Failed to load image from API" }, null, 4);
            if (isMultiButton) buttonElement.innerHTML = originalText;
            else icon.className = "fas fa-paper-plane";
        };
    } else {
        imgContainer.style.display = "none";
        jsonOutput.style.display = "block";
        jsonOutput.textContent = "Loading response...";
        
        fetch(generatedUrl)
            .then(response => response.json())
            .then(data => {
                jsonOutput.textContent = JSON.stringify(data, null, 4);
                if (isMultiButton) buttonElement.innerHTML = originalText;
                else icon.className = "fas fa-paper-plane";
            })
            .catch(error => {
                jsonOutput.textContent = JSON.stringify({ error: "Failed to fetch data", message: error.message }, null, 4);
                if (isMultiButton) buttonElement.innerHTML = originalText;
                else icon.className = "fas fa-paper-plane";
            });
    }
}

function clearResult(buttonElement) {
    const resultBox = buttonElement.closest(".api-result-box");
    const jsonOutput = resultBox.querySelector(".json-output");
    const imgContainer = resultBox.querySelector(".image-output-container");
    const imgOutput = resultBox.querySelector(".image-output");
    
    if (jsonOutput) jsonOutput.textContent = "";
    if (imgOutput) imgOutput.src = "";
    if (imgContainer) imgContainer.style.display = "none";
    
    resultBox.style.display = "none";
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

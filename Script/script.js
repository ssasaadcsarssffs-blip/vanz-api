document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link[data-target]');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(targetId) {
        navLinks.forEach(link => {
            if (link.getAttribute('data-target') === targetId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        tabContents.forEach(content => {
            if (content.id === targetId) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            switchTab(target);
        });
    });

    window.switchTab = switchTab;

    window.openCategory = function(categoryName) {
        switchTab('endpoints');

        const groups = document.querySelectorAll('.endpoint-group');
        groups.forEach(group => {
            if (group.getAttribute('data-category') === categoryName) {
                group.style.display = 'block';
            } else {
                group.style.display = 'none';
            }
        });
    };

    const apiCards = document.querySelectorAll('.api-card');
    apiCards.forEach(card => {
        const inputs = card.querySelectorAll('.api-test-input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                updateUrlPreview(card);
            });
        });
        updateUrlPreview(card);
    });
});

function updateUrlPreview(card) {
    const basePath = card.getAttribute('data-base-path');
    const type = card.getAttribute('data-type');
    const displaySpan = card.querySelector('.url-text-display');
    const domain = 'https://vanz-api-one.vercel.app';

    let finalUrl = domain + basePath;

    if (type === 'single') {
        const paramName = card.getAttribute('data-param-name') || 'prompt';
        const inputVal = card.querySelector('.api-test-input').value.trim();
        if (inputVal) {
            finalUrl += `?${paramName}=${encodeURIComponent(inputVal)}`;
        }
    } else if (type === 'multi') {
        const inputs = card.querySelectorAll('.multi-param');
        const params = [];
        inputs.forEach(input => {
            const pName = input.getAttribute('data-param');
            const pVal = input.value.trim();
            if (pName && pVal) {
                params.push(`${pName}=${encodeURIComponent(pVal)}`);
            }
        });
        if (params.length > 0) {
            finalUrl += '?' + params.join('&');
        }
    }

    if (displaySpan) {
        displaySpan.textContent = finalUrl;
    }
    return finalUrl;
}

async function testRequest(element) {
    const card = element.closest('.api-card');
    const resultBox = card.querySelector('.api-result-box');
    const jsonOutput = card.querySelector('.json-output');
    const imgContainer = card.querySelector('.image-output-container');
    const imgOutput = card.querySelector('.image-output');
    const responseType = card.getAttribute('data-response-type');

    const reqUrl = updateUrlPreview(card);

    resultBox.style.display = 'block';
    jsonOutput.textContent = 'Loading...';
    imgContainer.style.display = 'none';
    imgOutput.src = '';

    try {
        const res = await fetch(reqUrl);

        if (!res.ok) {
            let message = `HTTP ${res.status}`;
            try {
                const err = await res.json();
                message = err.message || err.error || message;
            } catch {}
            throw new Error(message);
        }

        if (responseType === 'image') {
            const contentType = res.headers.get('content-type') || '';

            if (contentType.startsWith('image/')) {
                const blob = await res.blob();
                const imageUrl = URL.createObjectURL(blob);

                jsonOutput.textContent = JSON.stringify({
                    status: true,
                    creator: "Vanz API",
                    contentType
                }, null, 2);

                imgOutput.src = imageUrl;
                imgContainer.style.display = 'block';
            } else {
                const data = await res.json();
                jsonOutput.textContent = JSON.stringify(data, null, 2);

                if (data.result) {
                    imgOutput.src = data.result;
                    imgContainer.style.display = 'block';
                }
            }
        } else {
            const data = await res.json();
            jsonOutput.textContent = JSON.stringify(data, null, 2);
        }

    } catch (err) {
        jsonOutput.textContent = JSON.stringify({
            status: false,
            error: "Failed to fetch data",
            message: err.message
        }, null, 2);
    }
}

function copyUrlFromBox(btn) {
    const box = btn.closest('.api-url-preview-box');
    const urlText = box.querySelector('.url-text-display').textContent;

    navigator.clipboard.writeText(urlText).then(() => {
        const icon = btn.querySelector('i');
        icon.className = 'fas fa-check';
        icon.style.color = '#10b981';

        setTimeout(() => {
            icon.className = 'far fa-copy';
            icon.style.color = '';
        }, 2000);
    });
}

function clearResult(btn) {
    const resultBox = btn.closest('.api-result-box');
    const jsonOutput = resultBox.querySelector('.json-output');
    const imgContainer = resultBox.querySelector('.image-output-container');
    const imgOutput = resultBox.querySelector('.image-output');

    jsonOutput.textContent = '';
    if (imgOutput) imgOutput.src = '';
    if (imgContainer) imgContainer.style.display = 'none';
    resultBox.style.display = 'none';
}

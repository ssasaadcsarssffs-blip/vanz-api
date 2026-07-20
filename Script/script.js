const navLinks = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = link.getAttribute('data-target');
        switchTab(targetTab);
    });
});

function switchTab(tabId) {
    navLinks.forEach(l => l.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    const activeLink = document.querySelector(`.nav-link[data-target="${tabId}"]`);
    if (activeLink) activeLink.classList.add('active');

    const activeContent = document.getElementById(tabId);
    if (activeContent) activeContent.classList.add('active');
}

function openCategory(catId) {
    switchTab('endpoints');
    const groups = document.querySelectorAll('.endpoint-group');
    groups.forEach(g => {
        if (g.getAttribute('data-category') === catId) {
            g.style.display = 'block';
        } else {
            g.style.display = 'none';
        }
    });
}

function clearResult(btn) {
    const resultBox = btn.closest('.api-result-box');
    const jsonOutput = resultBox.querySelector('.json-output');
    const imgContainer = resultBox.querySelector('.image-output-container');
    const imgOutput = resultBox.querySelector('.image-output');

    jsonOutput.textContent = '';
    imgOutput.src = '';
    imgContainer.style.display = 'none';
    resultBox.style.display = 'none';
}

function copyUrlFromBox(btn) {
    const previewBox = btn.closest('.api-url-preview-box');
    const urlText = previewBox.querySelector('.url-text-display').textContent;
    navigator.clipboard.writeText(urlText).then(() => {
        const icon = btn.querySelector('i');
        icon.className = 'fas fa-check';
        setTimeout(() => { icon.className = 'far fa-copy'; }, 2000);
    });
}

function updateUrlPreview(card) {
    const basePath = card.getAttribute('data-base-path');
    const type = card.getAttribute('data-type');
    const previewText = card.querySelector('.url-text-display');
    const host = "https://vanz-api-one.vercel.app";
    let url = host + basePath;

    if (type === 'single') {
        const paramName = card.getAttribute('data-param-name');
        const inputEl = card.querySelector('.api-test-input');
        if (inputEl) {
            url += `?${paramName}=${encodeURIComponent(inputEl.value)}`;
        }
    } else if (type === 'multi') {
        const inputs = card.querySelectorAll('.multi-param');
        let parts = [];
        inputs.forEach(inp => {
            parts.push(`${inp.getAttribute('data-param')}=${encodeURIComponent(inp.value)}`);
        });
        if (parts.length > 0) url += '?' + parts.join('&');
    }

    if (previewText) {
        previewText.textContent = url;
    }
    return url;
}

document.querySelectorAll('.api-test-input').forEach(input => {
    input.addEventListener('input', () => {
        const card = input.closest('.api-card');
        updateUrlPreview(card);
    });
});

async function testRequest(element) {
    const card = element.closest('.api-card');
    const resultBox = card.querySelector('.api-result-box');
    const jsonOutput = card.querySelector('.json-output');
    const imgContainer = card.querySelector('.image-output-container');
    const imgOutput = card.querySelector('.image-output');
    const responseType = card.getAttribute('data-response-type');

    let reqUrl = updateUrlPreview(card);

    resultBox.style.display = 'block';
    jsonOutput.textContent = 'Loading...';
    imgContainer.style.display = 'none';

    try {
        if (responseType === 'image') {
            reqUrl += (reqUrl.includes('?') ? '&' : '?') + 'response=json';
            
            const res = await fetch(reqUrl);
            const data = await res.json();

            if (data.status && data.result) {
                jsonOutput.textContent = JSON.stringify({ status: data.status, creator: data.creator }, null, 2);
                imgOutput.src = data.result;
                imgContainer.style.display = 'block';
            } else {
                jsonOutput.textContent = JSON.stringify(data, null, 2);
            }
        } else {
            const res = await fetch(reqUrl);
            const data = await res.json();
            jsonOutput.textContent = JSON.stringify(data, null, 2);
        }
    } catch (err) {
        jsonOutput.textContent = JSON.stringify({ error: "Failed to fetch data", message: err.message }, null, 2);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');

    const initialPath = window.location.pathname.replace('/', '') || 'home';
    switchTab(initialPath, false);

    function switchTab(targetId, pushState = true) {
        if (!targetId) return;

        if (targetId === 'docs') {
            targetId = 'documentation';
        }

        const validTabs = ['home', 'dashboard', 'documentation', 'endpoints', 'status', 'changelog', 'contact'];
        if (!validTabs.includes(targetId)) {
            targetId = 'home';
        }

        navLinks.forEach(link => {
            const target = link.getAttribute('data-target') || link.getAttribute('href')?.replace('#', '');
            if (target === targetId || (target === 'documentation' && targetId === 'docs')) {
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

        if (pushState) {
            const newPath = targetId === 'home' ? '/' : `/${targetId}`;
            history.pushState({ tab: targetId }, '', newPath);
        }

        if (targetId === 'dashboard') {
            loadDashboardData();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target') || link.getAttribute('href')?.replace('#', '');
            switchTab(target, true);
        });
    });

    window.addEventListener('popstate', () => {
        const currentPath = window.location.pathname.replace('/', '') || 'home';
        switchTab(currentPath, false);
    });

    window.switchTab = switchTab;

    window.openCategory = function(categoryName) {
        switchTab('endpoints', true);

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

    loadDashboardData();

    let isScrolling = false;

    window.addEventListener('wheel', (e) => {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === 'home' && e.deltaY > 0 && !isScrolling) {
            isScrolling = true;
            switchTab('documentation', true);
            setTimeout(() => {
                isScrolling = false;
            }, 800);
        }
    });

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        const activeTab = document.querySelector('.tab-content.active');
        const touchEndY = e.changedTouches[0].clientY;
        if (activeTab && activeTab.id === 'home' && (touchStartY - touchEndY > 50) && !isScrolling) {
            isScrolling = true;
            switchTab('documentation', true);
            setTimeout(() => {
                isScrolling = false;
            }, 800);
        }
    }, { passive: true });
});

function updateUrlPreview(card) {
    if (!card) return '';
    const basePath = card.getAttribute('data-base-path') || '';
    const type = card.getAttribute('data-type') || 'single';
    const displaySpan = card.querySelector('.url-text-display');
    const domain = window.location.origin;

    let finalUrl = domain + basePath;

    if (type === 'single') {
        const paramName = card.getAttribute('data-param-name') || 'prompt';
        const inputElem = card.querySelector('.api-test-input');
        const inputVal = inputElem ? inputElem.value.trim() : '';
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

function incrementRequestCount() {
    let currentReqs = parseInt(localStorage.getItem('vanz_total_requests') || '0', 10);
    currentReqs += 1;
    localStorage.setItem('vanz_total_requests', currentReqs.toString());
}

async function testRequest(element) {
    incrementRequestCount();

    const card = element.closest('.api-card');
    if (!card) return;

    const resultBox = card.querySelector('.api-result-box');
    const jsonOutput = card.querySelector('.json-output');
    const imgContainer = card.querySelector('.image-output-container');
    const imgOutput = card.querySelector('.image-output');
    const responseType = card.getAttribute('data-response-type');

    const reqUrl = updateUrlPreview(card);

    if (resultBox) resultBox.style.display = 'block';
    if (jsonOutput) jsonOutput.textContent = 'Loading...';
    if (imgContainer) imgContainer.style.display = 'none';
    if (imgOutput) imgOutput.src = '';

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

                if (jsonOutput) {
                    jsonOutput.textContent = JSON.stringify({
                        status: true,
                        creator: "Vanz API",
                        contentType: contentType
                    }, null, 2);
                }

                if (imgOutput && imgContainer) {
                    imgOutput.src = imageUrl;
                    imgContainer.style.display = 'block';
                }
            } else {
                const data = await res.json();
                if (jsonOutput) jsonOutput.textContent = JSON.stringify(data, null, 2);

                if (data.result && imgOutput && imgContainer) {
                    imgOutput.src = data.result;
                    imgContainer.style.display = 'block';
                }
            }
        } else {
            const data = await res.json();
            if (jsonOutput) jsonOutput.textContent = JSON.stringify(data, null, 2);
        }

    } catch (err) {
        if (jsonOutput) {
            jsonOutput.textContent = JSON.stringify({
                status: false,
                error: "Failed to fetch data",
                message: err.message
            }, null, 2);
        }
    }
}

function copyUrlFromBox(btn) {
    const box = btn.closest('.api-url-preview-box');
    if (!box) return;

    const urlText = box.querySelector('.url-text-display')?.textContent || '';

    navigator.clipboard.writeText(urlText).then(() => {
        const icon = btn.querySelector('i');
        if (icon) {
            const oldClass = icon.className;
            icon.className = 'fas fa-check';
            icon.style.color = '#10b981';

            setTimeout(() => {
                icon.className = oldClass;
                icon.style.color = '';
            }, 2000);
        }
    });
}

function clearResult(btn) {
    const resultBox = btn.closest('.api-result-box');
    if (!resultBox) return;

    const jsonOutput = resultBox.querySelector('.json-output');
    const imgContainer = resultBox.querySelector('.image-output-container');
    const imgOutput = resultBox.querySelector('.image-output');

    if (jsonOutput) jsonOutput.textContent = '';
    if (imgOutput) imgOutput.src = '';
    if (imgContainer) imgContainer.style.display = 'none';
    resultBox.style.display = 'none';
}

async function loadDashboardData() {
    const totalReqElem = document.getElementById('dash-total-req');
    
    try {
        const res = await fetch('/api/stats');
        if (res.ok) {
            const data = await res.json();
            if (totalReqElem) totalReqElem.textContent = data.totalRequests || '0';
        } else {
            const localReq = localStorage.getItem('vanz_total_requests') || '0';
            if (totalReqElem) totalReqElem.textContent = localReq;
        }
    } catch (err) {
        const localReq = localStorage.getItem('vanz_total_requests') || '0';
        if (totalReqElem) totalReqElem.textContent = localReq;
    }

    const cards = document.querySelectorAll('.api-card');
    const totalEndpointsElem = document.getElementById('dash-total-endpoints');
    if (totalEndpointsElem) {
        totalEndpointsElem.textContent = cards.length;
    }

    fetchUserIp();
    fetchUserBattery();
}

async function fetchUserIp() {
    const ipElem = document.getElementById('dash-ip');
    if (!ipElem) return;

    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ipElem.textContent = data.ip;
    } catch {
        ipElem.textContent = 'Gagal memuat';
    }
}

function fetchUserBattery() {
    const batteryElem = document.getElementById('dash-battery');
    const batteryStatusElem = document.getElementById('dash-battery-status');
    if (!batteryElem) return;

    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            function updateBatteryInfo() {
                const level = Math.round(battery.level * 100);
                batteryElem.textContent = `${level}%`;
                if (batteryStatusElem) {
                    batteryStatusElem.textContent = battery.charging ? 'Sedang Diisi (Charging ⚡)' : 'Tidak Diisi (Discharging)';
                }
            }
            updateBatteryInfo();

            battery.addEventListener('levelchange', updateBatteryInfo);
            battery.addEventListener('chargingchange', updateBatteryInfo);
        });
    } else {
        batteryElem.textContent = 'N/A';
        if (batteryStatusElem) batteryStatusElem.textContent = 'Browser tidak mendukung Battery API';
    }
}

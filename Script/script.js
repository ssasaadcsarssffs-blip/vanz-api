document.addEventListener("DOMContentLoaded", () => {
    const apiCards = document.querySelectorAll(".api-card");

    apiCards.forEach(card => {
        const testButton = card.querySelector(".btn-test");
        
        if (testButton) {
            testButton.addEventListener("click", async () => {
                await executeApiTest(card);
            });
        }
    });
});

async function executeApiTest(cardElement) {
    const basePath = cardElement.getAttribute("data-base-path");
    const responseType = cardElement.getAttribute("data-response-type");
    const responseContainer = cardElement.querySelector(".response-result");
    const testButton = cardElement.querySelector(".btn-test");

    responseContainer.innerHTML = `
        <div class="flex flex-col items-center gap-2 text-gray-400">
            <svg class="animate-spin h-5 w-5 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Memproses aset gambar & canvas...</span>
        </div>
    `;
    testButton.disabled = true;
    testButton.style.opacity = "0.6";

    const inputs = cardElement.querySelectorAll("input");
    const params = new URLSearchParams();

    inputs.forEach(input => {
        if (input.name && input.value.trim() !== "") {
            params.append(input.name, input.value.trim());
        }
    });

    let finalUrl = `${basePath}?${params.toString()}`;

    try {
        if (responseType === "image") {
            finalUrl += "&response=json";

            const response = await fetch(finalUrl);
            const data = await response.json();

            if (data.status && data.result) {
                responseContainer.innerHTML = `
                    <div class="w-full flex flex-col items-center gap-3 py-2">
                        <img src="${data.result}" alt="Hasil Canvas API" 
                             class="rounded-lg shadow-2xl border border-gray-800 max-w-full h-auto transition duration-300 hover:scale-[1.02]" 
                             style="max-height: 290px;" />
                        <a href="${data.result}" target="_blank" class="text-[11px] text-teal-400 hover:underline flex items-center gap-1">
                            Buka gambar penuh di tab baru ↗
                        </a>
                    </div>
                `;
            } else {
                responseContainer.innerHTML = `<pre class="text-red-400 w-full">${JSON.stringify(data, null, 2)}</pre>`;
            }
        } else {
            const response = await fetch(finalUrl);
            const data = await response.json();
            responseContainer.innerHTML = `<pre class="text-green-400 w-full">${JSON.stringify(data, null, 2)}</pre>`;
        }

    } catch (error) {
        responseContainer.innerHTML = `
            <div class="text-red-500 font-bold p-2">
                [CLIENT FETCH ERROR]<br>
                <span class="text-xs font-normal text-gray-400">${error.message}</span>
            </div>
        `;
    } finally {
        testButton.disabled = false;
        testButton.style.opacity = "1";
    }
}

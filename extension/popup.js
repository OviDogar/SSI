document.addEventListener("DOMContentLoaded", function () {
    let checkButton = document.getElementById("checkButton");
    let proceedButton = document.getElementById("proceed");
    let safeProceedButton = document.getElementById("safeProceed");
    let countdownText = document.getElementById("countdown");
    let urlInput = document.getElementById("url");
	
    urlInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); 
            checkButton.click(); 
        }
    });	

    if (checkButton) {
        checkButton.addEventListener("click", function () {
            let url = urlInput.value.trim();
            
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }

            let domain = new URL(url).hostname; 

            chrome.storage.local.get(["whitelist"], function (data) {
                let whitelist = data.whitelist || [];
                
                if (whitelist.includes(domain)) {
                    showSafeMessage();
                    safeProceedButton.style.display = "inline-block";
                    safeProceedButton.addEventListener("click", function () {
                        navigateToSite(url);
                    });
                    return;
                }

                fetch("http://127.0.0.1:5000/check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ "url": url })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Server responded with status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.is_phishing) {
                        showWarningMessage();
                        
                        proceedButton.style.display = "inline-block";
                        let timeLeft = 5;
                        countdownText.innerHTML = `You can proceed in ${timeLeft}s`;

                        let countdown = setInterval(() => {
                            timeLeft -= 1;
                            countdownText.innerHTML = `You can proceed in ${timeLeft}s`;
                            if (timeLeft === 0) {
                                clearInterval(countdown);
                                proceedButton.disabled = false;
                                countdownText.innerHTML = "";
                            }
                        }, 1000);

                        proceedButton.addEventListener("click", function () {
                            addToWhitelist(domain);
                            navigateToSite(url);
                        });

                    } else {
                        showSafeMessage();
                        safeProceedButton.style.display = "inline-block";
                        safeProceedButton.addEventListener("click", function () {
                            navigateToSite(url);
                        });
                    }
                })
                .catch(error => {
                    console.error("Server error:", error);
                    showServerErrorMessage();

                    proceedButton.style.display = "inline-block";
                    proceedButton.disabled = false;
                    countdownText.innerHTML = "";
                    
                    proceedButton.addEventListener("click", function () {
                        navigateToSite(url);
                    });
                });
            });
        });
    }

    function navigateToSite(url) {
        if (!url || url.startsWith("chrome-extension://")) {
            console.error("Invalid URL, cannot navigate:", url);
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length === 0) {
                console.error("No active tab found.");
                return;
            }

            let activeTab = tabs[0];

            chrome.tabs.update(activeTab.id, { url: url }, function (tab) {
                if (chrome.runtime.lastError) {
                    console.error("Error updating tab:", chrome.runtime.lastError.message);
                }
            });

            window.close();
        });
    }

    function addToWhitelist(domain) {
        chrome.storage.local.get(["whitelist"], function (data) {
            let whitelist = data.whitelist || [];
            
            if (!whitelist.includes(domain)) {
                whitelist.push(domain);
                chrome.storage.local.set({ "whitelist": whitelist }, function () {
                    console.log(`Added ${domain} to whitelist.`);
                });
            }
        });
    }

    function showWarningMessage() {
        let result = document.getElementById("result");
        result.innerHTML = "WARNING: This site may be a phishing website!";
        result.style.color = "red";
    }

    function showSafeMessage() {
        let result = document.getElementById("result");
        result.innerHTML = "This site appears safe.";
        result.style.color = "green";
    }

    function showServerErrorMessage() {
        let result = document.getElementById("result");
        result.innerHTML = "Unable to check site. Proceed with caution.";
        result.style.color = "orange";
    }
});

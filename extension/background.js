chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete" || !tab.url) {
        return; 
    }

    try {
        let url = new URL(tab.url);
        let domain = url.hostname;

        if (tab.url.startsWith("chrome-extension://") || tab.url.startsWith("chrome://") || tab.url === "about:blank") {
            return;
        }

        chrome.storage.local.get(["whitelist"], function (data) {
            let whitelist = Array.isArray(data.whitelist) ? data.whitelist : [];

            if (whitelist.includes(domain)) {
                console.log(`Skipping phishing check for whitelisted site: ${domain}`);
                return;
            }

            fetch("http://127.0.0.1:5000/check", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "url": tab.url })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.is_phishing) {
                    let notificationId = `phishing-alert-${Date.now()}`;

                    chrome.notifications.create(notificationId, {
                        type: "basic",
                        iconUrl: "icon.png",
                        title: "⚠️ Phishing Alert!",
                        message: `${tab.url}\nmay be a phishing website!`,
                        buttons: [{ title: "Whitelist This Site" }],
                        priority: 2
                    });

                    chrome.storage.local.set({ "last_notification": { id: notificationId, domain: domain } });

                } else {
                    whitelist.push(domain);
                    chrome.storage.local.set({ "whitelist": whitelist }, function () {
                        console.log(`Added ${domain} to whitelist.`);
                    });
                }
            })
            .catch(error => {
                console.error("Fetch Error:", error);

                let notificationId = `server-error-${Date.now()}`;

                chrome.notifications.create(notificationId, {
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "⚠️ Server Unreachable",
                    message: `Could not check ${tab.url}. Server may be down.`,
                    buttons: [{ title: "Whitelist This Site" }],
                    priority: 1
                });

                chrome.storage.local.set({ "last_notification": { id: notificationId, domain: domain } });
            });

        });

    } catch (error) {
        console.error("Invalid URL Error:", error);
    }
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (buttonIndex === 0) {  
        chrome.storage.local.get(["last_notification"], function (data) {
            if (data.last_notification && data.last_notification.id === notificationId) {
                let domain = data.last_notification.domain;

                chrome.storage.local.get(["whitelist"], function (data) {
                    let whitelist = Array.isArray(data.whitelist) ? data.whitelist : [];
                    if (!whitelist.includes(domain)) {
                        whitelist.push(domain);
                        chrome.storage.local.set({ "whitelist": whitelist }, function () {
                            console.log(`User added ${domain} to whitelist from notification.`);
                        });
                    }
                });

                chrome.storage.local.remove("last_notification");
            }
        });

        chrome.notifications.clear(notificationId);
    }
});

# SSI  
Anti-Phishing Chrome Extension

---

## About

**SSI** (Safe Surfing Initiative) is a browser extension designed to **protect users from phishing attacks** by analyzing visited websites in real time. It helps prevent users from unknowingly entering sensitive information on malicious or spoofed pages.

The project is composed of two main parts:

- **Backend**: A Python-based Flask server that performs phishing detection using heuristics (URL similarity, domain age, form analysis, etc.)
- **Frontend**: A Chrome extension that interacts with the backend, analyzes websites as the user browses, and shows warnings or allows manual checks.

---

## Purpose

- Help users **identify potentially dangerous websites** before interacting with them.
- Automatically warn or block access to **phishing or suspicious URLs**.
- Allow users to **manually check and whitelist** sites they trust.
- Reduce unnecessary checks via a **local whitelist** and **safe-site caching**.

---

## Installation

### Backend (Python Flask Server)

1. **Install Python 3.9+** from [python.org](https://www.python.org/downloads/)
2. Clone this repository:
   ```bash
   git clone https://github.com/OviDogar/SSI.git
   cd ssi/server
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   or run install.bat
4. **Start the Flask server**:
   ```bash
   python server.py
   ```
   or run run.bat

📌 The server runs by default on: `http://127.0.0.1:5000`

---

### Frontend (Chrome Extension)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode** (top-right)
3. Click **"Load Unpacked"**
4. Select the `extension` folder from the repository

Your extension should now appear in the toolbar.

---

## How It Works

### Real-Time Auto Detection:
- On every page load, the extension sends the URL to the **local Flask server**.
- The server performs checks such as:
  - Suspicious keyword presence (`login`, `verify`, etc.)
  - URL similarity using Levenshtein distance
  - Domain age (via WHOIS)
  - Presence of suspicious login forms
- If the server flags the site:
  - The user receives a **notification warning**
  - The user can choose to **proceed anyway and whitelist the domain**

### Manual URL Scan:
- Click the extension icon
- Enter a URL manually and click **Scan**
- The result appears with a **Proceed Anyway** option (if flagged)

### Whitelisting:
- Safe sites are automatically added to a **local whitelist** to reduce future checks
- Users can **manually whitelist** flagged sites from the popup or via notification

---

## Requirements

- Python 3.9+
- Google Chrome (latest)
- OS: Windows, macOS, or Linux

---

## Technologies Used

- **Flask** (REST API server)
- **BeautifulSoup** (HTML form analysis)
- **tldextract** + **Levenshtein** (domain similarity)
- **whois** (domain registration info)
- **Chrome Extension APIs** (`tabs`, `notifications`, `storage`)

---

## Limitations & Future Improvements

- Currently works only with a **local server** (`localhost`)
- A public backend/API version could be added in the future
- Add **machine learning support** for smarter detection
- UI improvements + **whitelist manager page**
- Firefox version (via WebExtensions)

---

## Contact

Feel free to open issues or submit pull requests!

Made with ❤️ to protect you from shady websites.

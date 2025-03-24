from flask import Flask, request, jsonify
import requests
import tldextract
import Levenshtein
import whois
from bs4 import BeautifulSoup
from datetime import datetime

currentYear = datetime.now().year

app = Flask(__name__)

trustedDomains = ["google.com", "facebook.com", "paypal.com", "microsoft.com", "amazon.com", "ing.ro", "cargus.ro", "fancourier.ro", "olx.ro", "emag.ro", "bt.ro", "youtube.com"]
suspiciousKeywords = ["login", "verify", "secure", "update", "password", "account", "bank", "cont","parola","verifica"]

def checkUrl(url):
    extracted = tldextract.extract(url)
    domain = f"{extracted.domain}.{extracted.suffix}"
    print("Checking " + domain + "...")

    if domain in trustedDomains:
        return False

    for trustedDomain in trustedDomains:
        similarity = Levenshtein.distance(domain, trustedDomain)
        if similarity <= 2: 
            print("Levenshtein Distance")
            return True

    if any(keyword in url.lower() for keyword in suspiciousKeywords):
        print("Suspicious Keyword")
        return True

    try:
        domainInfo = whois.whois(domain)
        if domainInfo.creation_date:
            ageInYears = currentYear - domainInfo.creation_date.year
            if ageInYears < 1:  
                print("New Domain")
                return True
    except:
        pass  

    if not url.startswith("https://"):
        print("No HTTPS")
        return True  

    try:
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")
        forms = soup.find_all("form")
        for form in forms:
            action = form.get("action")
            if action and "login" in action.lower():
                print("Login Form")
                return True
    except:
        pass  

    return False  

@app.route("/check", methods=["POST"])
def checkPhishing():
    data = request.json
    url = data.get("url")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    isPhishing = checkUrl(url)
    return jsonify({"url": url, "is_phishing": isPhishing})

if __name__ == "__main__":
    app.run(debug=True)
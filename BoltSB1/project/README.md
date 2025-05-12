# TikTok PDF Scraper 🚀

This project automates downloading TikTok help articles (or any webpage) as PDFs at scale.

### ✅ Features
- Batch mode with progress bar
- Per-URL configuration (`urls.json`)
- Retry logic for failed downloads
- REST API wrapper for SaaS use
- Clean modular architecture

### 📦 Install
```
npm install
```

### 🚀 Run Batch
```
npm run scrape:batch
```

### 📡 Run API Server
```
npm run scrape:api
```

### 📬 API POST Endpoint
```
http://localhost:3000/download
```

Body:
```json
{
  "url": "https://example.com",
  "outputName": "example.pdf"
}
```

### ⚙️ Docker Commands
```
docker build -t tiktok-pdf-scraper .
docker run -p 3000:3000 tiktok-pdf-scraper
```

### ✅ CI/CD Pipeline
See `.github/workflows/node.js.yml`

### 💡 Contribute
PRs welcome! Let's make it world-class.
# 🇺🇸 US Address & High School Transcript Generator

Generate realistic US residential addresses with automatic high school matching and professional academic transcript PDF export.

生成真实格式的美国住宅地址，自动匹配学区高中，一键生成成绩单 PDF。

![Demo Screenshot](https://via.placeholder.com/800x400?text=US+Address+Transcript+Generator)

## ✨ Features

### 🏠 Residential Address Generation
- **Real addresses** via OpenStreetMap Nominatim API (no API key required!)
- **Strict residential filtering** - only returns actual houses/apartments
- Excludes: lakes, roads, parks, commercial buildings, schools, etc.
- Format: `1234 N 48th Ave, Phoenix, AZ 85001`

### 🏫 Smart School Matching
- **ZIP-code based matching** for geographical accuracy
- Priority: Exact ZIP → ZIP prefix → Same state → Random
- Database of ~1000+ US public high schools

### 📄 Professional Transcripts
- Academic years 2020-2030
- Course management with GPA calculation (weighted & unweighted)
- Credit tracking by subject area
- Principal signature support
- Emergency contact information

### 📥 PDF Export
- One-click professional PDF download
- School letterhead with optional logo
- Watermark support

## 🚀 Quick Start

### Local Development

```bash
# Option 1: Using npx serve
npx serve . -l 3000

# Option 2: Using Python
python -m http.server 8000

# Then open http://localhost:3000 or http://localhost:8000
```

### Deploy to Cloudflare Pages

1. Fork this repository
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Pages**
3. Create project → Connect to Git → Select your fork
4. Configure:
   - **Build command**: *(leave empty)*
   - **Build output directory**: `/`
5. Deploy!

> 💡 No API keys required! This project uses OpenStreetMap Nominatim (free, no registration).

## 📁 Project Structure

```
us-address-transcript-generator/
├── index.html                  # Main page
├── css/
│   └── style.css               # Styles (dark theme + glassmorphism)
├── js/
│   ├── app.js                  # Main application logic
│   ├── address-generator.js    # Fallback address generation
│   ├── address-validator.js    # OSM integration & residential filtering
│   ├── school-matcher.js       # ZIP-based school matching
│   ├── transcript.js           # Transcript generation
│   ├── pdf-export.js           # PDF export functionality
│   ├── config.js               # Configuration
│   └── theme.js                # Theme management
├── data/
│   ├── us-high-schools.json    # US public high school database
│   └── residential-streets.json # Real residential street data
└── README.md
```

## 📋 How to Use

1. **Select State** - Choose a US state or leave as "Random"
2. **Generate Address** - Click "✨ 生成地址信息" (Generate Address)
3. **View Matched School** - System automatically matches nearby high school by ZIP code
4. **Add Courses** - Select semester, enter course name, grade, credits, level
5. **Preview Transcript** - Real-time preview on the right panel
6. **Download PDF** - Click "Download PDF" to export

## 🔧 Technical Details

### Address Discovery Algorithm
1. Picks random coordinates within selected state
2. Uses OSM Nominatim reverse geocoding
3. Applies strict residential filter:
   - Must have house number
   - Must be `building` or `place:house` class
   - Excludes amenities, shops, offices, highways, water, parks, etc.
4. Retries up to 20 times to find valid residential address

### School Matching Algorithm
1. **Exact ZIP match** - Schools in the same ZIP code
2. **ZIP prefix match** - Schools in nearby areas (same first 3 digits)
3. **State fallback** - Any school in the same state
4. **Random fallback** - Any school in database

## ⚠️ Disclaimer

This tool is for **educational and testing purposes only**.

Generated addresses and transcripts are for demonstration purposes. Do not use for any illegal activities.

本工具仅供**教育和测试目的**使用。生成的地址和成绩单为演示数据，禁止用于任何非法活动。

## 🙏 Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) - Address data via Nominatim API
- [html2canvas](https://html2canvas.hertzen.com/) - PDF generation
- [jsPDF](https://github.com/parallax/jsPDF) - PDF export

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

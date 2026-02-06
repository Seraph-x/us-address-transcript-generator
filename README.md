# 🇺🇸 美国地址 & 高中成绩单生成器

生成真实格式的美国住宅地址，自动匹配学区高中，一键生成成绩单 PDF。

> 💡 **无需 API Key**：本项目使用 OpenStreetMap Nominatim（免费公开 API）

## 🚀 部署到 Cloudflare Pages

### 方法一：通过 Cloudflare Dashboard（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → **Create project** → **Connect to Git**
3. 选择此仓库：`zhweji0505/us-address-transcript-generator`
4. 配置（保持默认即可）：
   - **Framework preset**: `None`
   - **Build command**: *(留空)*
   - **Build output directory**: `/`
5. 点击 **Save and Deploy**

部署完成后会获得一个 `*.pages.dev` 的 URL。

### 方法二：Fork 后部署

1. Fork 本仓库到你的 GitHub
2. 按照方法一的步骤连接你 Fork 的仓库

## ✨ 功能特点

### 🏠 住宅地址生成
- 通过 OpenStreetMap Nominatim API 获取**真实地址**
- **严格住宅过滤** - 只返回真正的住宅/公寓
- 自动排除：湖泊、马路、公园、商业区、学校等
- 格式示例：`1234 N 48th Ave, Phoenix, AZ 85001`

### 🏫 智能学区匹配
- 基于 **ZIP 邮编** 的地理精准匹配
- 匹配优先级：精确 ZIP → ZIP 前缀 → 同州 → 随机
- 内置 1000+ 所美国公立高中数据

### 📄 专业成绩单
- 支持 2020-2030 学年
- 课程管理与 GPA 自动计算（加权 & 非加权）
- 学分分类统计
- 校长签名支持
- 紧急联系人信息

### 📥 PDF 导出
- 一键下载专业格式 PDF
- 支持学校 Logo 和水印

## 💻 本地运行

```bash
# 方法 1：使用 npx serve
npx serve . -l 3000

# 方法 2：使用 Python
python -m http.server 8000

# 然后打开 http://localhost:3000 或 http://localhost:8000
```

## 📁 项目结构

```
us-address-transcript-generator/
├── index.html                  # 主页面
├── css/
│   └── style.css               # 样式（深色主题 + 玻璃拟态）
├── js/
│   ├── app.js                  # 主应用逻辑
│   ├── address-generator.js    # 地址生成备用模块
│   ├── address-validator.js    # OSM 集成 & 住宅过滤
│   ├── school-matcher.js       # ZIP 学区匹配
│   ├── transcript.js           # 成绩单生成
│   └── pdf-export.js           # PDF 导出
├── data/
│   ├── us-high-schools.json    # 美国公立高中数据库
│   └── residential-streets.json # 住宅街道数据
└── README.md
```

## 📋 使用说明

1. **选择州** - 从下拉菜单选择美国州，或留空随机选择
2. **生成地址** - 点击「✨ 生成地址信息」按钮
3. **查看匹配学校** - 系统自动根据 ZIP 码匹配附近高中
4. **添加课程** - 选择学期、输入课程名、成绩、学分等
5. **预览成绩单** - 右侧实时显示成绩单预览
6. **下载 PDF** - 点击「Download PDF」导出成绩单

## ⚠️ 免责声明

本工具仅供**教育和测试目的**使用。

生成的地址和成绩单为演示数据，禁止用于任何非法活动。

## 🙏 致谢

本项目基于以下开源项目开发，特此感谢：

- [美国高中成绩单生成器](https://dkanqnkbs.pages.dev/) - 原始项目演示
- [chatgptuk/Real-US-Address-Generator](https://github.com/chatgptuk/Real-US-Address-Generator) - 真实美国地址生成器
- [OpenStreetMap](https://www.openstreetmap.org/) - 地址数据 API

## 📄 License

MIT License

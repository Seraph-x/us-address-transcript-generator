# 🇺🇸 美国地址 & 高中成绩单生成器

US Address & Transcript Generator

生成真实格式的美国地址，自动匹配附近公立高中，一键生成成绩单 PDF。

## ✨ 功能特点

- **地址生成** - 生成真实格式的美国地址（仅美国50州）
- **高中匹配** - 根据ZIP码自动匹配附近的美国公立高中
- **成绩单生成** - 学期范围 2020-2030，支持课程管理和GPA计算
- **PDF导出** - 一键下载专业格式的成绩单PDF
- **现代UI** - 深色主题 + 玻璃拟态设计

## 🚀 一键部署到 Cloudflare Pages

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR_USERNAME/us-address-transcript-generator)

### 手动部署步骤

1. Fork 本仓库到你的 GitHub 账户
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 进入 **Pages** > **Create a project** > **Connect to Git**
4. 选择你 fork 的仓库
5. 配置：
   - **Build command**: 留空（无需构建）
   - **Build output directory**: `/`（根目录）
6. 点击 **Save and Deploy**

部署完成后，你会获得一个 `*.pages.dev` 的URL。

## 💻 本地运行

```bash
# 方法1：使用 npx serve
npx serve .

# 方法2：使用 Python
python -m http.server 8000

# 方法3：直接打开
# 双击 index.html（部分功能可能受限）
```

## 📁 项目结构

```
us-address-transcript-generator/
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式文件
├── js/
│   ├── app.js              # 主应用逻辑
│   ├── address-generator.js # 地址生成模块
│   ├── school-matcher.js   # 高中匹配模块
│   ├── transcript.js       # 成绩单生成模块
│   └── pdf-export.js       # PDF 导出功能
├── data/
│   └── us-high-schools.json # 美国公立高中数据
└── README.md
```

## 📋 使用说明

1. **选择州** - 从下拉菜单选择美国州，或留空随机选择
2. **生成地址** - 点击"生成地址信息"按钮
3. **查看匹配学校** - 系统自动根据ZIP码匹配附近高中
4. **添加课程** - 选择学期、输入课程名、成绩、学分等
5. **预览成绩单** - 右侧实时显示成绩单预览
6. **下载PDF** - 点击"下载PDF"导出成绩单

## ⚠️ 免责声明

本工具仅供**教育和测试目的**使用。生成的地址和成绩单为虚拟数据，禁止用于任何非法活动。

This tool is for **educational and testing purposes only**. Generated addresses and transcripts are fictional data. Prohibited for illegal activities.

## 🙏 致谢 / Acknowledgments

本项目基于以下开源项目开发，特此感谢：

This project is based on the following open-source projects. Special thanks to:

- [Real US Address Generator](https://dkanqnkbs.pages.dev/) - 真实美国地址生成器
- [chatgptuk/Real-US-Address-Generator](https://github.com/chatgptuk/Real-US-Address-Generator) - GitHub 仓库

## 📄 License

MIT License

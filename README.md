# ToolBox 工具箱

一个集成常用开发、编码、格式转换、加密、文本处理、网络分析、图片与音视频等功能的**纯前端**浏览器工具箱。所有计算均在本地完成，无需上传到服务器。

## 主要特性

- **146+ 实用工具**，覆盖编码、格式化、加密、生成、Web、文本、网络、图片与多媒体等分类。
- **完整 CyberChef 引擎**（Web Worker）：495 个操作、配方编排、拖拽添加、本地持久化。
- **Emoji 选择器**内置 1,592 个 Unicode CLDR Emoji，支持中英文名称与关键词搜索。
- **中英双语**界面，浅色 / 深色 / 跟随系统主题。
- 工具搜索、键盘选择、最近使用、相关工具推荐。
- 大依赖（ffmpeg.wasm、Tesseract、sql.js、Excalidraw、Prettier、Emscripten WASM 等）**按需加载**，仅在打开对应工具时下载。

## 工具概览

| 分类 | 示例 |
| --- | --- |
| 编码转换 | Base64、URL、HTML 实体、Hex、二进制、Unicode、进制、JSFuck |
| 数据格式 | JSON / XML / YAML / TOML / CSV / SQL 格式化与互转，Markdown ⇄ HTML，JSON 转 Go |
| 密码与安全 | Hash、Magic Hash、HMAC、Bcrypt、AES、DES/3DES、RSA、TOTP、BIP39、JWT、htpasswd、XSS 向量、ZIP 爆破、MD5 碰撞 |
| 文本处理 | 正则、文本差异、大小写、Leet、中英文空格、行号、乱序、统计、ASCII Art、Emoji |
| 网络工具 | HTTP 头/状态码、IPv4/IPv6/CIDR、MAC/OUI、端口、User-Agent、WiFi 二维码 |
| 图片 | 圆角、去色、像素化、压缩、格式转换、水印、切图、OCR、取色、Base64、PNG 宽高修复 |
| 多媒体 | 视频/音频格式转换、视频转 GIF、抽帧、提取音频（ffmpeg.wasm / Web Audio） |
| 开发辅助 | SQLite 浏览、Hex 编辑器、文件魔数识别、Pyc 反编译/反汇编、文件树、LESS→CSS、代码格式化 |
| 其他 | UUID/ULID、二维码生成/解析、密码生成、时间转换、白板（Excalidraw）、图表、倒计时等 |

完整列表见应用首页分类与搜索。

## 本地运行

### 环境要求

- Node.js 20+
- npm 10+

### 安装与启动

```bash
git clone git@github.com:wsx68696/ToolBox.git
cd ToolBox
npm install
npm run dev
```

启动后按终端提示在浏览器中访问本地地址。

### 生产构建

```bash
npm run build
npm run preview
```

构建产物位于 `dist/` 目录。静态部署时请确保 `public/wasm/` 下的 WASM 资源一并发布（SQLite、pycdc/pycdas、fastcoll 等）。

> **ffmpeg 相关工具**：开发 / 预览服务器已配置 COOP/COEP 头。首次使用会从 CDN 拉取约 25 MB 的 ffmpeg 单线程核心并缓存。

## 技术栈

- React 19 · TypeScript · Vite 6 · Tailwind CSS 4
- React Router · i18next · Lucide React
- 按需：ffmpeg.wasm、Tesseract.js、sql.js、Excalidraw、Prettier、ECharts、crypto-js 等

## 数据与隐私

- 主要计算在浏览器本地执行，默认**不上传**用户文件或文本。
- 主题、语言、最近使用、CyberChef 收藏与配方等状态保存在浏览器 `localStorage`。
- 部分工具（如 OCR 语言模型、ffmpeg 核心）会从公共 CDN 按需下载资源到本机缓存。

## 参考与致谢

本项目在功能设计与部分算法实现上参考了 [chaitin/xtools](https://github.com/chaitin/xtools)（长亭百川云在线工具库），该项目以 **MIT License** 发布：

```
MIT License
Copyright (c) 2024 Chaitin Tech
```

本仓库中移植或改写的逻辑、以及从该项目取得的 Emscripten WASM 资源（如 pycdc / pycdas / fastcoll 等），均遵循其 MIT 许可；使用时请保留相应版权与许可声明。CyberChef 引擎及其它第三方依赖另见各自许可证。

## 开源许可

本项目使用 [MIT License](./LICENSE)。

```
MIT License
Copyright (c) 2026 wsx68696
```

你可以将本软件自由地使用、复制、修改、合并、发布、再许可和/或销售，但须在所有副本或重要部分中保留上述版权声明与本许可声明。软件按「现状」提供，不附带任何明示或暗示的担保。

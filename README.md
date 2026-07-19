# ToolBox 工具箱

一个集成常用开发、编码、格式转换、加密、文本处理和网络分析功能的浏览器工具箱。

## 主要特性

- 包含 85 个实用工具，覆盖编码、格式化、加密、生成、Web、文本和网络等分类。
- 集成完整 CyberChef 引擎，提供 495 个操作、配方编排、收藏和本地持久化。
- Emoji 选择器内置 1,592 个 Unicode CLDR Emoji，支持中英文名称和关键词搜索。
- 支持中文与英文界面、浅色、深色及跟随系统主题。
- 支持工具搜索、键盘选择、最近使用和相关工具推荐。
- 主要数据处理均在浏览器中完成，无需上传到服务器。

## 工具示例

- 编码与转换：Base64、URL、HTML 实体、二进制、Unicode、进制转换。
- 数据格式：JSON、XML、YAML、TOML、CSV、SQL 格式化及互转。
- 密码与安全：Hash、HMAC、Bcrypt、AES、RSA、TOTP、BIP39、JWT。
- 文本处理：正则表达式、文本差异、大小写转换、列表处理、Emoji、ASCII Art。
- 网络工具：IPv4/IPv6、CIDR、MAC 地址、OUI 厂商查询、端口和 WiFi 二维码。
- 其他工具：UUID/ULID、二维码、密码生成、时间转换、摄像头录制、PDF 签名检查。

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

## 生产构建

```bash
npm run build
npm run preview
```

构建产物位于 `dist/` 目录。

## 技术栈

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- React Router
- i18next
- Lucide React

## 数据与隐私

工具的主要计算在浏览器本地执行。主题、语言、最近使用工具、CyberChef 收藏及配方等状态会保存在浏览器 `localStorage` 中。

## 开源许可

本项目使用 [MIT License](./LICENSE)。


# 跳动爱心星空动画 (Beating Heart with Starry Night)

这是一个基于 React 19 + Vite + Canvas 开发的数学艺术动画。

## 🚀 部署到 Vercel (GitHub 同步)

### 第一步：上传到 GitHub
1. 在 GitHub 上创建一个新的公开/私有仓库。
2. 在本地项目根目录运行：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <你的GitHub仓库地址>
   git push -u origin main
   ```

### 第二步：连接到 Vercel
1. 登录 [Vercel 官网](https://vercel.com/)。
2. 点击 **"Add New" -> "Project"**。
3. 导入你刚才创建的 GitHub 仓库。
4. **配置项目 (Framework Preset)**: Vercel 会自动识别为 **Vite**。
5. **环境变量 (可选)**: 如果你以后使用了 Gemini API，请在 "Environment Variables" 中添加 `GEMINI_API_KEY`。
6. 点击 **"Deploy"**。

## 🛠 本地开发
1. `npm install`
2. `npm run dev`

## 📝 修改指南
- **心跳速度**: 修改 `src/App.tsx` 中的 `frameRef.current / 10`。
- **祝福语**: 修改 `src/App.tsx` 中的 `<h2>` 文本。
- **颜色**: 修改 `HEART_COLOR` 常量。

# 跳动爱心星空动画 (Beating Heart with Starry Night)

这是一个基于 React + Vite + Canvas 开发的数学艺术动画，包含参数方程生成的跳动爱心、粒子系统以及动态星空背景。

## 本地运行指南

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发环境
```bash
npm run dev
```
访问浏览器显示的地址（默认 `http://localhost:3000`）。

### 3. 构建生产版本
```bash
npm run build
```

## 项目结构
- `src/App.tsx`: 核心逻辑，包含心跳数学公式、粒子生成器和 Canvas 渲染循环。
- `src/index.css`: 样式配置，包含 Tailwind CSS 和自定义字体。
- `src/main.tsx`: React 入口文件。

## 关键参数修改
- **心跳频率**: 搜索 `frameRef.current / 10` 修改分母。
- **爱心颜色**: 修改 `HEART_COLOR` 常量。
- **背景颜色**: 修改 `BG_COLOR` 常量。
- **祝福语**: 修改 `<h2>` 标签内的文本。

## 技术栈
- **React 19**: UI 框架
- **Vite**: 构建工具
- **Tailwind CSS**: 样式处理
- **Motion**: 进场动画
- **Canvas API**: 高性能粒子渲染

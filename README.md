# 赛博朋克风格五子棋游戏

一个基于纯原生JavaScript开发的网页版五子棋游戏，具有赛博朋克霓虹风格视觉效果和智能AI对手。

## 功能特性

- 标准15x15五子棋规则
- 三档AI难度（低/中/高）
- 赛博朋克视觉风格（霓虹发光效果）
- 悔棋功能
- 音效系统（落子、胜利、点击）
- 流畅的动画效果
- 响应式设计

## 技术栈

- HTML5 + CSS3 + ES6+ JavaScript
- Canvas API (图形渲染)
- Minimax + Alpha-Beta剪枝算法 (AI)
- Web Audio API (音效)
- 无第三方框架依赖

## 项目结构

```
wuziqi/
├── index.html              # 主页面
├── README.md               # 项目说明
├── 技术方案文档.md          # 详细技术文档
├── GIT_WORKFLOW.md         # Git工作流指南
├── css/
│   ├── main.css            # 主样式（布局、组件）
│   └── cyberpunk.css       # 赛博朋克主题样式
├── js/
│   ├── game.js             # 游戏主控制器
│   ├── board.js            # 棋盘逻辑
│   ├── ai.js               # AI算法引擎
│   ├── ui.js               # UI交互控制
│   ├── audio.js            # 音效管理器
│   └── utils.js            # 工具函数库
└── assets/
    ├── sounds/             # 音效文件目录
    │   ├── place.mp3       # 落子音效
    │   ├── win.mp3         # 胜利音效
    │   └── click.mp3       # 按钮点击音效
    └── fonts/              # 字体文件（可选）
```

## 快速开始

### 本地运行

1. 克隆项目
```bash
git clone <仓库地址>
cd wuziqi
```

2. 使用本地服务器运行（推荐）
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (需安装 http-server)
npx http-server -p 8000
```

3. 打开浏览器访问
```
http://localhost:8000
```

### 直接打开

也可以直接双击 `index.html` 在浏览器中打开，但推荐使用本地服务器以避免跨域问题。

## 开发指南

### Git分支策略

查看 `GIT_WORKFLOW.md` 了解详细的分支管理和协作流程。

主要分支:
- `main`: 稳定发布版本
- `develop`: 开发集成分支
- `feature/*`: 功能开发分支

### 开发步骤

1. 从 `develop` 创建功能分支
```bash
git checkout develop
git checkout -b feature/your-feature
```

2. 开发并提交
```bash
git add .
git commit -m "feat: 你的功能描述"
```

3. 合并回 `develop`
```bash
git checkout develop
git merge feature/your-feature --no-ff
```

### 代码规范

- 使用ES6+语法
- 类名使用PascalCase (如: `GameController`)
- 函数名使用camelCase (如: `checkWin`)
- 常量使用UPPER_SNAKE_CASE (如: `MAX_DEPTH`)
- 详细的函数注释

## 核心算法

### AI算法
- Minimax搜索算法
- Alpha-Beta剪枝优化
- 启发式评估函数
- 候选点生成优化

### 难度设置
- 低难度: 搜索深度1层
- 中难度: 搜索深度2层
- 高难度: 搜索深度3层

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端浏览器

## 待开发功能

- [ ] 基础HTML结构
- [ ] 赛博朋克样式
- [ ] 棋盘渲染系统
- [ ] 游戏逻辑引擎
- [ ] AI算法实现
- [ ] UI交互控制
- [ ] 音效系统
- [ ] 动画效果

## 许可证

MIT License

## 作者

Claude Code

## 更新日志

### v0.1.0 (2026-01-20)
- 项目初始化
- 创建基础目录结构
- 编写技术方案文档

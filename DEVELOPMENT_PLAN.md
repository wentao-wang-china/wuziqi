# 赛博朋克五子棋 - 多人并行开发方案

## 项目概览

**项目名称**: 赛博朋克风格五子棋游戏
**开发模式**: 多人并行开发（方案2）
**团队规模**: 3人
**预计总工期**: 3-4天
**开始时间**: 2026-01-20
**当前阶段**: Phase 1 - Foundation ✅ 已完成

---

## 当前进度状态

### ✅ 已完成模块

| 模块 | 分支 | 负责人 | 状态 | 完成时间 |
|------|------|--------|------|----------|
| 基础框架 | feature/foundation | - | ✅ 完成 | 2026-01-20 |

**完成内容**:
- ✅ index.html (200行) - 完整页面结构
- ✅ css/main.css (565行) - 基础布局和组件
- ✅ css/cyberpunk.css (502行) - 赛博朋克主题
- ✅ 已合并到 develop 分支

---

## 并行开发方案 (方案2)

### 开发阶段划分

```
Phase 1: Foundation ✅ (已完成)
  └─ feature/foundation → develop

Phase 2: 并行开发阶段 (当前阶段)
  ├─ 开发者A: utils → board → game
  ├─ 开发者B: audio (完成后协助)
  └─ 开发者C: 等待board完成后开发ai/ui

Phase 3: 集成测试阶段
  └─ 所有模块合并，联调测试

Phase 4: 发布阶段
  └─ develop → main (v1.0)
```

---

## 开发者任务分配

### 👨‍💻 开发者A - 核心逻辑负责人

**负责模块**: 工具函数 → 棋盘系统 → 游戏引擎
**总工作量**: 2.5天
**关键路径**: ⭐⭐⭐⭐⭐ (最关键)

#### 任务1: feature/utils (0.5天)
**分支**: `feature/utils`
**依赖**: 无
**优先级**: 🟢 可立即开始

**开发内容**:
```javascript
// js/utils.js
1. 常量定义
   - BOARD_SIZE = 15
   - CELL_SIZE = 40
   - PLAYER_BLACK = 'black'
   - PLAYER_WHITE = 'white'
   - DIFFICULTY_LEVELS = {easy, medium, hard}

2. 工具函数
   - delay(ms) - 延迟函数
   - deepClone(obj) - 深拷贝
   - logger(message, type) - 调试日志
   - timer.start()/end() - 性能计时

3. 辅助函数
   - formatTime(ms) - 格式化时间
   - isValidPosition(row, col) - 位置验证
   - getDirection(dr, dc) - 方向辅助
```

**交付物**:
- [ ] js/utils.js (约200行)
- [ ] 单元测试（可选）
- [ ] 提交到 feature/utils
- [ ] 合并到 develop

---

#### 任务2: feature/board (1天)
**分支**: `feature/board`
**依赖**: feature/foundation ✅, feature/utils ✅
**优先级**: 🟢 utils完成后立即开始

**开发内容**:
```javascript
// js/board.js
1. Board类框架
   class Board {
     constructor(size = 15)
     initGrid()
     render()
   }

2. Canvas渲染
   - drawGrid() - 网格线（霓虹发光）
   - drawStones() - 所有棋子
   - drawStone(row, col, player) - 单个棋子（渐变）
   - drawLastMoveMarker() - 最后一手标记

3. 坐标系统
   - getCellFromPosition(x, y) - 鼠标转棋盘坐标
   - getCellCenter(row, col) - 棋盘转像素坐标
   - isValidMove(row, col) - 合法性检查

4. 状态管理
   - makeMove(row, col, player) - 落子
   - undoMove() - 悔棋
   - history[] - 历史记录
```

**技术要点**:
- Canvas发光效果: `ctx.shadowBlur`, `ctx.shadowColor`
- 渐变棋子: `createRadialGradient`
- 坐标转换: 像素 ↔ 棋盘坐标

**交付物**:
- [ ] js/board.js (约400行)
- [ ] Canvas渲染测试
- [ ] 提交到 feature/board
- [ ] 合并到 develop

---

#### 任务3: feature/game (1天)
**分支**: `feature/game`
**依赖**: feature/board ✅
**优先级**: 🟡 board完成后开始

**开发内容**:
```javascript
// js/game.js
1. Game类框架
   class Game {
     constructor()
     start(difficulty)
     restart()
   }

2. 游戏流程
   - handlePlayerMove(row, col) - 玩家落子
   - handleAiMove() - AI落子
   - switchPlayer() - 切换回合
   - undo() - 悔棋（玩家+AI各一步）

3. 五连判定算法
   - checkWin(row, col, player) - 五连检测
   - checkDirection(row, col, dr, dc) - 方向检查
   - countDirection(row, col, dr, dc) - 连子计数
   - getWinLine() - 获取五连线坐标

4. 游戏状态
   - gameState: playing/blackWin/whiteWin/draw
   - currentPlayer: black/white
   - isAiThinking: boolean
```

**核心算法**:
```javascript
// 四个方向: 横、竖、左斜、右斜
directions = [[0,1], [1,0], [1,1], [1,-1]]

checkWin(row, col, player) {
  for (direction of directions) {
    count = 1 + countDirection(正) + countDirection(反)
    if (count >= 5) return true
  }
  return false
}
```

**交付物**:
- [ ] js/game.js (约500行)
- [ ] 五连算法测试
- [ ] 提交到 feature/game
- [ ] 合并到 develop
- [ ] ⚠️ 完成后通知开发者C开始AI开发

---

### 👨‍💻 开发者B - 音效系统负责人

**负责模块**: 音效系统
**总工作量**: 0.5天 + 协助时间
**关键路径**: ⭐⭐ (独立模块)

#### 任务: feature/audio (0.5天)
**分支**: `feature/audio`
**依赖**: 无
**优先级**: 🟢 可立即开始

**开发内容**:
```javascript
// js/audio.js
1. AudioManager类
   class AudioManager {
     constructor()
     async loadSounds()
     play(soundName)
     toggle()
     setVolume(volume)
   }

2. 音效加载
   - loadSound(name, url) - 异步加载
   - sounds = {place, win, click}
   - 错误处理

3. 播放控制
   - play() - 播放音效
   - stop() - 停止
   - enabled - 开关状态
   - volume - 音量控制

4. 音效文件准备
   - place.mp3 - 落子音效
   - win.mp3 - 胜利音效
   - click.mp3 - 按钮点击音效
```

**音效文件获取**:
- 方案1: 使用免费音效网站 (freesound.org, zapsplat.com)
- 方案2: 使用Web Audio API生成简单音效
- 方案3: 临时使用占位音效，后期替换

**交付物**:
- [ ] js/audio.js (约200行)
- [ ] assets/sounds/*.mp3 (3个音效文件)
- [ ] 提交到 feature/audio
- [ ] 合并到 develop

**完成后任务**:
开发者B完成audio后，可以：
1. 协助开发者A进行board/game测试
2. 协助开发者C进行AI调试
3. 准备集成测试用例
4. 优化音效体验

---

### 👨‍💻 开发者C - AI和UI负责人

**负责模块**: AI引擎 → UI控制器
**总工作量**: 3天
**关键路径**: ⭐⭐⭐⭐ (复杂算法)

#### 等待阶段 (0.5-1天)
**状态**: ⏳ 等待开发者A完成board和game

**准备工作**:
1. 学习Minimax算法原理
2. 研究Alpha-Beta剪枝
3. 设计评估函数
4. 阅读五子棋AI相关资料
5. 准备测试棋局

---

#### 任务1: feature/ai (2天)
**分支**: `feature/ai`
**依赖**: feature/board ✅, feature/game ✅
**优先级**: 🔴 需等待board和game完成

**开发内容**:
```javascript
// js/ai.js
1. AI类框架
   class AI {
     constructor(difficulty)
     getBestMove(board)
     minimax(board, depth, alpha, beta, isMax)
   }

2. Minimax算法
   - minimax核心搜索
   - Alpha-Beta剪枝优化
   - 深度控制: easy=1, medium=2, hard=3
   - 搜索节点计数

3. 评估函数
   - evaluate(board) - 局面评估
   - evaluatePlayer(board, player) - 单方评估
   - getPattern(board, row, col, dr, dc) - 连子模式
   - getPatternScore(pattern) - 模式评分
     * 五连: 100000
     * 活四: 10000
     * 冲四: 1000
     * 活三: 1000
     * 眠三: 100
     * 活二: 100
     * 眠二: 10

4. 性能优化
   - getCandidateMoves(board) - 候选点生成
   - findCriticalMove(board) - 必杀点检测
   - 限制搜索范围（已落子周围2格）
   - 限制候选点数量（最多20个）

5. 难度调试
   - 测试三种难度的AI强度
   - 调整评估函数权重
   - 优化搜索性能
```

**核心算法**:
```javascript
minimax(board, depth, alpha, beta, isMaximizing) {
  // 终止条件
  if (depth === 0 || gameOver) return evaluate(board)

  // AI回合（最大化）
  if (isMaximizing) {
    maxEval = -Infinity
    for (move of candidates) {
      board.makeMove(move)
      eval = minimax(board, depth-1, alpha, beta, false)
      board.undoMove()
      maxEval = max(maxEval, eval)
      alpha = max(alpha, eval)
      if (beta <= alpha) break  // Beta剪枝
    }
    return maxEval
  }
  // 玩家回合（最小化）
  else { ... }
}
```

**交付物**:
- [ ] js/ai.js (约600-800行)
- [ ] AI性能测试报告
- [ ] 提交到 feature/ai
- [ ] 合并到 develop

---

#### 任务2: feature/ui (1天)
**分支**: `feature/ui`
**依赖**: feature/foundation ✅, feature/game ✅
**优先级**: 🟡 可与AI并行或AI完成后开始

**开发内容**:
```javascript
// js/ui.js
1. UI类框架
   class UI {
     constructor(game)
     init()
     bindEvents()
   }

2. 事件绑定
   - handleCanvasClick(e) - Canvas点击
   - handleCanvasMouseMove(e) - 鼠标悬停
   - handleRestart() - 重新开始
   - handleUndo() - 悔棋
   - handleSoundToggle() - 音效开关
   - handleDifficultySelect(difficulty) - 难度选择

3. 界面更新
   - updateStatus(message) - 状态文本
   - showWinner(winner) - 胜利提示
   - enableControls() - 启用按钮
   - disableControls() - 禁用按钮（AI思考时）
   - updateStats(moveCount, aiTime) - 更新统计

4. 模态框控制
   - showDifficultyModal() - 显示难度选择
   - hideDifficultyModal() - 隐藏模态框
   - showWinModal(winner) - 显示胜利

5. 悬停预览
   - drawHoverPreview(row, col) - 半透明预览
   - clearHoverPreview() - 清除预览
```

**交付物**:
- [ ] js/ui.js (约400行)
- [ ] UI交互测试
- [ ] 提交到 feature/ui
- [ ] 合并到 develop

---

## 时间线规划

### Day 1 (2026-01-20)
```
开发者A:
  ✅ Foundation完成
  🔵 开始 feature/utils (预计4小时)

开发者B:
  🔵 开始 feature/audio (预计4小时)

开发者C:
  📚 学习AI算法理论
  📖 阅读技术文档
```

### Day 2 (2026-01-21)
```
开发者A:
  ✅ utils完成并合并
  🔵 开始 feature/board (全天)

开发者B:
  ✅ audio完成并合并
  🤝 协助A测试board

开发者C:
  📚 继续准备AI算法
  🎮 设计测试棋局
```

### Day 3 (2026-01-22)
```
开发者A:
  ✅ board完成并合并
  🔵 开始 feature/game (全天)

开发者B:
  🤝 协助A测试game
  ⚙️ 准备集成测试

开发者C:
  ⏳ 继续等待board和game
  🔵 可以开始 feature/ui (不依赖AI)
```

### Day 4 (2026-01-23)
```
开发者A:
  ✅ game完成并合并
  ✅ 核心模块全部完成

开发者B:
  🧪 集成测试

开发者C:
  🔵 开始 feature/ai (全天)
  🔵 继续 feature/ui
```

### Day 5 (2026-01-24)
```
开发者C:
  🔵 继续 feature/ai
  ✅ ui完成并合并

全员:
  🧪 联调测试
```

### Day 6 (2026-01-25)
```
开发者C:
  ✅ ai完成并合并

全员:
  🧪 最终测试
  🐛 Bug修复
  📦 准备发布
```

---

## 依赖关系图

```
foundation (已完成)
    ├── utils (开发者A) ─────┐
    ├── audio (开发者B)      │
    └── board (开发者A) ──────┤
            └── game (开发者A) ─────┤
                    ├── ai (开发者C) ─────┐
                    └── ui (开发者C) ─────┤
                                          └──> 集成测试
```

**关键路径**: foundation → utils → board → game → ai
**并行路径**: audio (独立), ui (部分并行)

---

## 合并策略

### 合并顺序
```bash
1. feature/utils → develop
2. feature/audio → develop (可与utils并行)
3. feature/board → develop (需要utils)
4. feature/game → develop (需要board)
5. feature/ui → develop (可与ai并行)
6. feature/ai → develop
7. develop → main (v1.0发布)
```

### 合并规范
每个功能分支合并到develop时：
```bash
# 1. 切换到develop并拉取最新代码
git checkout develop
git pull origin develop

# 2. 合并feature分支（使用--no-ff保留历史）
git merge feature/xxx --no-ff -m "Merge feature/xxx into develop

- 功能描述
- 主要改动
- 测试情况"

# 3. 推送到远程
git push origin develop

# 4. 通知其他开发者拉取最新develop
```

---

## 沟通协调机制

### 每日站会（建议）
- **时间**: 每天早上10:00
- **时长**: 15分钟
- **内容**:
  1. 昨天完成了什么
  2. 今天计划做什么
  3. 遇到什么阻碍

### 关键节点通知
开发者A需在以下时间点通知团队：
- ✅ utils完成 → 通知开发者B可以使用工具函数
- ✅ board完成 → 通知全员，可以开始依赖board的模块
- ✅ game完成 → 通知开发者C可以开始AI和UI开发

### 代码审查（可选）
- 每个功能分支在合并前，建议由其他开发者review
- 使用GitHub Pull Request进行代码审查
- 关注点：代码质量、性能、可维护性

---

## 风险评估

### 高风险项
1. **AI算法复杂度** (开发者C)
   - 风险: Minimax算法实现难度高
   - 缓解: 提前学习，可降低难度要求，先实现基础版本

2. **开发者A关键路径**
   - 风险: A的进度直接影响C
   - 缓解: B在audio完成后协助A加速

3. **性能优化** (AI搜索速度)
   - 风险: 高难度AI响应慢
   - 缓解: 候选点剪枝、搜索深度限制

### 中风险项
1. **音效文件获取** (开发者B)
   - 风险: 可能找不到合适的免费音效
   - 缓解: 先用占位音效，后期替换

2. **Canvas性能** (开发者A)
   - 风险: 发光效果可能影响性能
   - 缓解: 分层渲染，减少重绘

---

## 测试计划

### 单元测试（开发阶段）
每个开发者负责自己模块的基础测试：
- utils: 工具函数测试
- board: 渲染和坐标转换测试
- game: 五连判定算法测试
- ai: Minimax算法正确性测试
- ui: 事件绑定测试

### 集成测试（Day 4-6）
全员参与，测试场景：
1. 完整游戏流程（选难度→下棋→胜利）
2. 悔棋功能
3. 音效播放
4. AI三种难度强度
5. 边界情况（棋盘满、连续点击等）

### 性能测试
- AI响应时间（高难度<3秒）
- Canvas渲染帧率（>30fps）
- 内存占用检查

### 兼容性测试
- Chrome/Edge
- Firefox
- Safari
- 移动端浏览器（可选）

---

## 交付标准

### 代码质量
- [ ] 代码符合ES6+规范
- [ ] 函数有清晰的注释
- [ ] 命名规范统一
- [ ] 无console.log调试代码（除logger）

### 功能完整性
- [ ] 所有技术文档中的功能已实现
- [ ] 核心功能可正常运行
- [ ] 无明显bug

### 性能要求
- [ ] AI响应时间合理
- [ ] 页面流畅无卡顿
- [ ] Canvas渲染正常

### 文档要求
- [ ] README更新
- [ ] 代码注释完整
- [ ] Git提交信息清晰

---

## 版本发布

### v1.0 发布清单
- [ ] 所有功能分支已合并到develop
- [ ] 集成测试通过
- [ ] 性能测试通过
- [ ] Bug修复完成
- [ ] README文档更新
- [ ] develop合并到main
- [ ] 打标签 v1.0
- [ ] 推送到GitHub
- [ ] 部署到GitHub Pages（可选）

---

## 后续优化方向（v1.1+）

### 功能扩展
- [ ] 双人对战模式
- [ ] 游戏回放功能
- [ ] 本地排行榜
- [ ] 多种主题切换
- [ ] 禁手规则

### 性能优化
- [ ] Web Worker异步AI计算
- [ ] Zobrist哈希置换表
- [ ] Canvas分层渲染优化

### 体验优化
- [ ] 移动端适配优化
- [ ] 音效音量调节滑块
- [ ] AI提示功能
- [ ] 更多动画效果

---

## 附录

### 技术栈总结
- **前端**: HTML5 + CSS3 + ES6+ JavaScript
- **Canvas**: 图形渲染
- **算法**: Minimax + Alpha-Beta剪枝
- **音频**: Web Audio API / HTML5 Audio
- **版本控制**: Git + GitHub
- **部署**: GitHub Pages（可选）

### 参考资料
- [Minimax算法详解](https://en.wikipedia.org/wiki/Minimax)
- [Alpha-Beta剪枝](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning)
- [Canvas API文档](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [五子棋AI设计](https://www.google.com/search?q=gomoku+ai+minimax)

---

**文档版本**: v1.0
**创建时间**: 2026-01-20
**最后更新**: 2026-01-20
**文档状态**: 📋 计划阶段 - 待执行

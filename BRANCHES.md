# Git 分支说明文档

## 当前分支结构

```
main (稳定发布分支)
  └─ develop (开发集成分支)
       ├─ feature/foundation (基础框架)
       ├─ feature/board (棋盘系统)
       ├─ feature/game (游戏引擎)
       ├─ feature/ai (AI引擎)
       ├─ feature/ui (UI控制器)
       ├─ feature/audio (音效系统)
       └─ feature/utils (工具函数)
```

## 分支详细说明

### 主分支

#### `main`
- **用途**: 稳定发布版本，只包含经过测试的完整功能
- **保护**: 不应直接在此分支开发
- **合并来源**: 仅从 `develop` 分支合并
- **标签**: 每次合并后打版本标签 (v1.0, v1.1...)

#### `develop`
- **用途**: 开发主线，集成所有功能分支
- **作用**: 功能分支的合并目标和集成测试分支
- **当前位置**: 你现在在这个分支上 ✓

---

### 功能分支 (Feature Branches)

#### `feature/foundation`
**开发内容**: 基础HTML结构和CSS框架
- `index.html` - 主页面结构
- `css/main.css` - 基础布局样式
- `css/cyberpunk.css` - 赛博朋克主题样式
- 页面布局和组件结构

**开发建议**:
- 优先级: ⭐⭐⭐⭐⭐ (最高，其他模块依赖此基础)
- 预计时间: 1-2天
- 依赖: 无

**切换到此分支**:
```bash
git checkout feature/foundation
```

---

#### `feature/board`
**开发内容**: 棋盘渲染系统
- `js/board.js` - Board类实现
- Canvas网格绘制（发光效果）
- 棋子渲染（渐变发光）
- 坐标转换系统
- 历史记录管理

**开发建议**:
- 优先级: ⭐⭐⭐⭐⭐ (核心模块)
- 预计时间: 1天
- 依赖: `feature/foundation` (需要Canvas元素)

**切换到此分支**:
```bash
git checkout feature/board
```

**关键任务**:
- [ ] Board类框架
- [ ] Canvas初始化
- [ ] 网格线绘制（带发光）
- [ ] 棋子绘制（黑白渐变）
- [ ] 鼠标坐标转换
- [ ] 落子和悔棋功能

---

#### `feature/game`
**开发内容**: 游戏逻辑引擎
- `js/game.js` - Game类实现
- 五连判定算法
- 回合控制系统
- 胜负判定
- 游戏流程管理

**开发建议**:
- 优先级: ⭐⭐⭐⭐⭐ (核心模块)
- 预计时间: 1天
- 依赖: `feature/board` (需要棋盘数据结构)

**切换到此分支**:
```bash
git checkout feature/game
```

**关键任务**:
- [ ] Game类框架
- [ ] 四个方向五连判定
- [ ] checkWin算法
- [ ] 回合切换逻辑
- [ ] 平局检测
- [ ] 游戏状态管理

---

#### `feature/ai`
**开发内容**: AI算法引擎
- `js/ai.js` - AI类实现
- Minimax搜索算法
- Alpha-Beta剪枝
- 评估函数
- 候选点生成
- 三档难度实现

**开发建议**:
- 优先级: ⭐⭐⭐⭐ (核心算法)
- 预计时间: 2天
- 依赖: `feature/board`, `feature/game` (需要游戏规则和棋盘状态)

**切换到此分支**:
```bash
git checkout feature/ai
```

**关键任务**:
- [ ] AI类框架
- [ ] Minimax核心算法
- [ ] Alpha-Beta剪枝优化
- [ ] 评估函数（连子模式）
- [ ] 候选点生成优化
- [ ] 必杀点检测
- [ ] 难度参数调优

---

#### `feature/ui`
**开发内容**: UI交互控制器
- `js/ui.js` - UI类实现
- 事件绑定（点击、悬停）
- 界面更新逻辑
- 按钮控制
- 难度选择对话框
- 状态文本更新

**开发建议**:
- 优先级: ⭐⭐⭐⭐ (用户交互)
- 预计时间: 1天
- 依赖: `feature/foundation`, `feature/game` (需要DOM结构和游戏逻辑)

**切换到此分支**:
```bash
git checkout feature/ui
```

**关键任务**:
- [ ] UI类框架
- [ ] Canvas点击事件处理
- [ ] 鼠标悬停预览
- [ ] 按钮事件绑定
- [ ] 难度选择对话框
- [ ] 状态文本更新
- [ ] 胜利提示显示

---

#### `feature/audio`
**开发内容**: 音效管理系统
- `js/audio.js` - AudioManager类
- 音效加载系统
- 音效播放控制
- 音量调节
- 音效开关

**开发建议**:
- 优先级: ⭐⭐⭐ (增强体验)
- 预计时间: 0.5天
- 依赖: 无（独立模块）
- 注意: 需要准备音效文件 (place.mp3, win.mp3, click.mp3)

**切换到此分支**:
```bash
git checkout feature/audio
```

**关键任务**:
- [ ] AudioManager类框架
- [ ] 异步音效加载
- [ ] 播放控制方法
- [ ] 音效开关功能
- [ ] 音量调节
- [ ] 准备或录制音效文件

---

#### `feature/utils`
**开发内容**: 通用工具函数库
- `js/utils.js` - 工具函数集合
- 辅助函数
- 常量定义
- 调试工具

**开发建议**:
- 优先级: ⭐⭐ (辅助模块)
- 预计时间: 0.5天
- 依赖: 无
- 备注: 可根据其他模块需求动态添加

**切换到此分支**:
```bash
git checkout feature/utils
```

**可能包含**:
- 延迟函数 (delay)
- 深拷贝函数 (deepClone)
- 调试日志 (logger)
- 性能计时器 (timer)
- 常量定义 (CONSTANTS)

---

## 开发工作流

### 单人开发推荐顺序

```bash
# 第1步: 基础框架
git checkout feature/foundation
# 完成后合并到develop
git checkout develop
git merge feature/foundation --no-ff

# 第2步: 棋盘系统
git checkout feature/board
git merge develop  # 拉取foundation的更新
# 开发...
git checkout develop
git merge feature/board --no-ff

# 第3步: 游戏引擎
git checkout feature/game
git merge develop
# 开发...
git checkout develop
git merge feature/game --no-ff

# 第4步: AI引擎
git checkout feature/ai
git merge develop
# 开发...
git checkout develop
git merge feature/ai --no-ff

# 第5步: UI控制器
git checkout feature/ui
git merge develop
# 开发...
git checkout develop
git merge feature/ui --no-ff

# 第6步: 音效系统
git checkout feature/audio
git merge develop
# 开发...
git checkout develop
git merge feature/audio --no-ff

# 第7步: 工具函数（穿插在其他步骤中）
git checkout feature/utils
# 根据需要添加工具函数
git checkout develop
git merge feature/utils --no-ff
```

### 多人协作推荐分工

**并行开发组合1** (3人团队):
- 开发者A: `feature/foundation` → `feature/board`
- 开发者B: `feature/game` → `feature/ai`
- 开发者C: `feature/ui` → `feature/audio`

**并行开发组合2** (5人团队):
- 开发者A: `feature/foundation` (第1-2天)
- 开发者B: `feature/board` (第3天起)
- 开发者C: `feature/game` (第3天起)
- 开发者D: `feature/ai` (第4天起)
- 开发者E: `feature/ui` + `feature/audio` (第3天起)

---

## 快速命令参考

```bash
# 查看所有分支
git branch -a

# 查看当前分支
git branch --show-current

# 切换分支
git checkout <分支名>

# 查看分支图
git log --oneline --graph --all

# 拉取develop最新代码到当前分支
git merge develop

# 将当前分支合并回develop
git checkout develop
git merge <当前分支> --no-ff

# 删除已合并的分支（可选）
git branch -d feature/board
```

---

## 注意事项

1. **定期同步**: 在feature分支工作时，定期从develop拉取更新
2. **小步提交**: 每完成一个小功能就提交，不要积累太多修改
3. **合并前测试**: 合并到develop前确保代码可运行
4. **冲突处理**: 遇到冲突及时解决，不要拖延
5. **分支清理**: 功能完成并合并后，可删除对应feature分支

---

**文档版本**: v1.0
**最后更新**: 2026-01-20
**当前状态**: 所有分支已创建，可以开始开发

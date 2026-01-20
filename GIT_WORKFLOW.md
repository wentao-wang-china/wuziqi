# 五子棋项目 Git 协同开发工作流

CC：需要开发一个网页版五子棋游戏，目前已经生成了整体的技术方案，接下来需要根据技术方案开始开发。在开发之前，请帮我规划下，我想使用git树，多个分支来进行协同工作，这样效率更高。

## 一、初始化仓库

```bash
# 1. 初始化Git仓库
git init

# 2. 创建 .gitignore
cat > .gitignore << 'EOF'
# macOS
.DS_Store

# IDE
.vscode/
.idea/

# 临时文件
*.log
*.tmp

# 测试文件
test/
*.test.js
EOF

# 3. 创建初始提交
git add .
git commit -m "Initial commit: 添加技术方案文档"

# 4. 创建主分支
git branch -M main
```

## 二、分支策略

### 分支结构
```
main (稳定版本)
  └─ develop (开发主线)
       ├─ feature/foundation (基础框架)
       ├─ feature/board (棋盘系统)
       ├─ feature/game (游戏引擎)
       ├─ feature/ai (AI引擎)
       ├─ feature/ui (UI控制器)
       ├─ feature/audio (音效系统)
       └─ feature/utils (工具函数)
```

### 创建开发分支
```bash
# 创建并切换到 develop 分支
git checkout -b develop

# 推送到远程(如果有)
git push -u origin develop
```

## 三、并行开发流程

### 阶段1: 基础框架 (第1人或第1-2天)
```bash
# 创建基础分支
git checkout develop
git checkout -b feature/foundation

# 开发内容:
# - index.html (页面结构)
# - css/main.css (基础布局)
# - css/cyberpunk.css (赛博朋克样式)
# - 目录结构创建

# 提交代码
git add .
git commit -m "feat: 完成基础HTML结构和赛博朋克样式"

# 合并到 develop
git checkout develop
git merge feature/foundation --no-ff

# 推送
git push origin develop
```

### 阶段2: 核心模块并行开发 (可同时进行)

#### 开发者A: 棋盘系统
```bash
git checkout develop
git pull origin develop
git checkout -b feature/board

# 开发 js/board.js
# - Board类实现
# - Canvas渲染
# - 坐标转换

git add js/board.js
git commit -m "feat(board): 实现棋盘渲染和坐标系统"

# 定期拉取develop更新
git checkout develop
git pull origin develop
git checkout feature/board
git merge develop

# 完成后合并
git checkout develop
git merge feature/board --no-ff
git push origin develop
```

#### 开发者B: 游戏引擎
```bash
git checkout develop
git pull origin develop
git checkout -b feature/game

# 开发 js/game.js
# - Game类
# - 五连判定算法
# - 回合控制

git add js/game.js
git commit -m "feat(game): 实现游戏逻辑和五连判定"

git checkout develop
git merge feature/game --no-ff
git push origin develop
```

#### 开发者C: AI引擎
```bash
git checkout develop
git pull origin develop
git checkout -b feature/ai

# 开发 js/ai.js
# - Minimax算法
# - Alpha-Beta剪枝
# - 评估函数

git add js/ai.js
git commit -m "feat(ai): 实现Minimax算法和三档难度"

git checkout develop
git merge feature/ai --no-ff
git push origin develop
```

#### 开发者D: UI控制器
```bash
git checkout develop
git pull origin develop
git checkout -b feature/ui

# 开发 js/ui.js
# - UI类
# - 事件绑定
# - 界面更新

git add js/ui.js
git commit -m "feat(ui): 实现UI交互和事件处理"

git checkout develop
git merge feature/ui --no-ff
git push origin develop
```

#### 开发者E: 音效系统
```bash
git checkout develop
git pull origin develop
git checkout -b feature/audio

# 开发 js/audio.js + 音效文件
# - AudioManager类
# - 音效加载和播放

git add js/audio.js assets/sounds/
git commit -m "feat(audio): 实现音效管理系统"

git checkout develop
git merge feature/audio --no-ff
git push origin develop
```

## 四、提交规范

### Commit Message 格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型
- `feat`: 新功能
- `fix`: 修复bug
- `refactor`: 重构
- `style`: 样式调整
- `perf`: 性能优化
- `test`: 测试
- `docs`: 文档

### 示例
```bash
feat(board): 实现Canvas发光效果

- 添加网格线shadowBlur
- 棋子渐变发光渲染
- 最后一手标记

Issue #12

---

fix(ai): 修复Alpha-Beta剪枝边界条件

优化候选点生成性能,限制搜索范围

Performance: 搜索时间从5s降至1.2s

---

refactor(game): 重构五连判定逻辑

提取countDirection方法,提高代码复用性
```

## 五、合并策略

### 5.1 Feature → Develop
```bash
# 使用 --no-ff 保留分支历史
git checkout develop
git merge feature/board --no-ff -m "Merge feature/board into develop"

# 解决冲突(如果有)
git status
# 手动编辑冲突文件
git add <冲突文件>
git commit -m "resolve: 解决board与game的Canvas冲突"
```

### 5.2 Develop → Main (发布版本)
```bash
# 确保develop稳定后
git checkout main
git merge develop --no-ff -m "Release v1.0: 完成核心功能"

# 打标签
git tag -a v1.0 -m "Version 1.0: 基础功能完成"
git push origin main --tags
```

## 六、冲突预防

### 可能冲突的文件
1. **index.html**: 多人修改DOM结构
2. **main.css**: 样式冲突
3. **game.js**: 如果多人同时修改

### 预防措施
```bash
# 1. 每天开始工作前拉取最新代码
git checkout feature/your-branch
git fetch origin
git merge origin/develop

# 2. 小步提交,频繁同步
git add -p  # 选择性添加修改
git commit -m "feat: 小功能描述"

# 3. 定期合并develop到feature分支
git checkout feature/board
git merge develop
```

## 七、开发时间线(单人按此顺序,多人可并行)

### Week 1
```
Day 1-2:  feature/foundation  → develop  (HTML + CSS基础)
Day 3:    feature/board       → develop  (棋盘系统)
Day 4:    feature/game        → develop  (游戏逻辑)
Day 5-6:  feature/ai          → develop  (AI引擎)
Day 7:    feature/ui          → develop  (UI交互)
          feature/audio       → develop  (音效)
Day 8:    测试、修复、优化
          develop → main (发布 v1.0)
```

### 并行开发建议(多人)
```
Day 1-2:  feature/foundation (1人)
Day 3-7:  并行开发 (最多5人)
          - feature/board  (开发者A)
          - feature/game   (开发者B)
          - feature/ai     (开发者C)
          - feature/ui     (开发者D)
          - feature/audio  (开发者E)
Day 8:    集成测试和bug修复
```

## 八、分支管理命令速查

```bash
# 查看所有分支
git branch -a

# 删除已合并的feature分支
git branch -d feature/board

# 查看分支合并图
git log --graph --oneline --all

# 查看某个分支的提交历史
git log feature/ai --oneline

# 比较两个分支差异
git diff develop..feature/board

# 撤销最后一次提交(保留修改)
git reset --soft HEAD~1

# 暂存当前工作切换分支
git stash
git checkout other-branch
git stash pop
```

## 九、远程协作(GitHub/GitLab)

```bash
# 添加远程仓库
git remote add origin <仓库URL>

# 推送所有分支
git push -u origin --all

# 创建Pull Request流程
git push origin feature/board
# 然后在GitHub上创建 PR: feature/board → develop

# 代码审查后合并
# 在GitHub界面点击 "Merge Pull Request"
# 或命令行:
git checkout develop
git merge origin/feature/board --no-ff
git push origin develop
```

## 十、注意事项

1. **不要在main分支直接开发**
2. **定期同步develop分支**
3. **每个功能分支只负责一个模块**
4. **提交前运行测试(如果有)**
5. **大的重构单独开refactor分支**
6. **合并前先在本地测试**

---

**文档版本**: v1.0
**最后更新**: 2026-01-20
**适用项目**: 赛博朋克五子棋游戏

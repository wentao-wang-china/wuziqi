/**
 * 五子棋游戏 - UI控制器
 * 负责用户交互、界面更新、事件处理
 */

class UI {
  /**
   * 构造函数
   */
  constructor() {
    // 游戏实例
    this.game = null;
    this.audioManager = null;

    // DOM元素引用
    this.elements = {
      // Canvas
      canvas: null,

      // 状态显示
      statusText: null,
      currentPlayer: null,
      difficultyDisplay: null,

      // 控制按钮
      restartBtn: null,
      undoBtn: null,
      soundToggle: null,

      // 统计信息
      moveCount: null,
      aiThinkTime: null,

      // 模态框
      difficultyModal: null,
      difficultyBtns: [],
      winModal: null,
      winTitle: null,
      winIcon: null,
      winMessage: null,
      playAgainBtn: null
    };

    // 悬停状态
    this.hoverCell = null;  // {row, col} 或 null
    this.isHovering = false;

    // 游戏状态
    this.isGameStarted = false;
    this.selectedDifficulty = CONSTANTS.DIFFICULTY.MEDIUM;
  }


  /**
   * 初始化UI控制器
   */
  async init() {
    Logger.info('UI控制器初始化开始');

    // 获取DOM元素引用
    this.cacheElements();

    // 创建游戏实例
    this.game = new Game();
    const success = this.game.init();

    if (!success) {
      Logger.error('游戏初始化失败');
      this.showError('游戏初始化失败，请刷新页面重试');
      return false;
    }

    // 创建音效管理器
    this.audioManager = new AudioManager();
    await this.audioManager.loadSounds();

    // 设置游戏回调函数
    this.setupGameCallbacks();

    // 绑定事件监听器
    this.bindEvents();

    // 显示难度选择模态框
    this.showDifficultyModal();

    Logger.info('UI控制器初始化完成');
    return true;
  }


  /**
   * 缓存DOM元素引用
   */
  cacheElements() {
    const get = (id) => document.getElementById(id);
    const getAll = (selector) => document.querySelectorAll(selector);

    // Canvas
    this.elements.canvas = get('gameCanvas');

    // 状态显示
    this.elements.statusText = get('statusText');
    this.elements.currentPlayer = get('currentPlayer');
    this.elements.difficultyDisplay = get('difficultyDisplay');

    // 控制按钮
    this.elements.restartBtn = get('restartBtn');
    this.elements.undoBtn = get('undoBtn');
    this.elements.soundToggle = get('soundToggle');

    // 统计信息
    this.elements.moveCount = get('moveCount');
    this.elements.aiThinkTime = get('aiThinkTime');

    // 难度选择模态框
    this.elements.difficultyModal = get('difficultyModal');
    this.elements.difficultyBtns = getAll('.difficulty-btn');

    // 胜利模态框
    this.elements.winModal = get('winModal');
    this.elements.winTitle = get('winTitle');
    this.elements.winIcon = get('winIcon');
    this.elements.winMessage = get('winMessage');
    this.elements.playAgainBtn = get('playAgainBtn');

    Logger.info('DOM元素缓存完成');
  }


  /**
   * 设置游戏回调函数
   */
  setupGameCallbacks() {
    // 游戏状态改变回调
    this.game.onGameStateChange = (state) => {
      this.updateGameState(state);
    };

    // 玩家切换回调
    this.game.onPlayerChange = (player) => {
      this.updateCurrentPlayer(player);
    };

    // 游戏结束回调
    this.game.onGameOver = (winner) => {
      this.handleGameOver(winner);
    };
  }


  /**
   * 绑定所有事件监听器
   */
  bindEvents() {
    const canvas = this.elements.canvas;

    // Canvas事件
    canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
    canvas.addEventListener('mouseleave', () => this.handleCanvasMouseLeave());

    // 控制按钮事件
    this.elements.restartBtn.addEventListener('click', () => this.handleRestart());
    this.elements.undoBtn.addEventListener('click', () => this.handleUndo());
    this.elements.soundToggle.addEventListener('click', () => this.handleSoundToggle());

    // 难度选择按钮事件
    this.elements.difficultyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const difficulty = btn.dataset.difficulty;
        this.handleDifficultySelect(difficulty);
      });
    });

    // 再来一局按钮
    this.elements.playAgainBtn.addEventListener('click', () => this.handlePlayAgain());

    Logger.info('事件监听器绑定完成');
  }


  /**
   * 处理Canvas点击事件
   * @param {MouseEvent} e - 鼠标事件
   */
  handleCanvasClick(e) {
    // 游戏未开始或已结束，忽略点击
    if (!this.isGameStarted || this.game.gameState !== CONSTANTS.STATE_PLAYING) {
      return;
    }

    // AI正在思考，忽略点击
    if (this.game.isAiThinking) {
      Logger.warn('AI正在思考，请稍候');
      return;
    }

    // 不是玩家回合，忽略点击
    if (this.game.currentPlayer !== this.game.playerSide) {
      Logger.warn('不是玩家回合');
      return;
    }

    // 获取点击位置的棋盘坐标
    const rect = this.elements.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cell = this.game.board.getCellFromPosition(x, y);

    if (cell) {
      const {row, col} = cell;

      // 检查位置是否合法
      if (this.game.board.isValidMove(row, col)) {
        // 播放落子音效
        this.audioManager.play('place');

        // 执行玩家落子
        this.game.handlePlayerMove(row, col);

        // 更新统计信息
        this.updateStats();
      } else {
        Logger.warn('该位置已有棋子');
      }
    }
  }


  /**
   * 处理Canvas鼠标移动事件（悬停预览）
   * @param {MouseEvent} e - 鼠标事件
   */
  handleCanvasMouseMove(e) {
    // 游戏未开始或已结束，不显示预览
    if (!this.isGameStarted || this.game.gameState !== CONSTANTS.STATE_PLAYING) {
      return;
    }

    // AI正在思考或不是玩家回合，不显示预览
    if (this.game.isAiThinking || this.game.currentPlayer !== this.game.playerSide) {
      if (this.isHovering) {
        this.clearHoverPreview();
      }
      return;
    }

    // 获取鼠标位置的棋盘坐标
    const rect = this.elements.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cell = this.game.board.getCellFromPosition(x, y);

    if (cell) {
      const {row, col} = cell;

      // 检查是否是新位置
      if (!this.hoverCell || this.hoverCell.row !== row || this.hoverCell.col !== col) {
        this.hoverCell = {row, col};

        // 只在空位置显示预览
        if (this.game.board.isValidMove(row, col)) {
          this.drawHoverPreview(row, col);
          this.isHovering = true;
        } else {
          this.clearHoverPreview();
        }
      }
    } else {
      // 鼠标移出棋盘区域
      if (this.isHovering) {
        this.clearHoverPreview();
      }
    }
  }


  /**
   * 处理Canvas鼠标离开事件
   */
  handleCanvasMouseLeave() {
    if (this.isHovering) {
      this.clearHoverPreview();
    }
  }


  /**
   * 绘制悬停预览（半透明棋子）
   * @param {number} row - 行
   * @param {number} col - 列
   */
  drawHoverPreview(row, col) {
    // 先重新渲染棋盘（清除上一次的预览）
    this.game.board.render();

    // 绘制半透明预览棋子
    const {x, y} = this.game.board.getCellCenter(row, col);
    const radius = this.game.board.cellSize * 0.4;
    const ctx = this.game.board.ctx;
    const player = this.game.currentPlayer;

    // 设置透明度
    ctx.globalAlpha = CONSTANTS.ANIMATION.HOVER_ALPHA;

    // 创建渐变
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    if (player === CONSTANTS.PLAYER_BLACK) {
      gradient.addColorStop(0, CONSTANTS.COLORS.STONE_BLACK);
      gradient.addColorStop(1, '#1a0033');
    } else {
      gradient.addColorStop(0, CONSTANTS.COLORS.STONE_WHITE);
      gradient.addColorStop(1, '#003344');
    }

    // 绘制预览棋子
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // 恢复透明度
    ctx.globalAlpha = 1;
  }


  /**
   * 清除悬停预览
   */
  clearHoverPreview() {
    this.hoverCell = null;
    this.isHovering = false;
    this.game.board.render();
  }


  /**
   * 处理重新开始按钮
   */
  handleRestart() {
    Logger.info('重新开始游戏');
    this.audioManager.play('click');

    // 显示难度选择模态框
    this.showDifficultyModal();
  }


  /**
   * 处理悔棋按钮
   */
  handleUndo() {
    // 游戏未开始或已结束，不能悔棋
    if (!this.isGameStarted || this.game.gameState !== CONSTANTS.STATE_PLAYING) {
      Logger.warn('当前无法悔棋');
      return;
    }

    // AI正在思考，不能悔棋
    if (this.game.isAiThinking) {
      Logger.warn('AI正在思考，无法悔棋');
      return;
    }

    // 棋盘上至少要有2步才能悔棋（玩家1步+AI1步）
    if (this.game.board.history.length < 2) {
      Logger.warn('至少需要下2步才能悔棋');
      return;
    }

    Logger.info('执行悔棋');
    this.audioManager.play('click');

    // 执行悔棋
    this.game.undo();

    // 更新统计信息
    this.updateStats();

    // 更新状态文本
    this.updateStatusText('已悔棋，轮到你下棋');
  }


  /**
   * 处理音效开关按钮
   */
  handleSoundToggle() {
    this.audioManager.toggle();

    const btn = this.elements.soundToggle;
    const icon = btn.querySelector('.btn-icon');
    const text = btn.querySelector('.btn-text');

    if (this.audioManager.enabled) {
      icon.textContent = '🔊';
      text.textContent = '音效开启';
      Logger.info('音效已开启');
    } else {
      icon.textContent = '🔇';
      text.textContent = '音效关闭';
      Logger.info('音效已关闭');
    }
  }


  /**
   * 处理难度选择
   * @param {string} difficulty - 难度级别
   */
  handleDifficultySelect(difficulty) {
    Logger.info('选择难度', {difficulty});
    this.audioManager.play('click');

    this.selectedDifficulty = difficulty;

    // 隐藏难度选择模态框
    this.hideDifficultyModal();

    // 创建AI实例
    this.game.ai = new AI(difficulty, CONSTANTS.PLAYER_WHITE);

    // 开始新游戏
    this.game.start(difficulty, CONSTANTS.PLAYER_BLACK);

    // 更新界面
    this.isGameStarted = true;
    this.updateDifficultyDisplay(difficulty);
    this.updateStatusText('游戏开始，你执黑棋先手');
    this.updateStats();
  }


  /**
   * 处理再来一局按钮
   */
  handlePlayAgain() {
    Logger.info('再来一局');
    this.audioManager.play('click');

    // 隐藏胜利模态框
    this.hideWinModal();

    // 重新开始游戏（使用相同难度）
    this.game.restart();

    // 更新界面
    this.updateStatusText('游戏开始，你执黑棋先手');
    this.updateStats();
  }


  /**
   * 处理游戏结束
   * @param {string} winner - 获胜方
   */
  handleGameOver(winner) {
    Logger.game('游戏结束', {winner});

    // 播放胜利音效
    this.audioManager.play('win');

    // 延迟显示胜利模态框，让玩家看到最后的棋盘状态
    setTimeout(() => {
      this.showWinModal(winner);
    }, 500);
  }


  /**
   * 更新游戏状态
   * @param {string} state - 游戏状态
   */
  updateGameState(state) {
    Logger.info('游戏状态更新', {state});

    switch (state) {
      case CONSTANTS.STATE_PLAYING:
        this.enableControls();
        break;

      case CONSTANTS.STATE_BLACK_WIN:
      case CONSTANTS.STATE_WHITE_WIN:
      case CONSTANTS.STATE_DRAW:
        this.disableControls();
        break;
    }
  }


  /**
   * 更新当前玩家显示
   * @param {string} player - 当前玩家
   */
  updateCurrentPlayer(player) {
    const playerText = player === CONSTANTS.PLAYER_BLACK ? '黑棋' : '白棋';
    this.elements.currentPlayer.textContent = playerText;

    // 更新状态文本
    if (player === this.game.playerSide) {
      this.updateStatusText('轮到你下棋');
    } else {
      this.updateStatusText('AI正在思考...');
    }
  }


  /**
   * 更新状态文本
   * @param {string} message - 状态消息
   */
  updateStatusText(message) {
    this.elements.statusText.textContent = message;
  }


  /**
   * 更新难度显示
   * @param {string} difficulty - 难度级别
   */
  updateDifficultyDisplay(difficulty) {
    const difficultyNames = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    };

    this.elements.difficultyDisplay.textContent = difficultyNames[difficulty] || difficulty;
  }


  /**
   * 更新统计信息
   */
  updateStats() {
    // 更新已下步数
    const moveCount = this.game.board.history.length;
    this.elements.moveCount.textContent = moveCount;

    // 更新AI思考时间
    if (this.game.ai) {
      const stats = this.game.ai.getStats();
      const thinkTime = (stats.searchTime / 1000).toFixed(2);
      this.elements.aiThinkTime.textContent = `${thinkTime}s`;
    }
  }


  /**
   * 启用控制按钮
   */
  enableControls() {
    this.elements.restartBtn.disabled = false;
    this.elements.undoBtn.disabled = false;
  }


  /**
   * 禁用控制按钮（AI思考时）
   */
  disableControls() {
    this.elements.undoBtn.disabled = true;
  }


  /**
   * 显示难度选择模态框
   */
  showDifficultyModal() {
    this.elements.difficultyModal.classList.remove('hidden');
    Logger.info('显示难度选择模态框');
  }


  /**
   * 隐藏难度选择模态框
   */
  hideDifficultyModal() {
    this.elements.difficultyModal.classList.add('hidden');
    Logger.info('隐藏难度选择模态框');
  }


  /**
   * 显示胜利模态框
   * @param {string} winner - 获胜方
   */
  showWinModal(winner) {
    const isPlayerWin = winner === this.game.playerSide;

    // 设置标题
    this.elements.winTitle.textContent = isPlayerWin ? '恭喜获胜！' : '很遗憾，你输了';

    // 设置图标
    this.elements.winIcon.textContent = isPlayerWin ? '🎉' : '😢';

    // 设置消息
    let message = '';
    if (winner === CONSTANTS.PLAYER_BLACK) {
      message = '黑棋获胜！';
    } else if (winner === CONSTANTS.PLAYER_WHITE) {
      message = '白棋获胜！';
    } else {
      message = '平局！';
    }

    const moveCount = this.game.board.history.length;
    message += ` 共下了${moveCount}步`;

    this.elements.winMessage.textContent = message;

    // 显示模态框
    this.elements.winModal.classList.remove('hidden');

    Logger.info('显示胜利模态框', {winner, isPlayerWin});
  }


  /**
   * 隐藏胜利模态框
   */
  hideWinModal() {
    this.elements.winModal.classList.add('hidden');
    Logger.info('隐藏胜利模态框');
  }


  /**
   * 显示错误提示
   * @param {string} message - 错误消息
   */
  showError(message) {
    alert(message);
    Logger.error(message);
  }
}


// ============================================
// 页面加载完成后初始化
// ============================================

window.addEventListener('DOMContentLoaded', async () => {
  Logger.info('=== 赛博朋克五子棋初始化 ===');

  // 创建UI控制器实例
  const ui = new UI();
  await ui.init();

  Logger.info('=== 游戏准备就绪 ===');
});

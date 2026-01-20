/**
 * 五子棋游戏 - 游戏引擎
 * 负责游戏流程控制、规则判定、胜负判断
 */

class Game {
  /**
   * 构造函数
   */
  constructor() {
    // 棋盘实例
    this.board = null;

    // 游戏状态
    this.gameState = CONSTANTS.STATE_PLAYING;  // playing/blackWin/whiteWin/draw
    this.currentPlayer = CONSTANTS.PLAYER_BLACK; // 当前玩家

    // 玩家配置
    this.playerSide = CONSTANTS.PLAYER_BLACK;  // 玩家执黑
    this.aiSide = CONSTANTS.PLAYER_WHITE;      // AI执白

    // AI配置
    this.difficulty = CONSTANTS.DIFFICULTY.MEDIUM;
    this.ai = null;                            // AI实例（需要在ai.js完成后设置）
    this.isAiThinking = false;                 // AI是否正在思考

    // 胜利信息
    this.winLine = null;                       // 五连线坐标数组 [{row, col}, ...]
    this.winner = null;                        // 胜者

    // 回调函数（用于UI更新）
    this.onGameStateChange = null;             // 游戏状态改变回调
    this.onPlayerChange = null;                // 玩家切换回调
    this.onGameOver = null;                    // 游戏结束回调
  }


  /**
   * 初始化游戏
   */
  init() {
    // 创建棋盘实例
    this.board = new Board();
    const success = this.board.init('gameCanvas');

    if (!success) {
      Logger.error('棋盘初始化失败');
      return false;
    }

    Logger.info('游戏引擎初始化完成');
    return true;
  }


  /**
   * 开始新游戏
   * @param {string} difficulty - 难度级别 ('easy'/'medium'/'hard')
   * @param {string} playerSide - 玩家执子颜色 ('black'/'white')
   */
  start(difficulty = CONSTANTS.DIFFICULTY.MEDIUM, playerSide = CONSTANTS.PLAYER_BLACK) {
    // 重置游戏状态
    this.gameState = CONSTANTS.STATE_PLAYING;
    this.difficulty = difficulty;
    this.playerSide = playerSide;
    this.aiSide = getOpponent(playerSide);
    this.currentPlayer = CONSTANTS.PLAYER_BLACK;  // 黑棋先手
    this.winLine = null;
    this.winner = null;
    this.isAiThinking = false;

    // 重置棋盘
    this.board.reset();

    Logger.game('游戏开始', {difficulty, playerSide});

    // 触发回调
    if (this.onGameStateChange) {
      this.onGameStateChange(this.gameState);
    }

    // 如果AI先手，触发AI落子
    if (this.currentPlayer === this.aiSide) {
      this.handleAiMove();
    }
  }


  /**
   * 重新开始游戏
   */
  restart() {
    this.start(this.difficulty, this.playerSide);
    Logger.game('游戏重新开始');
  }


  /**
   * 处理玩家落子
   * @param {number} row - 行坐标
   * @param {number} col - 列坐标
   * @returns {boolean} 是否成功落子
   */
  handlePlayerMove(row, col) {
    // 检查游戏状态
    if (this.gameState !== CONSTANTS.STATE_PLAYING) {
      Logger.warn('游戏已结束，无法落子');
      return false;
    }

    // 检查是否轮到玩家
    if (this.currentPlayer !== this.playerSide) {
      Logger.warn('当前不是玩家回合');
      return false;
    }

    // 检查AI是否正在思考
    if (this.isAiThinking) {
      Logger.warn('AI正在思考中，请稍候');
      return false;
    }

    // 尝试落子
    const success = this.board.makeMove(row, col, this.currentPlayer);
    if (!success) {
      return false;
    }

    // 检查胜负
    if (this.checkWin(row, col, this.currentPlayer)) {
      this.handleGameOver(this.currentPlayer);
      return true;
    }

    // 检查平局
    if (this.checkDraw()) {
      this.handleGameOver(null);
      return true;
    }

    // 切换玩家
    this.switchPlayer();

    // 触发AI落子
    if (this.currentPlayer === this.aiSide) {
      this.handleAiMove();
    }

    return true;
  }


  /**
   * 处理AI落子（异步）
   */
  async handleAiMove() {
    if (!this.ai) {
      Logger.warn('AI未初始化，暂时使用随机落子');
      this.handleRandomMove();
      return;
    }

    this.isAiThinking = true;
    Logger.ai('AI开始思考...');

    // 延迟以显示思考状态（用户体验）
    await delay(300);

    try {
      Timer.start('AI思考');

      // 调用AI获取最佳落子点
      const move = this.ai.getBestMove(this.board);

      const thinkTime = Timer.end('AI思考');
      Logger.ai(`AI思考完成，耗时: ${formatTime(thinkTime)}`, move);

      if (move) {
        // 执行落子
        this.board.makeMove(move.row, move.col, this.currentPlayer);

        // 检查胜负
        if (this.checkWin(move.row, move.col, this.currentPlayer)) {
          this.handleGameOver(this.currentPlayer);
          this.isAiThinking = false;
          return;
        }

        // 检查平局
        if (this.checkDraw()) {
          this.handleGameOver(null);
          this.isAiThinking = false;
          return;
        }

        // 切换玩家
        this.switchPlayer();
      }

    } catch (error) {
      Logger.error('AI落子失败', error);
      this.handleRandomMove();
    }

    this.isAiThinking = false;
  }


  /**
   * 随机落子（AI未实现时的临时方案）
   */
  handleRandomMove() {
    const emptyPositions = this.board.getEmptyPositions();
    if (emptyPositions.length === 0) return;

    const randomIndex = randomInt(0, emptyPositions.length);
    const {row, col} = emptyPositions[randomIndex];

    this.board.makeMove(row, col, this.currentPlayer);

    // 检查胜负
    if (this.checkWin(row, col, this.currentPlayer)) {
      this.handleGameOver(this.currentPlayer);
      return;
    }

    // 检查平局
    if (this.checkDraw()) {
      this.handleGameOver(null);
      return;
    }

    this.switchPlayer();
  }


  /**
   * 切换当前玩家
   */
  switchPlayer() {
    this.currentPlayer = getOpponent(this.currentPlayer);

    // 触发回调
    if (this.onPlayerChange) {
      this.onPlayerChange(this.currentPlayer);
    }

    Logger.game(`切换回合: ${getPlayerName(this.currentPlayer)}`);
  }


  /**
   * 悔棋（撤销玩家和AI各一步，共两步）
   * @returns {boolean} 是否成功悔棋
   */
  undo() {
    // 检查游戏状态
    if (this.gameState !== CONSTANTS.STATE_PLAYING) {
      Logger.warn('游戏已结束，无法悔棋');
      return false;
    }

    // 检查历史记录
    if (this.board.history.length < 2) {
      Logger.warn('悔棋需要至少2步历史记录');
      return false;
    }

    // 撤销AI的一步
    const aiMove = this.board.undoMove();
    if (!aiMove) return false;

    // 撤销玩家的一步
    const playerMove = this.board.undoMove();
    if (!playerMove) {
      // 如果玩家悔棋失败，恢复AI的棋子
      this.board.makeMove(aiMove.row, aiMove.col, aiMove.player);
      return false;
    }

    Logger.game('悔棋成功', {playerMove, aiMove});

    // 确保轮到玩家
    this.currentPlayer = this.playerSide;

    // 触发回调
    if (this.onPlayerChange) {
      this.onPlayerChange(this.currentPlayer);
    }

    return true;
  }


  /**
   * 检查五连胜利
   * @param {number} row - 最后落子的行坐标
   * @param {number} col - 最后落子的列坐标
   * @param {string} player - 玩家标识
   * @returns {boolean} 是否胜利
   */
  checkWin(row, col, player) {
    // 四个方向：横、竖、左斜、右斜
    const directions = CONSTANTS.DIRECTIONS;

    for (let [dr, dc] of directions) {
      let count = 1; // 当前位置算1个

      // 正方向计数
      count += this.countDirection(row, col, dr, dc, player);

      // 反方向计数
      count += this.countDirection(row, col, -dr, -dc, player);

      // 检查是否达到5连
      if (count >= 5) {
        // 记录五连线的位置（用于高亮显示）
        this.winLine = this.getWinLine(row, col, dr, dc, player, count);
        Logger.game(`${getPlayerName(player)} 胜利！五连在${getDirectionName(dr, dc)}方向`, this.winLine);
        return true;
      }
    }

    return false;
  }


  /**
   * 计算指定方向的连子数
   * @param {number} row - 起始行
   * @param {number} col - 起始列
   * @param {number} dr - 行方向 (-1/0/1)
   * @param {number} dc - 列方向 (-1/0/1)
   * @param {string} player - 玩家标识
   * @returns {number} 连子数量
   */
  countDirection(row, col, dr, dc, player) {
    let count = 0;
    let r = row + dr;
    let c = col + dc;

    while (isValidPosition(r, c) && this.board.grid[r][c] === player) {
      count++;
      r += dr;
      c += dc;
    }

    return count;
  }


  /**
   * 获取五连线的所有坐标
   * @param {number} row - 中心行
   * @param {number} col - 中心列
   * @param {number} dr - 行方向
   * @param {number} dc - 列方向
   * @param {string} player - 玩家标识
   * @param {number} totalCount - 总连子数
   * @returns {Array} 五连线坐标数组
   */
  getWinLine(row, col, dr, dc, player, totalCount) {
    const line = [{row, col}];

    // 正方向
    let r = row + dr;
    let c = col + dc;
    while (isValidPosition(r, c) && this.board.grid[r][c] === player) {
      line.push({row: r, col: c});
      r += dr;
      c += dc;
    }

    // 反方向
    r = row - dr;
    c = col - dc;
    while (isValidPosition(r, c) && this.board.grid[r][c] === player) {
      line.unshift({row: r, col: c});
      r -= dr;
      c -= dc;
    }

    // 只返回前5个（标准五连）
    return line.slice(0, 5);
  }


  /**
   * 检查是否平局（棋盘满）
   * @returns {boolean} 是否平局
   */
  checkDraw() {
    return this.board.isFull();
  }


  /**
   * 处理游戏结束
   * @param {string|null} winner - 胜者 (null表示平局)
   */
  handleGameOver(winner) {
    if (winner) {
      this.winner = winner;
      this.gameState = winner === CONSTANTS.PLAYER_BLACK ?
        CONSTANTS.STATE_BLACK_WIN :
        CONSTANTS.STATE_WHITE_WIN;
      Logger.game(`游戏结束: ${getPlayerName(winner)} 胜利！`);
    } else {
      this.winner = null;
      this.gameState = CONSTANTS.STATE_DRAW;
      Logger.game('游戏结束: 平局');
    }

    // 触发回调
    if (this.onGameStateChange) {
      this.onGameStateChange(this.gameState);
    }

    if (this.onGameOver) {
      this.onGameOver(this.winner, this.winLine);
    }
  }


  /**
   * 设置AI实例
   * @param {AI} ai - AI实例
   */
  setAI(ai) {
    this.ai = ai;
    Logger.info('AI引擎已设置', {difficulty: ai.difficulty});
  }


  /**
   * 设置回调函数
   * @param {Object} callbacks - 回调函数对象
   */
  setCallbacks(callbacks) {
    if (callbacks.onGameStateChange) {
      this.onGameStateChange = callbacks.onGameStateChange;
    }
    if (callbacks.onPlayerChange) {
      this.onPlayerChange = callbacks.onPlayerChange;
    }
    if (callbacks.onGameOver) {
      this.onGameOver = callbacks.onGameOver;
    }
  }


  /**
   * 获取游戏统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const boardStats = this.board.getStats();
    return {
      ...boardStats,
      gameState: this.gameState,
      currentPlayer: this.currentPlayer,
      difficulty: this.difficulty,
      playerSide: this.playerSide,
      aiSide: this.aiSide,
      winner: this.winner
    };
  }


  /**
   * 检查当前是否轮到玩家
   * @returns {boolean} 是否轮到玩家
   */
  isPlayerTurn() {
    return this.currentPlayer === this.playerSide &&
           this.gameState === CONSTANTS.STATE_PLAYING &&
           !this.isAiThinking;
  }


  /**
   * 销毁游戏（清理资源）
   */
  destroy() {
    if (this.board) {
      this.board.destroy();
    }
    this.board = null;
    this.ai = null;
    this.onGameStateChange = null;
    this.onPlayerChange = null;
    this.onGameOver = null;
    Logger.info('游戏引擎已销毁');
  }
}

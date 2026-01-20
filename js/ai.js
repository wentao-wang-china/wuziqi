/**
 * 五子棋游戏 - AI引擎
 * 基于Minimax算法 + Alpha-Beta剪枝
 * 支持三档难度：easy(1层) / medium(2层) / hard(3层)
 */

class AI {
  /**
   * 构造函数
   * @param {string} difficulty - 难度级别 ('easy'/'medium'/'hard')
   * @param {string} aiPlayer - AI执子颜色 ('black'/'white')
   */
  constructor(difficulty = CONSTANTS.DIFFICULTY.MEDIUM, aiPlayer = CONSTANTS.PLAYER_WHITE) {
    // AI配置
    this.difficulty = difficulty;
    this.maxDepth = CONSTANTS.AI_DEPTH[difficulty]; // 搜索深度
    this.player = aiPlayer;                         // AI执子颜色
    this.opponent = getOpponent(aiPlayer);          // 对手颜色

    // 性能统计
    this.searchCount = 0;                           // 搜索节点计数
    this.searchTime = 0;                            // 搜索耗时
    this.pruneCount = 0;                            // 剪枝次数

    // 候选点生成配置
    this.searchRange = 2;                           // 搜索半径（已落子周围2格）
    this.maxCandidates = 20;                        // 候选点数量上限

    Logger.info('AI引擎初始化完成', {
      difficulty,
      maxDepth: this.maxDepth,
      player: aiPlayer
    });
  }


  /**
   * 获取AI的最佳落子点（主入口）
   * @param {Board} board - 当前棋盘状态
   * @returns {{row: number, col: number}} 最佳位置
   */
  getBestMove(board) {
    const timer = Timer.start('ai-search');
    this.searchCount = 0;
    this.pruneCount = 0;

    Logger.ai('开始AI搜索', {difficulty: this.difficulty, depth: this.maxDepth});

    // 第一步：落在中心位置
    if (board.history.length === 0) {
      const center = Math.floor(board.size / 2);
      Logger.ai('首步落子中心', {row: center, col: center});
      return {row: center, col: center};
    }

    // 第二步：检查必杀点（己方四连或对手四连）
    const criticalMove = this.findCriticalMove(board);
    if (criticalMove) {
      Logger.ai('发现必杀点', criticalMove);
      this.searchTime = Timer.end(timer);
      return criticalMove;
    }

    // 第三步：Minimax搜索最佳落子点
    const candidates = this.getCandidateMoves(board);
    Logger.ai(`候选点数量: ${candidates.length}`);

    if (candidates.length === 0) {
      Logger.warn('没有可用的候选点');
      return null;
    }

    let bestMove = null;
    let bestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;

    // 遍历所有候选点
    for (let move of candidates) {
      // 尝试落子
      board.makeMove(move.row, move.col, this.player);

      // 从对手角度评估（Min层）
      const score = this.minimax(board, this.maxDepth - 1, alpha, beta, false);

      // 撤销落子
      board.undoMove();

      // 更新最佳分数
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

      // 更新alpha值
      alpha = Math.max(alpha, score);
    }

    this.searchTime = Timer.end(timer);

    Logger.ai('AI搜索完成', {
      bestMove,
      bestScore,
      searchCount: this.searchCount,
      pruneCount: this.pruneCount,
      searchTime: `${this.searchTime}ms`
    });

    return bestMove;
  }


  /**
   * Minimax算法核心 + Alpha-Beta剪枝
   * @param {Board} board - 棋盘状态
   * @param {number} depth - 当前搜索深度
   * @param {number} alpha - Alpha值（最大化下界）
   * @param {number} beta - Beta值（最小化上界）
   * @param {boolean} isMaximizing - 是否是最大化节点（AI回合）
   * @returns {number} 评估分数
   */
  minimax(board, depth, alpha, beta, isMaximizing) {
    this.searchCount++;

    // 终止条件1: 深度为0
    if (depth === 0) {
      return this.evaluate(board);
    }

    // 终止条件2: 游戏结束（检查胜负）
    const lastMove = board.lastMove;
    if (lastMove) {
      // 检查最后一步是否导致胜利
      if (this.checkWin(board, lastMove.row, lastMove.col, this.player)) {
        return CONSTANTS.PATTERN_SCORES.FIVE;  // AI胜利
      }
      if (this.checkWin(board, lastMove.row, lastMove.col, this.opponent)) {
        return -CONSTANTS.PATTERN_SCORES.FIVE; // 玩家胜利
      }
    }

    // 获取候选落子点
    const candidates = this.getCandidateMoves(board);
    if (candidates.length === 0) {
      return 0; // 平局
    }

    if (isMaximizing) {
      // AI回合，最大化分数
      let maxEval = -Infinity;

      for (let move of candidates) {
        // 尝试落子
        board.makeMove(move.row, move.col, this.player);

        // 递归搜索
        const evaluation = this.minimax(board, depth - 1, alpha, beta, false);

        // 撤销落子
        board.undoMove();

        // 更新最大值
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        // Beta剪枝
        if (beta <= alpha) {
          this.pruneCount++;
          break;
        }
      }

      return maxEval;

    } else {
      // 玩家回合，最小化分数
      let minEval = Infinity;

      for (let move of candidates) {
        // 尝试落子
        board.makeMove(move.row, move.col, this.opponent);

        // 递归搜索
        const evaluation = this.minimax(board, depth - 1, alpha, beta, true);

        // 撤销落子
        board.undoMove();

        // 更新最小值
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        // Alpha剪枝
        if (beta <= alpha) {
          this.pruneCount++;
          break;
        }
      }

      return minEval;
    }
  }


  /**
   * 评估棋盘局面分数
   * @param {Board} board - 棋盘状态
   * @returns {number} 评估分数（正数有利于AI，负数有利于玩家）
   */
  evaluate(board) {
    let score = 0;

    // 评估AI方（进攻）
    score += this.evaluatePlayer(board, this.player);

    // 评估对手方（防守，权重略低）
    score -= this.evaluatePlayer(board, this.opponent) * 0.9;

    return score;
  }


  /**
   * 评估某一方的分数
   * @param {Board} board - 棋盘状态
   * @param {string} player - 玩家颜色
   * @returns {number} 评估分数
   */
  evaluatePlayer(board, player) {
    let score = 0;
    const size = board.size;
    const directions = CONSTANTS.DIRECTIONS;

    // 遍历所有位置
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board.grid[row][col] !== player) continue;

        // 检查四个方向
        for (let [dr, dc] of directions) {
          const pattern = this.getPattern(board, row, col, dr, dc, player);
          score += this.getPatternScore(pattern);
        }
      }
    }

    return score;
  }


  /**
   * 获取某个位置某个方向的连子模式
   * @param {Board} board - 棋盘
   * @param {number} row - 起始行
   * @param {number} col - 起始列
   * @param {number} dr - 行方向
   * @param {number} dc - 列方向
   * @param {string} player - 玩家颜色
   * @returns {object} 模式对象 {count, openEnds}
   */
  getPattern(board, row, col, dr, dc, player) {
    let count = 1; // 当前位置算1个
    let openEnds = 0; // 开放端点数（0/1/2）

    // 正方向统计
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < board.size && c >= 0 && c < board.size &&
           board.grid[r][c] === player) {
      count++;
      r += dr;
      c += dc;
    }
    // 检查正方向是否开放
    if (r >= 0 && r < board.size && c >= 0 && c < board.size &&
        board.grid[r][c] === null) {
      openEnds++;
    }

    // 反方向统计
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < board.size && c >= 0 && c < board.size &&
           board.grid[r][c] === player) {
      count++;
      r -= dr;
      c -= dc;
    }
    // 检查反方向是否开放
    if (r >= 0 && r < board.size && c >= 0 && c < board.size &&
        board.grid[r][c] === null) {
      openEnds++;
    }

    return {count, openEnds};
  }


  /**
   * 获取连子模式的评分
   * @param {object} pattern - 模式对象 {count, openEnds}
   * @returns {number} 评分
   */
  getPatternScore(pattern) {
    const {count, openEnds} = pattern;
    const scores = CONSTANTS.PATTERN_SCORES;

    // 五连及以上
    if (count >= 5) return scores.FIVE;

    // 活四（两端开放）
    if (count === 4 && openEnds === 2) return scores.LIVE_FOUR;

    // 冲四（一端开放）
    if (count === 4 && openEnds === 1) return scores.RUSH_FOUR;

    // 活三（两端开放）
    if (count === 3 && openEnds === 2) return scores.LIVE_THREE;

    // 眠三（一端开放）
    if (count === 3 && openEnds === 1) return scores.SLEEP_THREE;

    // 活二（两端开放）
    if (count === 2 && openEnds === 2) return scores.LIVE_TWO;

    // 眠二（一端开放）
    if (count === 2 && openEnds === 1) return scores.SLEEP_TWO;

    // 单子
    if (count === 1) return scores.ONE;

    return 0;
  }


  /**
   * 获取候选落子点（性能优化关键）
   * 只搜索已有棋子周围searchRange格范围内的空位
   * @param {Board} board - 棋盘
   * @returns {Array} 候选点数组 [{row, col}, ...]
   */
  getCandidateMoves(board) {
    const candidates = new Set();
    const range = this.searchRange;

    // 如果棋盘为空，返回中心点
    if (board.history.length === 0) {
      const center = Math.floor(board.size / 2);
      return [{row: center, col: center}];
    }

    // 遍历所有已落子位置
    for (let {row, col} of board.history) {
      // 搜索周围range格内的空位
      for (let dr = -range; dr <= range; dr++) {
        for (let dc = -range; dc <= range; dc++) {
          const r = row + dr;
          const c = col + dc;

          // 检查位置有效性
          if (r >= 0 && r < board.size &&
              c >= 0 && c < board.size &&
              board.grid[r][c] === null) {
            candidates.add(`${r},${c}`);
          }
        }
      }
    }

    // 转换为坐标数组
    let candidateArray = Array.from(candidates).map(key => {
      const [row, col] = key.split(',').map(Number);
      return {row, col};
    });

    // 启发式排序：优先搜索中心区域（可选优化）
    const center = Math.floor(board.size / 2);
    candidateArray.sort((a, b) => {
      const distA = Math.abs(a.row - center) + Math.abs(a.col - center);
      const distB = Math.abs(b.row - center) + Math.abs(b.col - center);
      return distA - distB;
    });

    // 限制候选点数量（性能优化）
    if (candidateArray.length > this.maxCandidates) {
      candidateArray = candidateArray.slice(0, this.maxCandidates);
    }

    return candidateArray;
  }


  /**
   * 查找必杀点（最高优先级）
   * - AI己方四连：必须立即完成五连
   * - 对手四连：必须立即防守
   * @param {Board} board - 棋盘
   * @returns {{row: number, col: number}|null} 必杀点或null
   */
  findCriticalMove(board) {
    // 先检查己方四连（进攻优先）
    let move = this.findWinningMove(board, this.player);
    if (move) {
      Logger.ai('发现己方四连，准备获胜', move);
      return move;
    }

    // 再检查对手四连（防守）
    move = this.findWinningMove(board, this.opponent);
    if (move) {
      Logger.ai('发现对手四连，必须防守', move);
      return move;
    }

    return null;
  }


  /**
   * 查找能一步获胜的位置
   * @param {Board} board - 棋盘
   * @param {string} player - 玩家颜色
   * @returns {{row: number, col: number}|null} 获胜位置或null
   */
  findWinningMove(board, player) {
    const candidates = this.getCandidateMoves(board);

    for (let move of candidates) {
      // 尝试落子
      board.makeMove(move.row, move.col, player);

      // 检查是否获胜
      const isWin = this.checkWin(board, move.row, move.col, player);

      // 撤销落子
      board.undoMove();

      if (isWin) {
        return move;
      }
    }

    return null;
  }


  /**
   * 检查某个位置是否形成五连
   * @param {Board} board - 棋盘
   * @param {number} row - 行
   * @param {number} col - 列
   * @param {string} player - 玩家颜色
   * @returns {boolean} 是否五连
   */
  checkWin(board, row, col, player) {
    const directions = CONSTANTS.DIRECTIONS;

    for (let [dr, dc] of directions) {
      let count = 1; // 当前位置算1个

      // 正方向统计
      count += this.countDirection(board, row, col, dr, dc, player);

      // 反方向统计
      count += this.countDirection(board, row, col, -dr, -dc, player);

      if (count >= 5) {
        return true;
      }
    }

    return false;
  }


  /**
   * 统计某个方向的连子数
   * @param {Board} board - 棋盘
   * @param {number} row - 起始行
   * @param {number} col - 起始列
   * @param {number} dr - 行方向
   * @param {number} dc - 列方向
   * @param {string} player - 玩家颜色
   * @returns {number} 连子数
   */
  countDirection(board, row, col, dr, dc, player) {
    let count = 0;
    let r = row + dr;
    let c = col + dc;

    while (r >= 0 && r < board.size &&
           c >= 0 && c < board.size &&
           board.grid[r][c] === player) {
      count++;
      r += dr;
      c += dc;
    }

    return count;
  }


  /**
   * 设置AI难度
   * @param {string} difficulty - 难度级别
   */
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.maxDepth = CONSTANTS.AI_DEPTH[difficulty];
    Logger.info('AI难度已更新', {difficulty, maxDepth: this.maxDepth});
  }


  /**
   * 获取AI统计信息
   * @returns {object} 统计信息
   */
  getStats() {
    return {
      difficulty: this.difficulty,
      maxDepth: this.maxDepth,
      searchCount: this.searchCount,
      pruneCount: this.pruneCount,
      searchTime: this.searchTime
    };
  }
}

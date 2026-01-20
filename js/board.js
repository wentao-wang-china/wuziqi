/**
 * 五子棋游戏 - 棋盘系统
 * 负责棋盘渲染、坐标转换、状态管理
 */

class Board {
  /**
   * 构造函数
   * @param {number} size - 棋盘大小（默认15x15）
   */
  constructor(size = CONSTANTS.BOARD_SIZE) {
    // 棋盘配置
    this.size = size;                          // 棋盘大小
    this.cellSize = CONSTANTS.CELL_SIZE;       // 格子大小（像素）
    this.padding = CONSTANTS.PADDING;          // 边距（像素）

    // Canvas元素
    this.canvas = null;                        // Canvas DOM元素
    this.ctx = null;                           // Canvas 2D上下文

    // 棋盘状态
    this.grid = [];                            // 二维数组 [row][col]
    this.history = [];                         // 历史记录 [{row, col, player}]
    this.lastMove = null;                      // 最后一手 {row, col}

    // 性能优化: 静态层缓存
    this.staticCanvas = null;                  // 静态背景Canvas（网格线）
    this.staticCtx = null;

    // 动画相关
    this.animationFrame = null;                // 动画帧ID
    this.isAnimating = false;                  // 是否正在动画
  }


  /**
   * 初始化棋盘
   * @param {string} canvasId - Canvas元素ID
   */
  init(canvasId = 'gameCanvas') {
    // 获取Canvas元素
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      Logger.error(`Canvas元素 #${canvasId} 不存在`);
      return false;
    }

    // 获取2D上下文
    this.ctx = this.canvas.getContext('2d');

    // 创建静态层Canvas（用于缓存网格线）
    this.createStaticCanvas();

    // 初始化棋盘数据
    this.initGrid();

    // 绘制初始棋盘
    this.render();

    Logger.info('棋盘初始化完成', {size: this.size});
    return true;
  }


  /**
   * 创建静态背景Canvas（性能优化）
   */
  createStaticCanvas() {
    this.staticCanvas = document.createElement('canvas');
    this.staticCanvas.width = this.canvas.width;
    this.staticCanvas.height = this.canvas.height;
    this.staticCtx = this.staticCanvas.getContext('2d');

    // 绘制网格线到静态层
    this.drawGridToStatic();
  }


  /**
   * 初始化棋盘数据（二维数组）
   */
  initGrid() {
    this.grid = [];
    for (let row = 0; row < this.size; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.size; col++) {
        this.grid[row][col] = null;  // null表示空位
      }
    }
    this.history = [];
    this.lastMove = null;
  }


  /**
   * 重置棋盘（清空所有棋子）
   */
  reset() {
    this.initGrid();
    this.render();
    Logger.game('棋盘已重置');
  }


  /**
   * 完整渲染棋盘
   */
  render() {
    // 清空Canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制静态层（网格线）
    this.ctx.drawImage(this.staticCanvas, 0, 0);

    // 绘制所有棋子
    this.drawStones();

    // 绘制最后一手标记
    if (this.lastMove) {
      this.drawLastMoveMarker();
    }
  }


  /**
   * 绘制网格线到静态Canvas（只执行一次）
   */
  drawGridToStatic() {
    const ctx = this.staticCtx;

    // 设置发光效果
    ctx.strokeStyle = CONSTANTS.COLORS.GRID_COLOR;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = CONSTANTS.COLORS.GRID_COLOR;

    // 绘制横线
    for (let i = 0; i < this.size; i++) {
      const y = this.padding + i * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(this.padding, y);
      ctx.lineTo(this.padding + (this.size - 1) * this.cellSize, y);
      ctx.stroke();
    }

    // 绘制竖线
    for (let i = 0; i < this.size; i++) {
      const x = this.padding + i * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(x, this.padding);
      ctx.lineTo(x, this.padding + (this.size - 1) * this.cellSize);
      ctx.stroke();
    }

    // 绘制天元和星位（标准五子棋）
    this.drawStarPoints(ctx);

    // 重置阴影
    ctx.shadowBlur = 0;
  }


  /**
   * 绘制星位（天元+四个星）
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  drawStarPoints(ctx) {
    const starPositions = [
      [7, 7],   // 天元（中心）
      [3, 3],   // 左上星
      [3, 11],  // 右上星
      [11, 3],  // 左下星
      [11, 11]  // 右下星
    ];

    ctx.fillStyle = CONSTANTS.COLORS.GRID_COLOR;
    ctx.shadowBlur = 5;
    ctx.shadowColor = CONSTANTS.COLORS.GRID_COLOR;

    starPositions.forEach(([row, col]) => {
      const {x, y} = this.getCellCenter(row, col);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
  }


  /**
   * 绘制所有棋子
   */
  drawStones() {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const player = this.grid[row][col];
        if (player) {
          this.drawStone(row, col, player);
        }
      }
    }
  }


  /**
   * 绘制单个棋子（带渐变发光效果）
   * @param {number} row - 行坐标
   * @param {number} col - 列坐标
   * @param {string} player - 玩家标识 ('black' or 'white')
   */
  drawStone(row, col, player) {
    const {x, y} = this.getCellCenter(row, col);
    const radius = this.cellSize * 0.4;  // 棋子半径

    // 创建径向渐变
    const gradient = this.ctx.createRadialGradient(
      x - radius * 0.3, y - radius * 0.3, 0,
      x, y, radius
    );

    if (player === CONSTANTS.PLAYER_BLACK) {
      // 黑子：紫色渐变
      gradient.addColorStop(0, '#b366ff');                // 中心亮紫
      gradient.addColorStop(0.5, CONSTANTS.COLORS.STONE_BLACK);  // 中间紫
      gradient.addColorStop(1, '#2a0055');                // 边缘暗紫
      this.ctx.shadowColor = CONSTANTS.COLORS.STONE_BLACK;
    } else {
      // 白子：青色渐变
      gradient.addColorStop(0, '#66f3ff');                // 中心亮青
      gradient.addColorStop(0.5, CONSTANTS.COLORS.STONE_WHITE);  // 中间青
      gradient.addColorStop(1, '#00333a');                // 边缘暗青
      this.ctx.shadowColor = CONSTANTS.COLORS.STONE_WHITE;
    }

    // 绘制发光效果
    this.ctx.shadowBlur = 20;
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // 重置阴影
    this.ctx.shadowBlur = 0;
  }


  /**
   * 绘制最后一手标记
   */
  drawLastMoveMarker() {
    if (!this.lastMove) return;

    const {x, y} = this.getCellCenter(this.lastMove.row, this.lastMove.col);
    const radius = this.cellSize * 0.15;

    // 绘制小圆圈标记
    this.ctx.strokeStyle = CONSTANTS.COLORS.NEON_PINK;
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = CONSTANTS.COLORS.NEON_PINK;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.shadowBlur = 0;
  }


  /**
   * 绘制悬停预览（半透明棋子）
   * @param {number} row - 行坐标
   * @param {number} col - 列坐标
   * @param {string} player - 玩家标识
   */
  drawHoverPreview(row, col, player) {
    if (!isValidPosition(row, col) || this.grid[row][col] !== null) {
      return;
    }

    const {x, y} = this.getCellCenter(row, col);
    const radius = this.cellSize * 0.4;

    // 半透明绘制
    this.ctx.globalAlpha = CONSTANTS.ANIMATION.HOVER_ALPHA;

    const color = player === CONSTANTS.PLAYER_BLACK ?
      CONSTANTS.COLORS.STONE_BLACK :
      CONSTANTS.COLORS.STONE_WHITE;

    this.ctx.fillStyle = color;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = color;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // 重置
    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;
  }


  /**
   * 获取格子中心像素坐标
   * @param {number} row - 行坐标
   * @param {number} col - 列坐标
   * @returns {{x: number, y: number}} 像素坐标
   */
  getCellCenter(row, col) {
    return {
      x: this.padding + col * this.cellSize,
      y: this.padding + row * this.cellSize
    };
  }


  /**
   * 将鼠标坐标转换为棋盘坐标
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   * @returns {{row: number, col: number}|null} 棋盘坐标，如果超出范围返回null
   */
  getCellFromPosition(mouseX, mouseY) {
    // 获取Canvas相对位置
    const rect = this.canvas.getBoundingClientRect();
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;

    // 计算最近的格子
    const col = Math.round((x - this.padding) / this.cellSize);
    const row = Math.round((y - this.padding) / this.cellSize);

    // 验证范围
    if (!isValidPosition(row, col)) {
      return null;
    }

    // 检查是否在有效点击范围内（离格子中心不超过半个格子）
    const {x: centerX, y: centerY} = this.getCellCenter(row, col);
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    if (distance > this.cellSize * 0.5) {
      return null;
    }

    return {row, col};
  }


  /**
   * 检查位置是否可以落子
   * @param {number} row - 行坐标
   * @param {number} col - 列坐标
   * @returns {boolean} 是否可以落子
   */
  isValidMove(row, col) {
    if (!isValidPosition(row, col)) {
      return false;
    }
    return this.grid[row][col] === null;
  }


  /**
   * 落子
   * @param {number} row - 行坐标
   * @param {number} col - 列坐标
   * @param {string} player - 玩家标识
   * @returns {boolean} 是否成功落子
   */
  makeMove(row, col, player) {
    if (!this.isValidMove(row, col)) {
      Logger.warn('无效落子位置', {row, col});
      return false;
    }

    // 更新棋盘状态
    this.grid[row][col] = player;

    // 记录历史
    this.history.push({row, col, player});

    // 更新最后一手
    this.lastMove = {row, col};

    // 重新渲染
    this.render();

    Logger.game(`${getPlayerName(player)} 落子`, {row, col, total: this.history.length});
    return true;
  }


  /**
   * 悔棋（撤销最后一步）
   * @returns {Object|null} 被撤销的落子信息，如果没有可撤销的返回null
   */
  undoMove() {
    if (this.history.length === 0) {
      Logger.warn('没有可撤销的落子');
      return null;
    }

    // 取出最后一手
    const lastMove = this.history.pop();

    // 清除棋盘上的棋子
    this.grid[lastMove.row][lastMove.col] = null;

    // 更新最后一手标记
    if (this.history.length > 0) {
      const prev = this.history[this.history.length - 1];
      this.lastMove = {row: prev.row, col: prev.col};
    } else {
      this.lastMove = null;
    }

    // 重新渲染
    this.render();

    Logger.game('悔棋', lastMove);
    return lastMove;
  }


  /**
   * 获取棋盘状态的深拷贝（用于AI搜索）
   * @returns {Array} 棋盘状态数组
   */
  getGridCopy() {
    return deepClone(this.grid);
  }


  /**
   * 检查棋盘是否已满
   * @returns {boolean} 是否已满
   */
  isFull() {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col] === null) {
          return false;
        }
      }
    }
    return true;
  }


  /**
   * 获取所有空位
   * @returns {Array} 空位数组 [{row, col}, ...]
   */
  getEmptyPositions() {
    const positions = [];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col] === null) {
          positions.push({row, col});
        }
      }
    }
    return positions;
  }


  /**
   * 获取棋盘统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    let blackCount = 0;
    let whiteCount = 0;
    let emptyCount = 0;

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const cell = this.grid[row][col];
        if (cell === CONSTANTS.PLAYER_BLACK) blackCount++;
        else if (cell === CONSTANTS.PLAYER_WHITE) whiteCount++;
        else emptyCount++;
      }
    }

    return {
      blackCount,
      whiteCount,
      emptyCount,
      totalMoves: this.history.length
    };
  }


  /**
   * 销毁棋盘（清理资源）
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.grid = null;
    this.history = null;
    this.canvas = null;
    this.ctx = null;
    this.staticCanvas = null;
    this.staticCtx = null;
    Logger.info('棋盘已销毁');
  }
}

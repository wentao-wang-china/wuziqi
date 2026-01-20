/**
 * 五子棋游戏 - 工具函数库
 * 提供常量定义、通用工具函数和辅助函数
 */

// ============================================
// 1. 常量定义
// ============================================

/**
 * 游戏常量
 */
const CONSTANTS = {
  // 棋盘配置
  BOARD_SIZE: 15,              // 棋盘大小 15x15
  CELL_SIZE: 40,               // 单元格大小（像素）
  PADDING: 30,                 // 棋盘边距（像素）

  // 玩家标识
  PLAYER_BLACK: 'black',       // 黑子（玩家通常执黑）
  PLAYER_WHITE: 'white',       // 白子（AI通常执白）

  // 游戏状态
  STATE_PLAYING: 'playing',    // 游戏进行中
  STATE_BLACK_WIN: 'blackWin', // 黑方胜利
  STATE_WHITE_WIN: 'whiteWin', // 白方胜利
  STATE_DRAW: 'draw',          // 平局

  // AI难度级别
  DIFFICULTY: {
    EASY: 'easy',              // 低难度: 搜索深度1层
    MEDIUM: 'medium',          // 中难度: 搜索深度2层
    HARD: 'hard'               // 高难度: 搜索深度3层
  },

  // AI搜索深度配置
  AI_DEPTH: {
    easy: 1,
    medium: 2,
    hard: 3
  },

  // 方向向量（用于五连判定）
  DIRECTIONS: [
    [0, 1],   // 水平 →
    [1, 0],   // 垂直 ↓
    [1, 1],   // 右下斜 ↘
    [1, -1]   // 左下斜 ↙
  ],

  // 连子评分（AI评估函数使用）
  PATTERN_SCORES: {
    FIVE: 100000,              // 五连
    LIVE_FOUR: 10000,          // 活四（两端开放）
    RUSH_FOUR: 1000,           // 冲四（一端开放）
    LIVE_THREE: 1000,          // 活三
    SLEEP_THREE: 100,          // 眠三
    LIVE_TWO: 100,             // 活二
    SLEEP_TWO: 10,             // 眠二
    ONE: 1                     // 单子
  },

  // 颜色配置（赛博朋克主题）
  COLORS: {
    NEON_BLUE: '#00f3ff',
    NEON_PINK: '#ff006e',
    NEON_PURPLE: '#8000ff',
    NEON_GREEN: '#39ff14',
    BG_DARK: '#0a0e27',
    BG_DARKER: '#050714',
    GRID_COLOR: '#00f3ff',
    STONE_BLACK: '#8000ff',    // 黑子紫色
    STONE_WHITE: '#00f3ff'     // 白子青色
  },

  // 动画配置
  ANIMATION: {
    STONE_DURATION: 300,       // 落子动画时长（毫秒）
    WIN_DURATION: 2000,        // 胜利动画时长
    HOVER_ALPHA: 0.3           // 悬停预览透明度
  },

  // 性能优化配置
  PERFORMANCE: {
    MAX_CANDIDATES: 20,        // AI候选点最大数量
    SEARCH_RANGE: 2,           // 候选点搜索半径
    MAX_AI_TIME: 5000          // AI最大思考时间（毫秒）
  }
};


// ============================================
// 2. 工具函数
// ============================================

/**
 * 延迟函数（异步）
 * @param {number} ms - 延迟时间（毫秒）
 * @returns {Promise} Promise对象
 *
 * @example
 * await delay(1000); // 延迟1秒
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * 深拷贝函数
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 深拷贝后的对象
 *
 * @example
 * const copy = deepClone(board.grid);
 */
function deepClone(obj) {
  // 处理null和基本类型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  // 处理普通对象
  const clonedObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj;
}


/**
 * 日志工具类
 */
const Logger = {
  // 是否启用调试模式
  debugMode: true,

  /**
   * 普通日志
   * @param {string} message - 日志信息
   * @param {*} data - 附加数据
   */
  log(message, data = null) {
    if (this.debugMode) {
      console.log(`[LOG] ${message}`, data !== null ? data : '');
    }
  },

  /**
   * 信息日志
   * @param {string} message - 日志信息
   * @param {*} data - 附加数据
   */
  info(message, data = null) {
    if (this.debugMode) {
      console.info(`[INFO] ${message}`, data !== null ? data : '');
    }
  },

  /**
   * 警告日志
   * @param {string} message - 警告信息
   * @param {*} data - 附加数据
   */
  warn(message, data = null) {
    console.warn(`[WARN] ${message}`, data !== null ? data : '');
  },

  /**
   * 错误日志
   * @param {string} message - 错误信息
   * @param {*} error - 错误对象
   */
  error(message, error = null) {
    console.error(`[ERROR] ${message}`, error !== null ? error : '');
  },

  /**
   * 游戏事件日志
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  game(event, data = null) {
    if (this.debugMode) {
      console.log(`[GAME] ${event}`, data !== null ? data : '');
    }
  },

  /**
   * AI日志
   * @param {string} message - AI信息
   * @param {*} data - 附加数据
   */
  ai(message, data = null) {
    if (this.debugMode) {
      console.log(`[AI] ${message}`, data !== null ? data : '');
    }
  }
};


/**
 * 性能计时器
 */
const Timer = {
  // 存储计时器
  timers: {},

  /**
   * 开始计时
   * @param {string} name - 计时器名称
   */
  start(name) {
    this.timers[name] = performance.now();
  },

  /**
   * 结束计时并返回耗时
   * @param {string} name - 计时器名称
   * @returns {number} 耗时（毫秒）
   */
  end(name) {
    if (!this.timers[name]) {
      Logger.warn(`计时器 "${name}" 不存在`);
      return 0;
    }

    const duration = performance.now() - this.timers[name];
    delete this.timers[name];
    return duration;
  },

  /**
   * 结束计时并打印日志
   * @param {string} name - 计时器名称
   * @returns {number} 耗时（毫秒）
   */
  endAndLog(name) {
    const duration = this.end(name);
    Logger.info(`${name} 耗时: ${formatTime(duration)}`);
    return duration;
  }
};


// ============================================
// 3. 辅助函数
// ============================================

/**
 * 格式化时间
 * @param {number} ms - 毫秒数
 * @returns {string} 格式化后的时间字符串
 *
 * @example
 * formatTime(1234) // "1.23s"
 * formatTime(123)  // "123ms"
 */
function formatTime(ms) {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}


/**
 * 验证位置是否在棋盘范围内
 * @param {number} row - 行坐标
 * @param {number} col - 列坐标
 * @param {number} size - 棋盘大小（默认15）
 * @returns {boolean} 是否有效
 *
 * @example
 * isValidPosition(7, 7)    // true
 * isValidPosition(-1, 5)   // false
 * isValidPosition(15, 15)  // false
 */
function isValidPosition(row, col, size = CONSTANTS.BOARD_SIZE) {
  return row >= 0 && row < size && col >= 0 && col < size;
}


/**
 * 获取方向名称
 * @param {number} dr - 行方向
 * @param {number} dc - 列方向
 * @returns {string} 方向名称
 *
 * @example
 * getDirectionName(0, 1)   // "水平"
 * getDirectionName(1, 1)   // "右下斜"
 */
function getDirectionName(dr, dc) {
  if (dr === 0 && dc === 1) return '水平';
  if (dr === 1 && dc === 0) return '垂直';
  if (dr === 1 && dc === 1) return '右下斜';
  if (dr === 1 && dc === -1) return '左下斜';
  return '未知';
}


/**
 * 获取玩家名称
 * @param {string} player - 玩家标识
 * @returns {string} 玩家名称
 *
 * @example
 * getPlayerName('black') // "黑方"
 * getPlayerName('white') // "白方"
 */
function getPlayerName(player) {
  return player === CONSTANTS.PLAYER_BLACK ? '黑方' : '白方';
}


/**
 * 获取对手
 * @param {string} player - 当前玩家
 * @returns {string} 对手玩家
 *
 * @example
 * getOpponent('black') // "white"
 * getOpponent('white') // "black"
 */
function getOpponent(player) {
  return player === CONSTANTS.PLAYER_BLACK ?
    CONSTANTS.PLAYER_WHITE :
    CONSTANTS.PLAYER_BLACK;
}


/**
 * 随机整数
 * @param {number} min - 最小值
 * @param {number} max - 最大值（不包含）
 * @returns {number} 随机整数
 *
 * @example
 * randomInt(0, 10) // 0-9之间的随机整数
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


/**
 * 打乱数组（Fisher-Yates洗牌算法）
 * @param {Array} array - 要打乱的数组
 * @returns {Array} 打乱后的数组
 *
 * @example
 * shuffle([1, 2, 3, 4, 5])
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


/**
 * 限制数值在范围内
 * @param {number} value - 数值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的数值
 *
 * @example
 * clamp(15, 0, 10) // 10
 * clamp(-5, 0, 10) // 0
 * clamp(5, 0, 10)  // 5
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}


/**
 * 计算两点之间的距离
 * @param {number} row1 - 第一个点的行坐标
 * @param {number} col1 - 第一个点的列坐标
 * @param {number} row2 - 第二个点的行坐标
 * @param {number} col2 - 第二个点的列坐标
 * @returns {number} 距离
 *
 * @example
 * distance(0, 0, 3, 4) // 5
 */
function distance(row1, col1, row2, col2) {
  return Math.sqrt((row2 - row1) ** 2 + (col2 - col1) ** 2);
}


/**
 * 计算曼哈顿距离
 * @param {number} row1 - 第一个点的行坐标
 * @param {number} col1 - 第一个点的列坐标
 * @param {number} row2 - 第二个点的行坐标
 * @param {number} col2 - 第二个点的列坐标
 * @returns {number} 曼哈顿距离
 *
 * @example
 * manhattanDistance(0, 0, 3, 4) // 7
 */
function manhattanDistance(row1, col1, row2, col2) {
  return Math.abs(row2 - row1) + Math.abs(col2 - col1);
}


/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 *
 * @example
 * const debouncedFn = debounce(() => console.log('hi'), 1000);
 * debouncedFn(); // 1秒后执行
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}


/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 *
 * @example
 * const throttledFn = throttle(() => console.log('hi'), 1000);
 */
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}


// ============================================
// 导出（如果使用ES6模块）
// ============================================

// 如果在浏览器中直接使用，这些会成为全局变量
// 如果使用ES6模块，可以取消注释以下代码：

/*
export {
  CONSTANTS,
  delay,
  deepClone,
  Logger,
  Timer,
  formatTime,
  isValidPosition,
  getDirectionName,
  getPlayerName,
  getOpponent,
  randomInt,
  shuffle,
  clamp,
  distance,
  manhattanDistance,
  debounce,
  throttle
};
*/

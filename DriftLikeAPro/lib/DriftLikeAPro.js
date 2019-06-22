// 預設設定值
const DEFAULT_CFG = {
  friction: 0.993, // 設定摩擦力
  maxSpeed: 150, // 最大速限
  showInfo: true, // 是否顯示座標
}

class DriftLikeAPro {

  // "user strict";

  /**  
   * @param {Object} target 欲產生滑動效果之 DOM 元素
   */
  constructor(target, config = DEFAULT_CFG) {
    this.config = config;
    this.target = target;
    this.infoTip = null; // 顯示座標資訊物件
    this.vectorX = 0; // X向量
    this.vectorY = 0; // Y向量
    this.lastX = this.target.offsetLeft; // 上一幀座標
    this.lastY = this.target.offsetTop; // 上一幀座標
    this.disX = 0; // 相對世界座標之偏移量X
    this.disY = 0; // 相對世界座標之偏移量Y
    this._isDragging = false; // 旗標
    this._disableDLP = false;
    this._FRICTION = this.config.friction; // 摩擦力 (0 ~ 1浮點數，越大向量衰減程度越小)
    this._MAX_SPEED = this.config.maxSpeed; // 最大速度
    this._customEffects = []; // 存放更新時要執行的自訂效果
    this._callback = () => { }; // callback
    this._init();

    return this; // 回傳此物件
  }

  // 初始化物件
  _init() {
    if (this.target._DLP) return console.warn('此元素已套用過效果!');

    this.target.style.cursor = 'grab';
    this.target.style.left = this.target.offsetLeft + 'px';
    this.target.style.top = this.target.offsetTop + 'px';
    setTimeout(() => {
      this.target.style.position = 'absolute';
    }, 100)


    this.infoTip = document.createElement('div');
    this.infoTip.style.position = 'absolute';
    this.infoTip.style.bottom = -15;
    this.infoTip.style.width = '100%';
    this.infoTip.style.color = '#0000ff';
    this.infoTip.style.fontSize = '15px';
    this.infoTip.style.textAlign = 'center';
    this.infoTip.innerHTML = 'Drift Me!';
    if (this.config.showInfo) {
      this.target.appendChild(this.infoTip);
    }

    this.target.onmousedown = this.target.ontouchstart = this._onDraggingStart.bind(this);
    this.target._DLP = this;

    DriftLikeAPro._all.push(this);
  }

  _onDraggingStart(e) {
    if (e.touches) e.clientX = e.touches[0].clientX;
    if (e.touches) e.clientY = e.touches[0].clientY;
    if (this._disableDLP) return;
    this._isDragging = true;
    this.target.style.cursor = 'grabbing';

    // 向量歸零
    this.vectorX = 0;
    this.vectorY = 0;
    this.lastX = this.target.offsetLeft;
    this.lastY = this.target.offsetTop;

    this.disX = e.clientX - this.target.offsetLeft;
    this.disY = e.clientY - this.target.offsetTop;

    document.onmousemove = document.ontouchmove = this._onMove.bind(this);
    document.onmouseup = document.ontouchend = this._onStop.bind(this);

    return false;
  }

  _onMove(e) {
    if (e.touches) e.clientX = e.touches[0].clientX;
    if (e.touches) e.clientY = e.touches[0].clientY;
    // 更新元素位置
    this.target.style.left = e.clientX - this.disX + 'px';
    this.target.style.top = e.clientY - this.disY + 'px';

    // 拖曳向量 = (當前座標 - 上一幀座標)
    this.vectorX = this.target.offsetLeft - this.lastX;
    this.vectorY = this.target.offsetTop - this.lastY;

    // 保存上一幀座標
    this.lastX = this.target.offsetLeft;
    this.lastY = this.target.offsetTop;
  }

  _onStop() {
    this._isDragging = false;
    this.target.style.cursor = 'grab';
    document.onmousemove = null;
    document.onmouseup = null;
  }

  // 飄移函式
  _calcDrift() {
    if (this._isDragging) return; // 拖曳中跳出漂移函式
    if (this.vectorX == 0 && this.vectorY == 0) return; // 向量值 = 0 跳出漂移函式

    // 限制最大速度
    this.vectorX = Math.abs(this.vectorX) > this._MAX_SPEED ?
      this._MAX_SPEED * Math.sign(this.vectorX) : this.vectorX;
    this.vectorY = Math.abs(this.vectorY) > this._MAX_SPEED ?
      this._MAX_SPEED * Math.sign(this.vectorY) : this.vectorY;

    // 向量衰減 (加速度 *= 摩擦係數)
    this.vectorX *= this._FRICTION;
    this.vectorY *= this._FRICTION;

    // 更新座標
    this.target.style.left = this.target.offsetLeft + this.vectorX + 'px';
    this.target.style.top = this.target.offsetTop + this.vectorY + 'px';

    // 向量歸零
    if (Math.abs(this.vectorX) < 0.1) this.vectorX = 0;
    if (Math.abs(this.vectorY) < 0.1) this.vectorY = 0;

    // 撞牆反彈
    if (this.target.offsetLeft >= window.innerWidth - this.target.offsetWidth) {
      this.vectorX *= -1;
      this._emit('cR'); // 右
    } else if (this.target.offsetLeft < 0) {
      this.vectorX *= -1;
      this._emit('cL'); // 左
    } else if (this.target.offsetTop >= window.innerHeight - this.target.offsetHeight) {
      this.vectorY *= -1;
      this._emit('cB'); // 下
    } else if (this.target.offsetTop < 0) {
      this.vectorY *= -1;
      this._emit('cT'); // 上
    }

    // 其它效果
    this._customEffects.forEach(func => func());

    // 顯示座標
    this._showCoordinate();

    // console.log(this.vectorX, this.vectorY);
  }

  // 座標顯示
  _showCoordinate() {
    const x = Math.floor(this.target.offsetLeft);
    const y = Math.floor(this.target.offsetTop);

    this.infoTip.innerHTML = `${x}, ${y}`;
  }

  // 加入自訂效果
  addCustomEffect(func) {
    if (typeof func === 'function')
      this._customEffects.push(func);
  }

  // 主動推播事件
  _emit(data) {
    this._callback(data);
  }

  // 事件接收器
  addEventListener(func) {
    if (typeof func !== 'function') {
      return console.error('error: param "func" is not a function');
    } else {
      this._callback = func;
    }
    return this;
  }

  // 關閉效果
  disable() {
    this._disableDLP = true;
    this.target.style.position = 'initial';
    this.infoTip.style.display = 'none';
    console.warn('disabled');
  }

  // 開啟效果
  enable() {
    this._disableDLP = false;
    this.target.style.position = 'absolute';
    this.infoTip.style.display = 'block';
    console.warn('enabled');
  }

  /* ***************** 定義靜態變數 & 方法 ***************** */

  static _all = []; // 存放所有實例
  static _isRAFUpdating = true; // 更新flag
  static _maxFPS = 144; // 最大FPS
  static _RAFthen = null;

  // // RAF 主循環函式
  static RAFUpdate() {
    requestAnimationFrame(() => {
      this.RAFUpdate();
      if (!this._isRAFUpdating) return;
      const fpsInterval = 1000 / this._maxFPS;
      const now = Date.now();
      const elapsed = now - this._RAFthen;
      if (elapsed > fpsInterval) {
        this._RAFthen = now - (elapsed % fpsInterval);
        this._all.forEach(e => e._calcDrift())
      }
    })
  }

  // 暫停更新 RAF
  static pause() {
    this._isRAFUpdating = false;
  }

  // 繼續更新 RAF
  static continue() {
    this._isRAFUpdating = true;
  }
}

/******* 某些js環境不支援 "靜態變數" 的寫法 *******/
// DriftLikeAPro._all = [];
// DriftLikeAPro._isRAFUpdating = true;
// DriftLikeAPro._maxFPS = 60;
// DriftLikeAPro._RAFthen = null;

// DriftLikeAPro.RAFUpdate = function () {
//   requestAnimationFrame(() => {
//     this.RAFUpdate();
//     const fpsInterval = 1000 / DriftLikeAPro._maxFPS;
//     const now = Date.now();
//     const elapsed = now - DriftLikeAPro._RAFthen;
//     if (elapsed > fpsInterval) {
//       DriftLikeAPro._RAFthen = now - (elapsed % fpsInterval);
//       if (!this._isRAFUpdating) return;
//       this._all.forEach(e => e._calcDrift())
//     }
//   })
// }

// DriftLikeAPro.pause = function () {
//   this._isRAFUpdating = false;
// }

// DriftLikeAPro.continue = function () {
//   this._isRAFUpdating = true;
// }
/******* 某些js環境不支援 "靜態變數" 的寫法 *******/


/************************ DEMO ************************/

window.onload = function () {
  DriftLikeAPro.RAFUpdate();

  // 遍歷DOM包含"drift"的class元素並套用效果
  const targets = document.getElementsByClassName('drift');
  for (let i = 0; i < targets.length; i++) {
    new DriftLikeAPro(targets[i]);
  }


  // DEMO
  const demoElement = document.getElementById('demoElement');
  let demo;
  document.getElementById('btnDemo1').onclick = () => {
    demo = new DriftLikeAPro(demoElement, {
      friction: 1, // 設定成無摩擦力 (不會停止)
      maxSpeed: 2.5, // 設定最大速度2.5
      showInfo: false, // 不顯示座標
    });
    document.getElementById('btnDemo2').style.display = 'inline-block';


    // 其他功能
    demo.addCustomEffect(function () {
      const avgSpeed = (Math.abs(demo.vectorX) + Math.abs(demo.vectorY)) / 2;
      demo.target.style.transform = `rotate(${avgSpeed}deg)`;
    });

    demo.addEventListener(data => {
      switch (data) {
        case 'cR': {
          console.log('撞到右邊');
          demo.target.style.borderRightColor = getHex();
          break;
        }
        case 'cL': {
          console.log('撞到左邊');
          demo.target.style.borderLeftColor = getHex();
          break;
        }
        case 'cB': {
          console.log('撞到下面');
          demo.target.style.borderBottomColor = getHex();
          break;
        }
        case 'cT': {
          console.log('撞到上面');
          demo.target.style.borderTopColor = getHex();
          break;
        }
      }
    })
  }

  function getHex() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  document.getElementById('btnDemo2').onclick = function () {
    if (demoElement._DLP) {
      if (demoElement._DLP._disableDLP) {
        this.innerHTML = '關閉效果'
        demoElement._DLP.enable();
      } else {
        this.innerHTML = '開啟效果'
        demoElement._DLP.disable();
      }
    }
  }




  /******* Class Controller *******/
  document.getElementById('classController').addEventListener('click', (e) => {
    if (DriftLikeAPro._isRAFUpdating) {
      DriftLikeAPro.pause();
      e.currentTarget.innerHTML = '繼續更新';
    } else {
      DriftLikeAPro.continue();
      e.currentTarget.innerHTML = '暫停更新';
    }
  })


  // 禁用右鍵選單
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  }, false);
  // 關閉預設拖曳事件
  document.addEventListener("dragstart", function (e) {
    e.preventDefault();
  }, false);

}
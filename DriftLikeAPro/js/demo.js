window.onload = function () {
  DriftLikeAPro.RAFUpdate();

  // 遍歷DOM包含"drift"的class元素並套用效果
  const targets = document.getElementsByClassName('drift');
  for (let i = 0; i < targets.length; i++) {
    new DriftLikeAPro(targets[i]);
  }


  /************ DEMO ************/

  // DEMO1 - 說明文字
  const readMe = document.getElementById('readMe');
  let dlpReadMe;
  document.getElementById('btnDemo1').onclick = () => {
    dlpReadMe = new DriftLikeAPro(readMe, {
      friction: 1, // 設定成無摩擦力 (不會停止)
      maxSpeed: 2, // 設定最大速度2.5
      showInfo: false, // 不顯示座標
    });
    document.getElementById('btnDemo2').style.display = 'inline-block';
    document.getElementById('btnDemo2').onclick = function () {
      if (readMe._DLP) {
        if (readMe._DLP._disableDLP) {
          this.innerHTML = '關閉效果'
          readMe._DLP.enable();
        } else {
          this.innerHTML = '開啟效果'
          readMe._DLP.disable();
        }
      }
    }
    dlpReadMe.addEventListener(data => {
      switch (data) {
        case 'cR': {
          console.log('撞到右邊');
          dlpReadMe.target.style.borderRightColor = getHex();
          break;
        }
        case 'cL': {
          console.log('撞到左邊');
          dlpReadMe.target.style.borderLeftColor = getHex();
          break;
        }
        case 'cB': {
          console.log('撞到下面');
          dlpReadMe.target.style.borderBottomColor = getHex();
          break;
        }
        case 'cT': {
          console.log('撞到上面');
          dlpReadMe.target.style.borderTopColor = getHex();
          break;
        }
      }
    })
  }


  // DEMO2 - 籃球
  const basketball = new DriftLikeAPro(document.getElementById('basketball'), {
    friction: 1,
    maxSpeed: 5,
    showInfo: false,
  });
  let rotate = 1;
  let turn = 1;
  basketball.addCustomEffect(function () {
    const avgSpeed = (Math.abs(basketball.vectorX) + Math.abs(basketball.vectorY)) / 2;
    basketball.target.style.transform = `rotate(${rotate += avgSpeed * turn}deg)`;
  });
  basketball.addEventListener(() => { turn *= -1; });

  // DEMO3 - DVD
  const dvd = new DriftLikeAPro(document.getElementById('dvd'), {
    friction: 1,
    maxSpeed: 2,
    showInfo: false,
  })
  dvd.addEventListener(() => {
    dvd.target.getElementsByTagName('img')[0].style.filter = `drop-shadow(300px 0px 0px ${getHex()})`
  })


  function getHex() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }


  /******* Class Controller *******/
  document.getElementById('classController').addEventListener('click', (e) => {
    if (DriftLikeAPro._isRAFUpdating) {
      DriftLikeAPro.pause();
      e.currentTarget.innerHTML = 'PAUSE';
    } else {
      DriftLikeAPro.continue();
      e.currentTarget.innerHTML = 'CONTINUE';
    }
  })



  /************ Misc. ************/
  // 禁用右鍵選單
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  }, false);
  // 關閉預設拖曳事件
  document.addEventListener("dragstart", function (e) {
    e.preventDefault();
  }, false);

}
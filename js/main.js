// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
  remove,
  onChildRemoved,
  get,
  onChildChanged,
  child,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// import environment variables from env.js
import {
  envApiKey,
  envAuthDomain,
  envProjectId,
  envStorageBucket,
  envMessagingSenderId,
  envApiId,
} from "./env.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: envApiKey,
  authDomain: envAuthDomain,
  projectId: envProjectId,
  storageBucket: envStorageBucket,
  messagingSenderId: envMessagingSenderId,
  appId: envApiId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global 変数
let userId;

//読み込み時の処理
if (localStorage.getItem("userId") != null) {
  userId = localStorage.getItem("userId");
} else {
  alert("ログインできていません");
  location.href = "./login.html";
}

// クリアしたら１になるフラグ。
// ゲームオーバー判定のコードで判定している。
let clearFlag = 0;

(function () {
  let canvas;
  let ctx;
  let changeCount = 0;
  let drawTimerID;
  let raiseTimerID;
  let dropTimerID;
  let blockTimerID;
  let line = [];
  let obstacle = [];
  let velocity; // 糸の上昇or下降の速さ
  let time;

  let LINE = {
    FPS: 60, // 画面更新の速さ
    CPS: 1, // 糸の操作感覚
    GRAVITY: 120, // 重力加速度
    PUSHUP: 120, // クリック中の抗力
    INITIAL_V: -60, // 初速度
    WIDTH: 2, // 曲線の幅(px)
    INVALID: -1, // 無効値
  };

  let OBSTACLE = {
    WIDTH: 24,
    HEIGHT: 270,
    ENCOUNTS: 0.7,
    INVALID: -1,
  };

  // 初期化処理(キャンバス作成,イベントハンドラ登録)
  function initialize() {
    // キャンバスを初期化
    if (canvas == null) {
      canvas = document.getElementById("field"); // canvas要素を取得
    }

    if (canvas.getContext) {
      // グラフィック描写のためのオブジェクトを取得
      if (ctx == null) {
        // 値が存在しない場合
        ctx = canvas.getContext("2d"); // 2D特化のオブジェクトを取得
      }
      ctx.fillStyle = "rgb(0,0,0)"; // 描画する色を指定
      ctx.fillRect(0, 0, canvas.width, canvas.height); // 四角形を描画するメソッドfillRect()

      ctx.font = "bold 50px 'Meiryo'"; // スタイル・サイズ・種類
      ctx.fillStyle = "rgb(255,255,255)"; // 描画する色を指定
      ctx.fillText("Click to Start", 240, 400); // ('hoge', x, y) FirefoxだとNG?
    } else {
      return;
    }

    // 糸の初速度を設定
    velocity = LINE.INITIAL_V; // 糸の上昇or下降の速さ

    // 軌跡を初期化
    line[0] = canvas.height / 2;
    for (let i = 1; i < canvas.width / 2; i++) {
      line[i] = LINE.INVALID; // ラインを無効化
    }

    // 障害物の初期化
    for (let i = 0; i < canvas.width; i++) {
      obstacle[i] = OBSTACLE.INVALID; // 障害物を無効化
    }

    // 経過時間の初期化
    time = 0;

    clearInterval(drawTimerID); // setInterval()の繰り返しを取り消す
    clearInterval(dropTimerID);
    clearInterval(raiseTimerID);
    clearTimeout(blockTimerID);

    // クリックでゲーム開始
    canvas.addEventListener("click", startGame, false);
  }

  // スマホ・タブレット or PC 判定
  function isDevicePC() {
    let ua = navigator.userAgent;
    if (
      ua.indexOf("iPhone") > 0 ||
      ua.indexOf("iPod") > 0 ||
      (ua.indexOf("Android") > 0 && ua.indexOf("Mobile") > 0) ||
      ua.indexOf("iPad") > 0 ||
      ua.indexOf("Android") > 0
    ) {
      return false;
    }
    return true;
  }

  // ゲーム開始
  function startGame() {
    ctx.fillStyle = "rgb(0,0,0)"; // 黒
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.removeEventListener("click", startGame, false); // clickしたらスタート画面を削除

    if (isDevicePC()) {
      // PCの場合
      canvas.addEventListener("mouseup", dropLine, false); // 非クリック中は下降
      canvas.addEventListener("mousedown", raiseLine, false); // クリック中は上昇
    } else {
      // それ以外
      canvas.addEventListener("click", changeRaiseDropLine, false); // タップ：上昇/下降切り替え
    }

    dropTimerID = setInterval(function () {
      velocity += (LINE.GRAVITY * 1) / LINE.FPS;
    }, LINE.CPS);
    drawTimerID = setInterval(drawDot, 1000 / LINE.FPS);
    blockTimerID = setTimeout(generateBlock, 1000 / OBSTACLE.ENCOUNTS);
  }

  // 糸の上昇
  function raiseLine(e) {
    if (!e.pageX) {
      e = event.touches[0];
    }
    if (e.button == 0) {
      clearInterval(dropTimerID);
      raiseTimerID = setInterval(function () {
        velocity -= (LINE.PUSHUP * 1) / LINE.FPS;
      }, LINE.CPS);
    }
  }

  // 糸の下降
  function dropLine(e) {
    if (!e.pageX) {
      e = this.data("e");
    }
    if (e.button == 0) {
      clearInterval(raiseTimerID);
      dropTimerID = setInterval(function () {
        velocity += (LINE.GRAVITY * 1) / LINE.FPS;
      }, LINE.CPS);
    }
  }

  // 糸の上昇,下降切り替え(スマホのみ)
  function changeRaiseDropLine() {
    clearInterval(dropTimerID);
    clearInterval(raiseTimerID);
    if (changeCount % 2 == 0) {
      raiseTimerID = setInterval(function () {
        velocity -= (LINE.PUSHUP * 1) / LINE.FPS;
      }, LINE.CPS);
    } else {
      dropTimerID = setInterval(function () {
        velocity += (LINE.GRAVITY * 1) / LINE.FPS;
      }, LINE.CPS);
    }
    changeCount++;
  }

  // 障害物の生成
  function generateBlock() {
    let height = canvas.height * Math.random();
    for (let i = 1; i <= OBSTACLE.WIDTH; i++) {
      obstacle[i] = height;
    }
    blockTimerID = setTimeout(generateBlock, 1000 / OBSTACLE.ENCOUNTS); // 1秒間隔で生成
  }

  // 画面の描画
  function drawDot() {
    // 軌跡の更新
    for (let i = 0; i < canvas.width / 2 - 1; i++) {
      line[canvas.width / 2 - 1 - i] = line[canvas.width / 2 - 1 - (i + 1)];
    }
    line[0] = velocity * (1 / LINE.FPS) + line[1];

    // 障害物の更新
    for (let i = 0; i < canvas.width - 1; i++) {
      obstacle[canvas.width - 1 - i] = obstacle[canvas.width - 1 - (i + 1)];
    }

    // 一旦黒塗り
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 軌跡の描画
    ctx.strokeStyle = "rgb(255,255,255)"; // 軌跡の色
    ctx.lineWidth = LINE.WIDTH * 3; // 軌跡の太さ
    ctx.beginPath(); // 現在のパスをリセット

    for (let i = 0; i < canvas.width / 2 - 1; i++) {
      if (line[i] != LINE.INVALID && line[i + 1] != LINE.INVALID) {
        ctx.moveTo(canvas.width / 2 - i, line[i]);
        ctx.lineTo(canvas.width / 2 - (i + 1), line[i + 1]);
      }
    }
    ctx.closePath(); // パスを閉じる
    ctx.stroke(); // 現在のパスを輪郭表示

    // 障害物の描画
    ctx.strokeStyle = "rgb(130,120,110)"; // 色を指定
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i++) {
      if (obstacle[i] != OBSTACLE.INVALID) {
        ctx.moveTo(canvas.width - i, obstacle[i] - OBSTACLE.HEIGHT);
        ctx.lineTo(canvas.width - i, obstacle[i] + OBSTACLE.HEIGHT);
      }
    }
    ctx.closePath();
    ctx.stroke();

    // ゲームオーバー判定
    if (line[0] >= canvas.height || line[0] < 0) {
      if (time > 10) {
        clearFlag = 1;
        alert("Clear!! あなたの記録は" + Math.floor(time) + "秒です");
        const msg = {
          gameNum5: "clear",
        };
        $.when(update(child(ref(db), `users/${userId}`), msg)).done(
          function () {
            setTimeout(returnTop(), 5000);
            const returnTop = function () {
              window.location.href = "./index.html";
            };
          }
        );
      } else {
        alert("残念。 あなたの記録は" + Math.floor(time) + "秒です");
      }
      resetGame();
    } else if (
      obstacle[canvas.width / 2] != OBSTACLE.INVALID &&
      obstacle[canvas.width / 2] - OBSTACLE.HEIGHT <= line[0] &&
      line[0] <= obstacle[canvas.width / 2] + OBSTACLE.HEIGHT
    ) {
      if (time > 10) {
        clearFlag = 1;
        alert("Clear!! あなたの記録は" + Math.floor(time) + "秒です");
        const msg = {
          gameNum5: "clear",
        };
        $.when(update(child(ref(db), `users/${userId}`), msg)).done(
          function () {
            setTimeout(returnTop(), 5000);
            const returnTop = function () {
              window.location.href = "./index.html";
            };
          }
        );
      } else {
        alert("残念。 あなたの記録は" + Math.floor(time) + "秒です");
      }
      resetGame();
    } else {
      time += 1 / LINE.FPS;
      // 経過時間を表示
      ctx.font = "16px";
      ctx.fillStyle = "rgb(50,250,250)";
      ctx.fillText(
        "10秒を目指せ!!   " +
          "TIME:" +
          Math.floor(time) +
          "." +
          Math.floor(10 * (time - Math.floor(time))),
        10, // x軸の位置
        50
      ); // y軸の位置
    }
  }

  // ゲームオーバー時のリセット処理
  function resetGame() {
    if (isDevicePC()) {
      // PCの場合
      canvas.removeEventListener("mouseup", dropLine, false);
      canvas.removeEventListener("mousedown", raiseLine, false);
      /////////////////////////////////////////////////////////////// タイムをFirebaseへ
    } else {
      canvas.removeEventListener("click", changeRaiseDropLine, false);
    }
    initialize(); // 初期化
  }
  // onload
  window.addEventListener("load", initialize, false);
})();

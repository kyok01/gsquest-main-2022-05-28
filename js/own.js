

//グローバル変数
let userId;

//読み込み時の処理
if (localStorage.getItem("userId") != null) {
  userId = localStorage.getItem("userId");
} else {
  alert("ログインできていません");
  location.href = "./login.html";
}

let timer = 30 * 1000;
let start = new Date();
let hour = 0;
let min = 0;
let sec = 0;
let now = 0;
let datet = 0;
function disp() {
  now = new Date();
  datet = parseInt((start.getTime() + timer - now.getTime()) / 1000);

  hour = parseInt(datet / 3600);
  min = parseInt((datet / 60) % 60);
  sec = datet % 60;

  // 数値が1桁の場合、頭に0を付けて2桁で表示する指定
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }

  // フォーマットを指定
  let timer1 = "残り " + min + ":" + sec;

  // テキストフィールドにデータを渡す処理
  document.form1.field1.value = timer1;
  console.log(timer1);

  setTimeout("disp()", 1000);
}
disp();

//自機クラス
class Own {
  constructor() {
    this.x = (field_w / 2) << 8; //初期画面の自機位置
    this.y = (field_h - 100) << 8;
    this.borderY = (field_h - 350 - 100) << 8;

    this.chara = 3; //snum  =0
    this.speed = 712; //this.speed = 256 →１px/フレーム動く

    this.move = {};
  }

  //自機の描画
  draw() {
    drawSprite(this.chara, this.x, this.y);
  }

  //自機の移動
  update() {
    this.y -= this.speed * 1.3;
    // document.body.onclick = this.y -= this.speed;
    if (this.borderY > this.y) {
      location.href = "#";
      alert("ゴール&クリア！");
      const msg = {
        gameNum6: "clear",
      };
      $.when(update(child(ref(db), `users/${userId}`), msg)).done(
        function () {
          setTimeout(returnTop(), 5000);
          const returnTop = function () {
            window.location.href = "./index.html";
          };
        }
      );

    }
  }
}

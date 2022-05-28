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

//グローバル変数
let userId;

//読み込み時の処理
if (localStorage.getItem("userId") != null) {
  userId = localStorage.getItem("userId");
} else {
  alert("ログインできていません");
  location.href = "./login.html";
}

//ランダム整数の生成
function rand(min,max){
    return Math.floor(Math.random()*(max-min+1))+min; //minからmaxの乱数が取得できる
}

//スプライトの描画
function drawSprite(snum,x,y){ 
    //spriteの要素ごとの配列番号[]をsnumとして定義する
    let sx = sprite[snum].x; //spriteのx座標
    let sy = sprite[snum].y; //spriteのy座標
    let sw = sprite[snum].w; //spriteのwidth
    let sh = sprite[snum].h; //spriteのheight

    let px = (x>>8) -sw/2; //8bit左にシフトしている(x,y)を右にシフトしなおす
    let py = (y>>8) -sh/2; //spriteの中心座標を■右上ではなく中央にすることで移動時に奥行を演出

    if(
        px+sw<camera_x || px-sw/2>=camera_x+screen_w || py+sh/2<camera_y || py-sh/2>=camera_y+screen_h
    )return; 

    vctx.drawImage(spriteImage, sx,sy,sw,sh, px,py, sw,sh);
}

//敵＆モブ共通クラス
class CharaBase{
    constructor(snum,x,y,vx,vy){
        this.sn = snum;
        this.x    = x;
        this.y    = y;
        this.vx   = vx;
        this.vy   = vy;
        this.count = 0;
    }
    update(){
        this.count++; //キャラごとに生存時間（フレーム）をもたせる

        this.x += this.vx;
        this.y += this.vy;

        if(this.x<0 || this.x>field_w<<8 || this.y<0 || this.y>field_h<<8) 
        this.df = true;  //一定範囲においてのみ描画させる
    }
    draw(){
        drawSprite(this.sn, this.x, this.y);
    }
}

class Click extends CharaBase{}

//spriteイメージの読み込み
let spriteImage = new Image(); //画像イメージを作成する(引数から表示サイズを指定可能)。 =document.createElement("img")でも可能
spriteImage.src = "./img/fighter.png"; //spriteImageの画像パスはmain.jsと同じフォルダに保存

//スプライトクラス
class Sprite{  //クラスとはモノ(オブジェクト)の設計書
    //ただしクラス変数はコンストラクタ中でのみ記載可、クラス直下にはfunction(メソッドや関数)しか配置できない
    constructor(x,y,w,h){ //定義したクラスからオブジェクトを生成し、初期化する際に実行される特殊な初期化用メソッド
        this.x = x;  //自身のプロパティxに指定された引数の値を設定する
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

//スプライト
let sprite =[
    new Sprite(0,0, 39,35), //青１
    new Sprite(39,0, 34,41), //青２
    new Sprite(0,42, 39,36), //赤１
    new Sprite(40,42, 33,41) //赤２
]; //new 画像イメージ（開始x座標, 開始y座標, 幅, 高さ）

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

// 背景の星を描画
class Star { //星クラス→クラスとはオブジェクトを作成するためのテンプレ
    constructor(x, y, vx, vy, sz){ //function Star(～){this.～}でも記述可能？
        //constructorとはクラスで作成されたオブジェクト(操作や処理の対象)の生成と初期化のための特殊メソッド
        //注：()がなければ関数と認識されない
        this.x = rand(0,field_w)<<8, //rand(最大値,最小値)
        this.y = rand(0,field_h)<<8, //"<<"のシフト演算子は下8桁以外のビットを切り揃える
        this.vx = 0, //vxやvyは移動量を指す
        this.vy = rand(-10,1000), 
        this.sz = rand(1.5, 4);
        //this. によってインスタンスのプロパティを設定可能
    }
    draw(){ //星の描画を規定・指示がない限り延々と繰り返される
        let x = this.x>>8; 
        let y = this.y>>8;
        if(
            x<camera_x || x>=camera_x+screen_w || y<camera_y || y>=camera_y+screen_h
        )return; //カメラ外では描画させないようにする

        //自機が最下部まで行くと星のvyが異常に早くなるのが課題

        vctx.fillStyle= rand(0,2) !=0 ? "#5b89c6":"white"; //!=はノットイコール≠と同義
        //.fillStyleは図形の塗りつぶしのスタイル(色など)を記述する
        vctx.fillRect(x, y, this.sz, this.sz)
        //.fillRect(x,y,w,h)は塗りつぶしの四角形を描く際に使用。x=■左上x座標・y=■左上y座標・w=■の幅・h=■の高さ
    }

        //ctxではなくvctxとしたのは仮想画面に記述するため（後述で仮想画面から実画面にコピーする）
        //!($a==$b)は$aと$bが等しい時にfalse、等しくない時にtrueとなる
        //"a":"b"のaはtrue、bはfalseの時の返り値
        //三項演算子とは【変数】= (【条件文】) ? 【true時の返す値や処理】 : 【false時の返す値や処理】;

    update(){ //要素の内容を書き換える(この場合は毎フレームどれだけ動くかの更新処理)
        this.x += this.vx; //毎フレームのminからmaxまで動くことになる
        this.y += this.vy;

        if(this.y>field_h<<8){ //フィールド真下までいった場合に真上から繰り返す
            this. y=0; //フィールド真下
            this. x=rand(0,field_w)<<8; //真上から繰り返される星のx座標をランダムにする
        }
    }
}

//デバッグのフラグ
const debug = true;

//ゲームスピード
const game_speed = 1000/60;

//画面サイズ
const screen_w = 375;
const screen_h = 375;

//キャンバスサイズ
const canvas_w = screen_w *2; //アスペクト比は画面サイズと同じにする
const canvas_h = screen_h *2;

//フィールドサイズ
const field_w = screen_w *2;
const field_h = screen_h *2;

//星の数
const star_max = 1000;


let can = document.getElementById("can"); //任意のHTMLタグで指定したIDにマッチするドキュメント要素を取得する
let ctx = can.getContext("2d"); //2Dグラフィックを描画する
can.width = canvas_w;
can.height = canvas_h;

//キャンバス（仮想画面）
let vcan = document.createElement("canvas") // HTML要素を動的に生成する("tag名")
let vctx = vcan.getContext("2d"); 
vcan.width = field_w;
vcan.height = field_h;

//カメラ(実画面フィールド内のスクリーン)の座標
let camera_x = 0;
let camera_y = 0;

vctx.mozimageSmoothingEnabled = false; 
vctx.webkitimageSmoothingEnabled = false; 
vctx.msimageSmoothingEnabled = false; 
vctx.imageSmoothingEnabled = false; 

//愛すべきオブジェクトたち
let star    = []; //配列リテラルが空であることを宣言する
let key     = [];
let own     = new Own();
let exp     = [];


//ゲーム初期化
function gameInit(){ //setup()と同じ初期化関数
    for(let i=0; i<star_max; i++) star[i]=new Star(); //最大数の星を作り出す
    //for(変数の初期化式; 繰り返し(回数)の条件式; 繰り返し時の更新処理式){繰り返す処理}
    //new演算子はエラーを起こさないようfunctionやdateなどオブジェクトのコピー(インスタンス)を作成する
    setInterval(gameLoop, game_speed); //一定時間ごとに特定の処理を繰り返すタイマー処理（繰り返す関数, 時間の指定）
    //本気でやりたいときはrequstAnimationFlame。モニタのリフレッシュレートに合った描写が可能になる
}

//オブジェクトのアップデート
function updateObj( obj ){
    //for(let i=bullet.length; i<bullet.length; i++)から修正したのは最大値のbullet.length-1から最小値０
    for(let i=(obj.length-1); i>=0; i--){ 
        obj[i].update();
        //bullet配列要素のdeleteflagがtrueの場合に要素iを1個だけsplice(消去)する
    }
}

//オブジェクトを描画
function drawObj( obj ){
    for(let i=0; i<obj.length; i++) obj[i].draw();
}

//移動の処理
function updateAll(){
// for(let i=0; i<star_max; i++) star[i].update(); をupdateObj(star);に変更
    updateObj(star);
    updateObj(exp);
}

document.body.onclick = own.update();


//描画の処理
function drawAll(){
    vctx.fillStyle = "#19151D"; //塗りつぶす色の指定
    vctx.fillRect(camera_x,camera_y,screen_w,screen_h); //塗りつぶす範囲の指定
    //実画面ではなく仮想画面に映すのでvcontext
    // vcontext.disp();

    // for(let i=0; i<star_max; i++) star[i].draw(); //drawメソッドを呼び出す
    // //drawSprite(0, 0<<8, 0<<8);はclass ownのdraw()に移す
    // for(let i=0; i<bullet.length; i++) bullet[i].draw();
    // for(let i=0; i<enemy.length; i++) enemy[i].draw();
    //上記を
    drawObj(star);
    drawObj(exp);
    //に変換する
    own.draw();

    //カメラと自機の範囲を合わせる
    //自機の範囲　0 ～ field_w
    //カメラの範囲　0～ (field_w - screen_w)
    camera_x = (own.x>>8)/field_w * (field_w-screen_w);
    camera_y = (own.y>>8)/field_h * (field_h-screen_h);
    //ここ理解不能 くそむず

    vctx.moveTo( 0, 288 ) ;
    vctx.lineTo( 1000, 288 );
    vctx.moveTo( 0, 650 ) ;
    vctx.lineTo( 1000, 650 );
    vctx.strokeStyle = "red" ;
    vctx.lineWidth = 2 ;
    vctx.stroke() ;

    //仮想画面から実際のキャンバスにコピー
    ctx.drawImage( //使用範囲を指定してイメージを描画する際に使用する( .drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) )
        vcan, camera_x, camera_y, screen_w, screen_h,
        0, 0, canvas_w, canvas_h
    );

}


//ゲームループ
function gameLoop(){ //一定時間に決まった回数だけ繰り返すループ関数
    
    updateAll();
    drawAll();
}

//オンロードでゲーム開始
// let btn = document.getElementById('btn');
// btn.addEventListener('click', function(){

    window.onload = function(){
        gameInit();
        function disableScroll(event) {
            event.preventDefault();
        }
        document.querySelector(".canvas_wrapper").onclick = function toAdvance() {
            own.update();
            document.addEventListener('touchmove', disableScroll, { passive: false });
            document.addEventListener('mousewheel', disableScroll, { passive: false });
        }
        window.setTimeout(function(){
            alert("時間切れ");
            location.href = "#";
        }, 30000);
    }
// });
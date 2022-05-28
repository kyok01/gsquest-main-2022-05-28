

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
        }, 10000);
    }
// });
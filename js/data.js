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


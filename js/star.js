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

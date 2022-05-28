
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
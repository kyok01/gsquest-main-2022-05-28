(function() {
    let canvas;
    let ctx;
    let changeCount = 0;
    let drawTimerID;
    let raiseTimerID;
    let dropTimerID;
    let blockTimerID;
    let line = [];
    let obstacle = [];
    let velocity;            // 糸の上昇or下降の速さ
    let time;

    let LINE = {
        'FPS'        : 60,   // 画面更新の速さ
        'CPS'        : 1,    // 糸の操作感覚
        'GRAVITY'    : 120,  // 重力加速度
        'PUSHUP'     : 120,  // クリック中の抗力
        'INITIAL_V'  : -60,  // 初速度
        'WIDTH'      : 2,    // 曲線の幅(px)
        'INVALID'    : -1,   // 無効値
    }

    let OBSTACLE = {
        'WIDTH'      : 24,
        'HEIGHT'     : 80,
        'ENCOUNTS'   : 0.5,
        'INVALID'    : -1,
    }


    // 初期化処理(キャンバス作成,イベントハンドラ登録)
    function initialize () {
        // キャンバスを初期化
        if (canvas == null) {
            canvas = document.getElementById('field');
        }

        if (canvas.getContext) {
            if (ctx == null) {
                ctx = canvas.getContext('2d');
            }
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = "bold 18px 'Meiryo'";
            ctx.fillStyle = "rgb(0,255,255)";
            ctx.fillText("画面をクリックでスタート", 40, 150);
        } else {
            return;
        }

        // 糸の初速度を設定
        velocity = LINE.INITIAL_V;

        // 軌跡を初期化
        line[0] = canvas.height/2;
        for(var i = 1; i < canvas.width / 2; i++) {
            line[i] = LINE.INVALID;
        }

        // 障害物の初期化
        for(var i = 0; i < canvas.width; i++) {
            obstacle[i] = OBSTACLE.INVALID;
        }

        // 経過時間の初期化
        time = 0;

        clearInterval(drawTimerID);
        clearInterval(dropTimerID);
        clearInterval(raiseTimerID);
        clearTimeout(blockTimerID);

        // クリックでゲーム開始
        canvas.addEventListener('click', startGame, false);
    }



    // スマホ・タブレット or PC 判定
    function isDevicePC() {
        var ua = navigator.userAgent;
        if( ua.indexOf('iPhone') > 0 ||
            ua.indexOf('iPod') > 0 ||
            ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0 ||
            ua.indexOf('iPad') > 0 ||
            ua.indexOf('Android') > 0){
            return false;
        }
        return true;
    };

    // ゲーム開始
    function startGame() {
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        canvas.removeEventListener('click', startGame, false);

        if (isDevicePC()) {
            canvas.addEventListener('mouseup', dropLine, false);
            canvas.addEventListener('mousedown', raiseLine, false);
        } else {
            canvas.addEventListener('click', changeRaiseDropLine, false);
        }

        dropTimerID = setInterval(function() { velocity += LINE.GRAVITY * 1/LINE.FPS; }, LINE.CPS);
        drawTimerID = setInterval(drawDot, 1000/LINE.FPS);

        blockTimerID = setTimeout(generateBlock, 1000/OBSTACLE.ENCOUNTS);
    }

    // 糸の上昇
    function raiseLine(e) {
        if (!e.pageX) {
            e = event.touches[0];
        }
        if (e.button == 0) {
            clearInterval(dropTimerID);
            raiseTimerID = setInterval(function() { velocity -= LINE.PUSHUP * 1/LINE.FPS; }, LINE.CPS);
        }
    };

    // 糸の下降
    function dropLine(e) {
        if (!e.pageX) {
            e = this.data("e");
        }
        if (e.button == 0) {
            clearInterval(raiseTimerID);
            dropTimerID = setInterval(function() { velocity += LINE.GRAVITY * 1/LINE.FPS; }, LINE.CPS);
        }
    };

    // 糸の上昇,下降切り替え(スマホのみ)
    function changeRaiseDropLine() {
        clearInterval(dropTimerID);
        clearInterval(raiseTimerID);
        if (changeCount % 2 == 0) {
            raiseTimerID = setInterval(function() { velocity -= LINE.PUSHUP * 1/LINE.FPS; }, LINE.CPS);
        } else {
            dropTimerID = setInterval(function() { velocity += LINE.GRAVITY * 1/LINE.FPS; }, LINE.CPS);
        }
        changeCount++;
    };

    // 障害物の生成
    function generateBlock() {
        let height = canvas.height * Math.random();
        for(var i = 1; i <= OBSTACLE.WIDTH; i++) {
            obstacle[i] = height;
        }
        blockTimerID = setTimeout(generateBlock, 1000/OBSTACLE.ENCOUNTS);
    };

    // 画面の描画
    function drawDot() {
        // 軌跡の更新
        for (var i = 0; i < (canvas.width / 2 - 1); i++) {
            line[canvas.width / 2 - 1 - i] = line[canvas.width / 2 - 1 - (i + 1)]
        }
        line[0] = velocity * (1/LINE.FPS) + line[1];

        // 障害物の更新
        for (var i = 0; i < canvas.width - 1; i++) {
            obstacle[canvas.width - 1 - i] = obstacle[canvas.width - 1 - (i + 1)]
        }

        // 一旦黒塗り
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 軌跡の描画
        ctx.strokeStyle = "rgb(255,255,255)";
        ctx.lineWidth = LINE.WIDTH;
        ctx.beginPath();

        for (var i = 0; i < canvas.width/2 - 1; i++) {
            if ((line[i] != LINE.INVALID) && (line[i+1] != LINE.INVALID)) {
                ctx.moveTo(canvas.width/2 - i, line[i]);
                ctx.lineTo(canvas.width/2 - (i+1), line[i+1]);
            }
        }
        ctx.closePath();
        ctx.stroke();

        // 障害物の描画
        ctx.strokeStyle = "rgb(255,0,0)";
        ctx.beginPath();
        for (var i = 0; i < canvas.width; i++) {
            if (obstacle[i] != OBSTACLE.INVALID) {
                ctx.moveTo(canvas.width - i, obstacle[i]-OBSTACLE.HEIGHT);
                ctx.lineTo(canvas.width - i, obstacle[i]+OBSTACLE.HEIGHT);
            }
        }
        ctx.closePath();
        ctx.stroke();

        // ゲームオーバー判定
        if (line[0] >= canvas.height || line[0] < 0) {
            resetGame();
        } else if ((obstacle[canvas.width/2] != OBSTACLE.INVALID) &&
            ((obstacle[canvas.width/2] - OBSTACLE.HEIGHT) <= line[0]) &&
            (line[0] <= (obstacle[canvas.width/2] + OBSTACLE.HEIGHT))) {
            resetGame();
        } else {
            time += 1/LINE.FPS;
            // 経過時間を表示
            ctx.font = "18px";
            ctx.fillStyle = "rgb(255,255,0)";
            ctx.fillText('TIME:' + Math.floor(time) + '.' + Math.floor(10 * (time - Math.floor(time))), 
                        10,
                        20);
        }
    }

    // ゲームオーバ時のリセット処理
    function resetGame() {
    if (isDevicePC()) {
        canvas.removeEventListener('mouseup', dropLine, false);
        canvas.removeEventListener('mousedown', raiseLine, false);
    } else {
        canvas.removeEventListener('click', changeRaiseDropLine, false);
    }
    initialize();
    }
    // onload
    window.addEventListener('load', initialize, false);
})();

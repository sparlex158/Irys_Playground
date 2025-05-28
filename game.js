window.onload = function() {
    console.log("Irys Runner script loaded!");

    // === КОНСТАНТЫ ===
    const CANVAS_W = 1200;
    const CANVAS_H = 600;
    const GROUND_Y = 540;
    const PLAYER_W = 90;
    const PLAYER_H = 60;

    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    // Устанавливаем размеры канваса
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    // === ФОН ===
    const bgImg = new Image();
    bgImg.src = 'background.png';
    let bgLoaded = false;
    bgImg.onload = () => { bgLoaded = true; console.log("Background loaded"); };
    bgImg.onerror = () => console.error("Failed to load background.png");

    // === ИГРОК ===
    const playerImg = new Image();
    playerImg.src = 'sprite.png';
    let playerLoaded = false;
    playerImg.onload = () => { playerLoaded = true; console.log("Sprite loaded"); };
    playerImg.onerror = () => console.error("Failed to load sprite.png");

    const player = { 
        x: 80, 
        y: GROUND_Y - PLAYER_H, 
        w: PLAYER_W, 
        h: PLAYER_H, 
        onGround: true, 
        jumpTime: 0, 
        jumpDuration: 1000, // Уменьшил до 1 секунды для ускорения
        jumpHeight: 220 // Оставил высоту прежней
    };
    let score = 0;
    let gameOver = false;
    let gameStarted = true;
    let speed = 0.2; // Скорость в пикселях/мс (200 пикселей/сек)
    let lastTypes = [];

    // === ПРЕПЯТСТВИЯ И ТОКЕНЫ ===
    const tokenImg = new Image();
    tokenImg.src = 'token.png';
    let tokenLoaded = false;
    tokenImg.onload = () => { tokenLoaded = true; console.log("Token loaded"); };
    tokenImg.onerror = () => console.error("Failed to load token.png");

    const logoImg = new Image();
    logoImg.src = 'Logo.png';
    let logoLoaded = false;
    logoImg.onload = () => { logoLoaded = true; console.log("Logo loaded"); };
    logoImg.onerror = () => console.error("Failed to load Logo.png");

    const obstacles = [];
    const tokens = [];

    // === ПРОПОРЦИИ ЛОГО ===
    const logoOriginalW = 295;
    const logoOriginalH = 62;
    const logoDrawW = 180;
    const logoDrawH = logoDrawW * (logoOriginalH / logoOriginalW);

    // === СПАВН ПРЕПЯТСТВИЙ ===
    let lastSpawnTime = 0;
    let nextSpawnInterval = 2000; // Спавн каждые 2–3 секунды

    function spawnObstacleAndToken() {
        let type;
        do {
            type = Math.random() < 0.7 ? 0 : 1;
        } while (lastTypes.length >= 2 && lastTypes[lastTypes.length - 1] === type && lastTypes[lastTypes.length - 2] === type);

        lastTypes.push(type);
        if (lastTypes.length > 2) lastTypes.shift();

        if (type === 0) {
            obstacles.push({ x: CANVAS_W, y: GROUND_Y - 60, w: 50, h: 60, type: 'ground' });

            const tokenType = Math.random() < 0.5 ? 0 : 1;
            if (tokenType === 0) {
                tokens.push({ x: CANVAS_W - 80, y: GROUND_Y - 160, w: 40, h: 40 });
            } else {
                tokens.push({ x: CANVAS_W + 120, y: GROUND_Y - 40, w: 40, h: 40 });
            }
        } else {
            obstacles.push({ x: CANVAS_W, y: GROUND_Y - 160, w: logoDrawW, h: logoDrawH, type: 'flying' });
            tokens.push({ x: CANVAS_W - 80, y: GROUND_Y - 40, w: 40, h: 40 });
        }

        nextSpawnInterval = 2000 + Math.random() * 1000; // 2–3 секунды
        console.log("Spawned obstacle, next in:", nextSpawnInterval, "ms");
    }

    function resetGame() {
        player.x = 80;
        player.y = GROUND_Y - PLAYER_H;
        player.onGround = true;
        player.jumpTime = 0;
        score = 0;
        gameOver = false;
        speed = 0.2;
        obstacles.length = 0;
        tokens.length = 0;
        lastSpawnTime = 0;
        nextSpawnInterval = 2000;
        document.getElementById('score').textContent = score;
        console.log("Game reset");
    }

    // === ОБНОВЛЕНИЕ ===
    let lastTime = performance.now();
    let elapsedTimeSinceSpeedUp = 0;

    function update(deltaTime, currentTime) {
        if (!gameStarted || gameOver) return;

        // Ускорение каждые 20 секунд
        elapsedTimeSinceSpeedUp += deltaTime;
        if (elapsedTimeSinceSpeedUp >= 20000) {
            speed += 0.06;
            console.log("Speed up! Now:", speed * 1000, "pixels/second");
            elapsedTimeSinceSpeedUp = 0;
        }

        // Прыжок с параболической траекторией
        if (!player.onGround) {
            player.jumpTime += deltaTime;

            const t = player.jumpTime / (player.jumpDuration / 2);
            const height = -player.jumpHeight * (t - 1) * (t - 1) + player.jumpHeight;

            player.y = GROUND_Y - player.h - height;

            if (player.jumpTime >= player.jumpDuration) {
                player.y = GROUND_Y - player.h;
                player.onGround = true;
                player.jumpTime = 0;
            }
        }

        // Движение препятствий и токенов
        for (let o of obstacles) o.x -= speed * deltaTime;
        for (let t of tokens) t.x -= speed * deltaTime;

        // Удаляем ушедшие за экран
        while (obstacles.length && obstacles[0].x + obstacles[0].w < 0) obstacles.shift();
        while (tokens.length && tokens[0].x + tokens[0].w < 0) tokens.shift();

        // Коллизии с препятствиями
        for (let o of obstacles) {
            if (player.x < o.x + o.w && player.x + player.w > o.x &&
                player.y < o.y + o.h && player.y + player.h > o.y) {
                gameOver = true;
                setTimeout(showWinScreen, 300);
                console.log("Game over! Score:", score);
            }
        }

        // Коллизии с токенами
        for (let i = tokens.length - 1; i >= 0; i--) {
            let t = tokens[i];
            if (player.x < t.x + t.w && player.x + player.w > t.x &&
                player.y < t.y + t.h && player.y + player.h > t.y) {
                score++;
                tokens.splice(i, 1);
                document.getElementById('score').textContent = score;
                console.log("Token collected! Score:", score);
            }
        }

        // Спавн препятствий
        if (currentTime - lastSpawnTime >= nextSpawnInterval) {
            spawnObstacleAndToken();
            lastSpawnTime = currentTime;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        if (bgLoaded) {
            ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);
            ctx.fillStyle = "rgba(24,24,40,0.40)";
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
            ctx.fillStyle = "white";
            ctx.font = "30px Arial";
            ctx.fillText("Loading background...", 500, 300);
        }

        if (logoLoaded) {
            for (let o of obstacles) {
                if (o.type === 'ground') {
                    ctx.fillStyle = "#00FFD0";
                    ctx.fillRect(o.x, o.y, o.w, o.h);
                } else if (o.type === 'flying') {
                    ctx.drawImage(logoImg, o.x, o.y, logoDrawW, logoDrawH);
                }
            }
        }

        if (tokenLoaded) {
            for (let t of tokens) ctx.drawImage(tokenImg, t.x, t.y, t.w, t.h);
        }

        if (playerLoaded) {
            ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
        }
    }

    function loop(currentTime) {
        const deltaTime = Math.min(currentTime - lastTime, 50);
        lastTime = currentTime;

        update(deltaTime, currentTime);
        draw();
        if (!gameOver && gameStarted) requestAnimationFrame(loop);
    }

    function showWinScreen() {
        document.getElementById('win-screen').style.display = 'flex';
        document.getElementById('final-score').textContent = score;
    }

    document.getElementById('play-again').onclick = function() {
        document.getElementById('win-screen').style.display = 'none';
        resetGame();
        gameStarted = true;
        lastTime = performance.now();
        loop(lastTime);
    };

    document.addEventListener('keydown', e => {
        if (!gameStarted || gameOver) return;
        if ((e.code === 'Space' || e.key === 'w' || e.key === 'W') && player.onGround) {
            player.onGround = false;
            player.jumpTime = 0;
            console.log("Jump!");
        }
    });

    resetGame();
    gameStarted = true;
    loop(performance.now());
};
class Game {
    // Cria a instância do jogo
    constructor() {
        // Obtém o elemento <canvas> e seu contexto 2D para desenhar
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext('2d');

        // Define largura e altura do canvas
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Configuração dos blocos (grade)
        this.brickRowCount = 2;          
        this.brickColumnCount = 6;       
        this.brickWidth = 75;           
        this.brickHeight = 20;           
        this.brickPadding = 10;          
        this.brickOffsetTop = 30;        
        this.brickOffsetLeft = 30;       
        this.bricks = [];                

        // Controla o nível (fase) atual do jogo
        this.level = 1;

        // Configuração da bola
        this.baseSpeed = 1.5;            // velocidade inicial da bola
        this.ballRadius = 10;            // raio da bola em pixels
        this.ballDX = this.baseSpeed;    // velocidade horizontal inicial (dx)
        this.ballDY = -this.baseSpeed;   // velocidade vertical inicial (dy)
        this.ballX = this.width / 2;     // posição X inicial da bola (centro)
        this.ballY = this.height - 30;   // posição Y inicial da bola (próximo ao paddle)

        // Configuração do paddle (barra)
        this.paddleHeight = 10;          // altura do paddle
        this.paddleWidth = 100;          // largura do paddle
        this.paddleX = (this.width - this.paddleWidth) / 2; // posição X central do paddle
        this.rightPressed = false;       // flag para tecla direita pressionada
        this.leftPressed = false;        // flag para tecla esquerda pressionada

        // Pontuação e recorde
        this.score = 0;                  // contagem de pontos do jogador
        this.totalBricks = 0;            // total de blocos na fase atual
        this.highScore = parseInt(localStorage.getItem("arkanoidHighScore")) || 0; // melhor pontuação salva

        // Estado do jogo
        this.gameOver = false;           // flag indicando fim de jogo

        // Eventos de teclado: seta direita/esquerda para mover o paddle
        document.addEventListener("keydown", (e) => {
            if (e.key === "Right" || e.key === "ArrowRight") this.rightPressed = true;
            if (e.key === "Left" || e.key === "ArrowLeft") this.leftPressed = true;
        });
        document.addEventListener("keyup", (e) => {
            if (e.key === "Right" || e.key === "ArrowRight") this.rightPressed = false;
            if (e.key === "Left" || e.key === "ArrowLeft") this.leftPressed = false;
        });

        
        this.createBricks();
    }

    
    createBricks() {
        this.bricks = [];        
        this.totalBricks = 0;    
        let isBlueCreated = false; 

        for (let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                let brickType = "normal"; 
                if (Math.random() < 0.2) {
                    brickType = "bonus";    
                }
                
                if (this.level % 2 === 0 && !isBlueCreated) {
                    brickType = "blue";      
                    isBlueCreated = true;
                }

                
                this.bricks[c][r] = { x: 0, y: 0, status: 1, type: brickType };
                this.totalBricks++;
            }
        }
    }

    
    drawBricks() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const b = this.bricks[c][r];
                if (b.status === 1) {
                   
                    const brickX = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                    const brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                    b.x = brickX; // armazena para colisão
                    b.y = brickY;

                  
                    if (b.type === "bonus") this.ctx.fillStyle = "#FF0000";
                    else if (b.type === "blue") this.ctx.fillStyle = "#00008B";
                    else this.ctx.fillStyle = "#FFAA00";

                    
                    this.ctx.fillRect(brickX, brickY, this.brickWidth, this.brickHeight);
                }
            }
        }
    }

   
    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = "#FF4500"; 
        this.ctx.fill();
        this.ctx.closePath();
    }

    
    drawPaddle() {
        this.ctx.fillStyle = "#00FFAA";
        this.ctx.fillRect(this.paddleX, this.height - this.paddleHeight, this.paddleWidth, this.paddleHeight);
    }

    
    drawScore() {
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillText(`Score: ${this.score}`, 8, 20);
        this.ctx.fillText(`Recorde: ${this.highScore}`, 400, 20);
    }

    
    drawGameOver() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; 
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = "32px Arial";
        this.ctx.fillText("Você perdeu!", this.width / 2 - 100, this.height / 2 - 10);
        this.ctx.font = "24px Arial";
        this.ctx.fillText(`Pontuação: ${this.score}`, this.width / 2 - 70, this.height / 2 + 30);
        this.ctx.fillText(`Recorde: ${this.highScore}`, this.width / 2 - 70, this.height / 2 + 60);
    }

   
    checkBrickCollisions() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const b = this.bricks[c][r];
                if (b.status === 1 &&
                    this.ballX > b.x && this.ballX < b.x + this.brickWidth &&
                    this.ballY > b.y && this.ballY < b.y + this.brickHeight) {
                   
                    this.ballDY = -this.ballDY;
                    b.status = 0; 

                   
                    if (b.type === "bonus") this.score += 10;
                    else if (b.type === "blue") {
                        this.score += 15;
                        this.increaseSpeed(1.5); 
                    } else this.score += 1;

                    this.totalBricks--;
                    
                    if (this.totalBricks === 0) {
                        this.level++;
                        this.createBricks(); 
                    }
                }
            }
        }
    }

    /**
     * Aumenta a velocidade da bola pelo fator indicado.
     * @param {number} factor // multiplicador da velocidade (padrão 1.5).
     */
    increaseSpeed(factor = 5) {
        this.ballDX *= factor;
        this.ballDY *= factor;
    }

    
    
    update() {
       
        if (this.gameOver) {
            this.drawGameOver();
            return;
        }

       
        this.ctx.clearRect(0, 0, this.width, this.height);
       
        this.drawBricks();
        this.drawBall();
        this.drawPaddle();
        this.drawScore();
       
        this.checkBrickCollisions();

        
        this.ballX += this.ballDX;
        this.ballY += this.ballDY;

        
        if (this.ballX + this.ballDX > this.width - this.ballRadius || this.ballX + this.ballDX < this.ballRadius) {
            this.ballDX = -this.ballDX;
        }
        
        if (this.ballY + this.ballDY < this.ballRadius) {
            this.ballDY = -this.ballDY;
        } else if (this.ballY + this.ballDY > this.height - this.ballRadius) {
            if (this.ballX > this.paddleX && this.ballX < this.paddleX + this.paddleWidth) {
                this.ballDY = -this.ballDY;
            } else {
                this.gameOver = true;
                
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('arkanoidHighScore', this.highScore);
                }
            }
        }

       
        if (this.rightPressed && this.paddleX < this.width - this.paddleWidth) this.paddleX += 5;
        else if (this.leftPressed && this.paddleX > 0) this.paddleX -= 5;

        // repete ciclo
        requestAnimationFrame(() => this.update());
    }
}


let game = new Game();
game.update();

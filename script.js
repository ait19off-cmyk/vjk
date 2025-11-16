// Game elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreElem = document.getElementById('player-score');
const aiScoreElem = document.getElementById('ai-score');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

// Game variables
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 15;
const PADDLE_SPEED = 8;
const INITIAL_BALL_SPEED = 5;
const WINNING_SCORE = 5; // First to 5 points wins

// Game state
let playerScore = 0;
let aiScore = 0;
let gameRunning = false;
let animationId;

// Backend URL
const BACKEND_URL = '';

// Paddle positions
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;

// Ball position and velocity
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = INITIAL_BALL_SPEED;
let ballSpeedY = INITIAL_BALL_SPEED;

// Initialize game
async function init() {
    // Event listeners
    canvas.addEventListener('mousemove', movePaddle);
    canvas.addEventListener('touchmove', movePaddleTouch, { passive: false });
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    
    // Load stats from backend
    await loadStats();
    
    // Draw initial state
    draw();
}

// Load stats from backend
async function loadStats() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/stats`);
        if (response.ok) {
            const data = await response.json();
            console.log('Game stats:', data);
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Move player paddle with mouse
function movePaddle(e) {
    if (!gameRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    const root = document.documentElement;
    const mouseY = e.clientY - rect.top - root.scrollTop;
    
    playerY = mouseY - PADDLE_HEIGHT / 2;
    
    // Keep paddle on screen
    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - PADDLE_HEIGHT) playerY = canvas.height - PADDLE_HEIGHT;
}

// Move player paddle with touch
function movePaddleTouch(e) {
    if (!gameRunning) return;
    
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchY = touch.clientY - rect.top;
    
    playerY = touchY - PADDLE_HEIGHT / 2;
    
    // Keep paddle on screen
    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - PADDLE_HEIGHT) playerY = canvas.height - PADDLE_HEIGHT;
}

// Start the game
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    gameLoop();
}

// Reset the game
function resetGame() {
    // Cancel any ongoing animation
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Reset game state
    playerScore = 0;
    aiScore = 0;
    gameRunning = false;
    
    // Reset positions
    playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
    aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = INITIAL_BALL_SPEED;
    ballSpeedY = INITIAL_BALL_SPEED;
    
    // Update score display
    playerScoreElem.textContent = playerScore;
    aiScoreElem.textContent = aiScore;
    
    // Redraw
    draw();
}

// End the game
async function endGame(winner) {
    // Stop the game
    gameRunning = false;
    cancelAnimationFrame(animationId);
    
    // Show winner message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width/2 - 150, canvas.height/2 - 50, 300, 100);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(winner === 'player' ? 'You Win!' : 'Computer Wins!', canvas.width/2, canvas.height/2);
    ctx.font = '16px Arial';
    ctx.fillText('Click Reset to play again', canvas.width/2, canvas.height/2 + 30);
    
    // Send stats to backend
    try {
        const highestScore = Math.max(playerScore, aiScore);
        await fetch(`${BACKEND_URL}/api/stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                result: winner === 'player' ? 'player_win' : 'ai_win',
                score: highestScore
            })
        });
    } catch (error) {
        console.error('Failed to send stats:', error);
    }
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    
    animationId = requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Move the ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    // AI paddle movement (simple follow behavior)
    const aiPaddleCenter = aiY + PADDLE_HEIGHT / 2;
    if (aiPaddleCenter < ballY - 15) {
        aiY += PADDLE_SPEED * 0.7; // Slightly slower than player
    } else if (aiPaddleCenter > ballY + 15) {
        aiY -= PADDLE_SPEED * 0.7;
    }
    
    // Keep AI paddle on screen
    if (aiY < 0) aiY = 0;
    if (aiY > canvas.height - PADDLE_HEIGHT) aiY = canvas.height - PADDLE_HEIGHT;
    
    // Top and bottom wall collision
    if (ballY <= 0 || ballY >= canvas.height - BALL_SIZE) {
        ballSpeedY = -ballSpeedY;
    }
    
    // Player paddle collision
    if (
        ballX <= PADDLE_WIDTH &&
        ballY >= playerY &&
        ballY <= playerY + PADDLE_HEIGHT
    ) {
        // Calculate bounce angle based on where ball hits paddle
        const hitPosition = (ballY - playerY) / PADDLE_HEIGHT;
        const bounceAngle = hitPosition * Math.PI / 2 - Math.PI / 4; // -45° to 45°
        
        // Increase speed slightly with each hit
        const speed = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY) * 1.05;
        
        ballSpeedX = Math.cos(bounceAngle) * speed;
        ballSpeedY = Math.sin(bounceAngle) * speed;
        
        // Ensure ball moves to the right
        if (ballSpeedX < 0) ballSpeedX = -ballSpeedX;
        
        // Move ball outside paddle to prevent multiple collisions
        ballX = PADDLE_WIDTH;
    }
    
    // AI paddle collision
    if (
        ballX >= canvas.width - PADDLE_WIDTH - BALL_SIZE &&
        ballY >= aiY &&
        ballY <= aiY + PADDLE_HEIGHT
    ) {
        // Calculate bounce angle based on where ball hits paddle
        const hitPosition = (ballY - aiY) / PADDLE_HEIGHT;
        const bounceAngle = hitPosition * Math.PI / 2 - Math.PI / 4; // -45° to 45°
        
        // Increase speed slightly with each hit
        const speed = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY) * 1.05;
        
        ballSpeedX = -Math.abs(Math.cos(bounceAngle) * speed);
        ballSpeedY = Math.sin(bounceAngle) * speed;
        
        // Move ball outside paddle to prevent multiple collisions
        ballX = canvas.width - PADDLE_WIDTH - BALL_SIZE;
    }
    
    // Scoring
    if (ballX < 0) {
        // AI scores
        aiScore++;
        aiScoreElem.textContent = aiScore;
        
        // Check for win
        if (aiScore >= WINNING_SCORE) {
            endGame('ai');
        } else {
            resetBall();
        }
    } else if (ballX > canvas.width) {
        // Player scores
        playerScore++;
        playerScoreElem.textContent = playerScore;
        
        // Check for win
        if (playerScore >= WINNING_SCORE) {
            endGame('player');
        } else {
            resetBall();
        }
    }
}

// Reset ball to center
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    
    // Random direction
    ballSpeedX = INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = INITIAL_BALL_SPEED * (Math.random() * 2 - 1);
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a2530';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw player paddle
    ctx.fillStyle = '#3498db';
    ctx.fillRect(0, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // Draw AI paddle
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(canvas.width - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // Draw ball
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);
}

// Initialize when page loads
window.addEventListener('load', () => {
    init();
});
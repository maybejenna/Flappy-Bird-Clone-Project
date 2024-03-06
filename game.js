
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreDisplay = document.getElementById('scoreDisplay');

let gameActive = false;

startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameActive = true;
    startGame();
});

restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    gameActive = true;
    startGame(); // Reset the game state and start again
});

function startGame() {
    // Cancel previous animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Reset the game state and start the game
    resetGameState(); // Make sure this function resets all necessary game variables
    update(); // Start the game loop
}

function resetGameState() {
    // Reset game variables like score, bird position, obstacle array, etc.
    score = 0;
    bird.y = 300;
    obstacles = [];
}

function gameOver() {
    gameActive = false;
    gameOverScreen.style.display = 'flex';
    resetGameState()
}

// Set the canvas size
canvas.width = 400;
canvas.height = 600;

// Bird settings

let birdImg = new Image();
birdImg.src = 'images/sprite.png'; 

let bird = {
    x: 150,
    y: 300,
    width: 50,
    height: 50,
    gravity: 0.6,
    lift: -15,
    velocity: 0
};

let score = 0;

function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function update() {
    let now = Date.now();
    let deltaTime = now - lastObstacleTime;

    if (deltaTime > obstacleInterval) {
        addObstacle();
        lastObstacleTime = now;
    }

    obstacles.forEach(obstacle => {
        obstacle.x -= 3; // Move obstacle to the left

        // Check if the bird has passed the obstacle and it hasn't been marked as passed yet
        if (!obstacle.passed && bird.x > obstacle.x + 20) {
            score++; // Increment score
            obstacle.passed = true; // Mark the obstacle as passed
            console.log("Score: " + score); // Log the current score to the console
        }
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + 20 > 0); // Remove obstacles that have moved off-screen

    // Clear the canvas once at the beginning
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply gravity effect
    bird.velocity += bird.gravity;
    bird.velocity *= 0.9; // Simulate air resistance
    bird.y += bird.velocity;

    // Prevent bird from falling off
    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
    }

    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }

    // Here is where we call checkCollision
    checkCollision();

    drawBird();
    drawObstacles();
    drawScore(); // Make sure drawScore is called only once after all draw calls

    // Request next frame update
    animationFrameId = requestAnimationFrame(update);
}

// Jump on spacebar press
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        bird.velocity += bird.lift;
    }
});

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
  }

let obstacles = [];
let obstacleInterval = 2000; // Interval in milliseconds to generate a new obstacle
let lastObstacleTime = Date.now() - obstacleInterval; // Ensures first obstacle is generated immediately
let obstacleGap = getRandomInt(150,175); // Gap size between upper and lower parts of the obstacle

obstacles.forEach(obstacle => {
    obstacle.x -= 3; // Move obstacle to the left

    // Check if the bird has passed the obstacle and the obstacle hasn't been passed before
    if (!obstacle.passed && bird.x > obstacle.x + 20) {
        score++;
        updateScore(score); // Update score display
        obstacle.passed = true;
    }
});

function addObstacle() {
    let obstacleHeight = Math.floor(Math.random() * (canvas.height / 2)) + 50; // Random height for the top obstacle
    let obstacle = {
        x: canvas.width,
        top: { y: 0, height: obstacleHeight },
        bottom: { y: obstacleHeight + obstacleGap, height: canvas.height - obstacleHeight - obstacleGap },
        passed: false // Initialize passed property
    };
    obstacles.push(obstacle);
}

function drawObstacles() {
    ctx.fillStyle = 'green';
    obstacles.forEach(obstacle => {
        // Draw the top part of the obstacle
        ctx.fillRect(obstacle.x, obstacle.top.y, 20, obstacle.top.height);
        // Draw the bottom part of the obstacle
        ctx.fillRect(obstacle.x, obstacle.bottom.y, 20, obstacle.bottom.height);
    });
}

function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        let ob = obstacles[i];
        if (bird.x < ob.x + 20 && bird.x + bird.width > ob.x && ((bird.y < ob.top.height) || (bird.y + bird.height > ob.bottom.y))) {
            // Collision detected, handle game over
            gameOver();
        }
    }
}

function drawScore() {
    const scoreElement = document.getElementById('scoreDisplay');
    scoreElement.textContent = "Score: " + score;
}

update()
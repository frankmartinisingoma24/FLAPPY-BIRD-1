const bird = document.getElementById('bird');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');

let gameLoop;

function startGame() {
    document.addEventListener('keydown', flap);
    document.addEventListener('touchstart', flap);
    gameLoop = setInterval(updateGame, 20);
}

function flap(event) {
    if (event.type === 'touchstart') {
        event.preventDefault();
    }
    fetch('/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'flap' }),
    });
}

function updateGame() {
    fetch('/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'update' }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.game_over) {
            endGame(data.score);
        } else {
            updateBird(data.bird_y);
            updatePipes(data.pipes);
            updateScore(data.score);
        }
    });
}

function updateBird(y) {
    bird.style.top = `${y}px`;
}

function updatePipes(pipes) {
    const existingPipes = document.querySelectorAll('.pipe');
    existingPipes.forEach(pipe => pipe.remove());

    pipes.forEach(pipe => {
        const upperPipe = document.createElement('div');
        upperPipe.className = 'pipe';
        upperPipe.style.height = `${pipe.gap_start}px`;
        upperPipe.style.left = `${pipe.x}px`;
        upperPipe.style.top = '0';

        const lowerPipe = document.createElement('div');
        lowerPipe.className = 'pipe';
        lowerPipe.style.height = `${500 - pipe.gap_start - pipe.gap_size}px`;
        lowerPipe.style.left = `${pipe.x}px`;
        lowerPipe.style.bottom = '0';

        gameContainer.appendChild(upperPipe);
        gameContainer.appendChild(lowerPipe);
    });
}

function updateScore(score) {
    scoreElement.textContent = score;
}

function endGame(finalScore) {
    clearInterval(gameLoop);
    document.removeEventListener('keydown', flap);
    document.removeEventListener('touchstart', flap);
    alert(`Game Over! Your score: ${finalScore}`);
}

startGame();
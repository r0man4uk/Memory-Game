let timerInterval;
let timeElapsed = 0;
let moves = 0;
let firstCard = null;
let secondCard = null;
let revealed = [];
let currentSize = null;

function generateCards(size) {
    const images = Array.from({ length: (size * size) / 2 }, (_, i) => `${i + 1}.svg`);
    const cards = images.flatMap(img => [img, img]);

    for (let i = cards.length - 1; i > 0; i--) {           
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        document.getElementById("timer").textContent = `Час: ${timeElapsed}s`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function startGame(size) {
    
    const playerName = document.getElementById("player-name").value.trim();      // Заборона на гру без імені
    if (!playerName) {
        alert("❌ Будь ласка, введіть ім'я");
        return;
    }
    
    stopTimer();
    currentSize = size;
    document.getElementById("game-screen").classList.remove("hidden");
    document.getElementById("select-difficulty-screen").classList.add("hidden");
    document.getElementById("player").classList.add("hidden"); 
    document.getElementById("top-scores-board").classList.add("hidden");

    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
    const cards = generateCards(size);
    revealed = Array(size * size).fill(false);
    moves = 0;
    timeElapsed = 0;
    document.getElementById("moves").textContent = `Кліки: ${moves}`;
    document.getElementById("game-title").textContent = `${size}x${size} Поле`;

    boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    cards.forEach((image, index) => {
        const card = document.createElement("div");
        card.className = "card";

        card.addEventListener("click", () => {
            if (revealed[index] || secondCard) return;

            card.classList.add("revealed");
            card.innerHTML = `<img src="images/js_images/${image}" alt="Card image">`;
            revealed[index] = true;

            if (!firstCard) {
                firstCard = { index, element: card };
            } else {
                secondCard = { index, element: card };
                moves++;
                document.getElementById("moves").textContent = `Кліки: ${moves}`;

                if (cards[firstCard.index] === cards[secondCard.index]) {
                    firstCard = null;
                    secondCard = null;
                    checkWin();
                } else {
                    resetCards();
                }
            }
        });

        boardElement.appendChild(card);
    });

    startTimer();
}

document.getElementById("player-name").addEventListener("input", function() {             // Обмеження по вводу та пустому полю
    const inputPlace = this;
    const regex = /^[a-zA-Zа-яА-ЯїЇєЄіІґҐ\s]+$/;
    if (!regex.test(inputPlace.value)) {
        alert("❌ Лише кирилиця | латиниця")
        inputPlace.value = "";
    }
});

function resetCards() {
    if (firstCard && secondCard) {
        setTimeout(() => {
            firstCard.element.innerHTML = "";
            secondCard.element.innerHTML = "";
            firstCard.element.classList.remove("revealed");
            secondCard.element.classList.remove("revealed");
            revealed[firstCard.index] = false;
            revealed[secondCard.index] = false;
            firstCard = null;
            secondCard = null;
        }, 1000);
    }
}

function checkWin() {
    if (revealed.every(r => r)) {
        stopTimer();
        setTimeout(() => {
            alert(`Congratulations! You won in ${moves} moves and ${timeElapsed}s.`);
            saveScore(moves, timeElapsed);
            showStartScreen();
        }, 100);
    }
}

async function saveScore(moves, time) {
    const playerName = document.getElementById("player-name").value.trim();
    try {
        const response = await fetch("http://localhost:3000/api/scores", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: playerName, moves, time }),
        });

        if (!response.ok) {
            throw new Error("Failed to save score");
        }
        updateTopScores();
    } catch (error) {
        console.error("Error saving score:", error);
    }
}

async function updateTopScores() {
    try {
        const response = await fetch("http://localhost:3000/api/scores");
        const scores = await response.json();

        const tableBody = document.getElementById("top-scores");
        tableBody.innerHTML = "";
        scores.forEach(score => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${score.name}</td><td>${score.moves}</td><td>${score.time}s</td>`;
            tableBody.appendChild(row);
        });

        if (scores.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">Нема результатів || сервер не запущений</td></tr>';
        }
    } catch (error) {
        console.error("Error fetching scores:", error);
    }
}

function showStartScreen() {
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("select-difficulty-screen").classList.remove("hidden");
    document.getElementById("player").classList.remove("hidden");
    document.getElementById("top-scores-board").classList.remove("hidden");
    updateTopScores();
}

function restartGame() {
    if (currentSize) {
        startGame(currentSize); 
    }
}

window.onload = function () {
    updateTopScores();
};

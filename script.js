const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const moveSound = document.getElementById("moveSound");
const winSound = document.getElementById("winSound");
const drawSound = document.getElementById("drawSound");
const restartBtn = document.getElementById("restart");
const resetBtn = document.getElementById("resetBtn");
const resetModal = document.getElementById("resetModal");
const confirmReset = document.getElementById("confirmReset");
const cancelReset = document.getElementById("cancelReset");
const vsComputerBtn = document.getElementById("vsComputer");
const darkToggle = document.getElementById("darkToggle");

const winDrawMessage = document.getElementById("winDrawMessage");
const confettiContainer = document.getElementById("confetti-container");


// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  darkToggle.checked = true;
} else {
  document.body.classList.remove("dark-mode");
  darkToggle.checked = false;
}

let options = Array(9).fill("");
let currentPlayer = "X";
let running = false;
let xWins = 0, oWins = 0;
let vsComputer = false;

function init() {
  cells.forEach(cell => cell.addEventListener("click", cellClicked));
  restartBtn.addEventListener("click", restartGame);
  resetBtn.addEventListener("click", () => resetModal.style.display = "flex");
  confirmReset.addEventListener("click", resetGame);
  cancelReset.addEventListener("click", () => resetModal.style.display = "none");
  vsComputerBtn.addEventListener("click", toggleComputer);
  darkToggle.addEventListener("change", toggleDarkMode);

  // Ensure win/draw message is hidden on start using visibility/opacity
  winDrawMessage.style.visibility = "hidden";
  winDrawMessage.style.opacity = 0;

  confettiContainer.style.display = "none";
  statusText.style.display = "block";

  statusText.textContent = `Player ${currentPlayer}'s turn`;
  running = true;
}

function cellClicked() {
  const index = this.getAttribute("data-index");
  if (options[index] || !running) return;

  updateCell(this, index);
  checkWinner();

  if (vsComputer && currentPlayer === "O" && running) {
    setTimeout(computerMove, 500);
  }
}

function updateCell(cell, index) {
  options[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer);
  moveSound.play();
}

function changePlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function checkWinner() {
  const winConditions = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (options[a] && options[a] === options[b] && options[a] === options[c]) {
      // Handle Win
      condition.forEach(i => cells[i].classList.add("winning")); // Add winning class immediately
      winSound.play();
      running = false; // Stop the game

      setTimeout(() => { // Add a delay before showing message and starting confetti
          winDrawMessage.textContent = `Player ${currentPlayer} wins!`; // Text message
          winDrawMessage.classList.add(currentPlayer === 'X' ? 'win-X' : 'win-O');
          // Show message using visibility/opacity
          winDrawMessage.style.visibility = "visible";
          winDrawMessage.style.opacity = 1;

          startConfetti(); // NEW: Start the confetti effect

          statusText.style.display = "none"; // Hide regular status
          updateScore();
      }, 500); // Delay in milliseconds

      return;
    }
  }

  if (!options.includes("")) {
    // Handle Draw
    drawSound.play();
    running = false; // Stop the game

    setTimeout(() => { // Add a delay before showing the draw message
        winDrawMessage.textContent = "It's a draw!"; // Text message
        winDrawMessage.classList.add('draw');
        // Show message using visibility/opacity
        winDrawMessage.style.visibility = "visible";
        winDrawMessage.style.opacity = 1;

        statusText.style.display = "none";

        stopConfetti(); // Ensure confetti is stopped/cleared on draw if it was somehow active
    }, 500);

    return;
  }

  changePlayer();
}

function updateScore() {
  if (currentPlayer === "X") {
    xWins++;
    scoreX.textContent = xWins;
  } else {
    oWins++;
    scoreO.textContent = oWins;
  }
}

function restartGame() {
  options = Array(9).fill("");
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("winning", "X", "O");
  });

  // NEW: Stop any playing sounds and reset their time
  moveSound.pause();
  moveSound.currentTime = 0;
  winSound.pause();
  winSound.currentTime = 0;
  drawSound.pause();
  drawSound.currentTime = 0;


  // Hide win/draw message using visibility/opacity
  winDrawMessage.style.visibility = "hidden";
  winDrawMessage.style.opacity = 0;

  winDrawMessage.classList.remove('win-X', 'win-O', 'draw');
  winDrawMessage.textContent = ""; // Clear the message

  stopConfetti(); // Stop and clear confetti

  // Show regular status text
  statusText.style.display = "block";
  statusText.classList.remove('pop-status');

  currentPlayer = "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
  running = true;
}

function resetGame() {
  xWins = 0;
  oWins = 0;
  scoreX.textContent = xWins;
  scoreO.textContent = oWins;
  resetModal.style.display = "none";
  restartGame(); // resetGame already calls restartGame
}

function toggleComputer() {
  vsComputer = !vsComputer;
  vsComputerBtn.textContent = vsComputer ? "Play with Friend" : "Play vs Computer";
  restartGame();
}

function computerMove() {
  let available = options.map((val, idx) => val === "" ? idx : null).filter(v => v !== null);
  if (available.length === 0) return;

  let move = available[Math.floor(Math.random() * available.length)];
  let cell = document.querySelector(`.cell[data-index="${move}"]`);
  updateCell(cell, move);
  checkWinner();
}

function toggleDarkMode() {
  const isDark = darkToggle.checked;
  document.body.classList.toggle("dark-mode", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// --- CONFETTI FUNCTIONS ---
function startConfetti() {
    console.log("Starting confetti!"); // Log to confirm the function is called
    confettiContainer.style.display = 'block'; // Show the confetti container

    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#f80', '#80f']; // Confetti colors
    const numConfetti = 70; // Number of confetti pieces (adjust as needed)

    for (let i = 0; i < numConfetti; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');

        // Randomize color
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Randomize initial horizontal position across the viewport width
        piece.style.left = Math.random() * 100 + 'vw'; // Use vw for viewport width
        // Start slightly above the viewport top
        piece.style.top = -Math.random() * 50 + 'px'; // Start slightly above viewport top

        // Randomize animation duration and delay
        const duration = Math.random() * 3 + 2; // Animation duration between 2 and 5 seconds
        const delay = Math.random() * 0.4; // Animation delay between 0 and 0.4 seconds

        // Apply the animation
        piece.style.animation = `fall ${duration}s linear ${delay}s forwards`;

        confettiContainer.appendChild(piece);

        // Remove piece after animation finishes
        piece.addEventListener('animationend', () => {
            piece.remove();
        });
    }
}

function stopConfetti() {
    confettiContainer.style.display = 'none';
    // Clear all existing confetti pieces
    while (confettiContainer.firstChild) {
        confettiContainer.removeChild(confettiContainer.firstChild);
    }
}


init();
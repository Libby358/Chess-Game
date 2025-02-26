const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const restartButton = document.getElementById("restart");

const board = Chessboard(boardElement, {
    draggable: true,
    position: "start",
    onDrop: handleMove,
});

const game = new Chess();
const aiEngine = new Worker("stockfish.js"); // AI Engine

restartButton.addEventListener("click", resetGame);

function handleMove(source, target) {
    let move = game.move({ from: source, to: target, promotion: "q" });

    if (!move) return "snapback";

    updateStatus();
    setTimeout(makeAIMove, 500); // AI moves after 500ms
}

function makeAIMove() {
    if (game.game_over()) return;

    aiEngine.postMessage("position fen " + game.fen());
    aiEngine.postMessage("go depth 10");

    aiEngine.onmessage = function (event) {
        let bestMove = event.data.match(/bestmove (\S+)/);
        if (bestMove) {
            game.move(bestMove[1]);
            board.position(game.fen());
            updateStatus();
        }
    };
}

function updateStatus() {
    if (game.in_checkmate()) {
        statusElement.innerText = "Game Over: Checkmate!";
    } else if (game.in_draw()) {
        statusElement.innerText = "Game Over: Draw!";
    } else {
        statusElement.innerText = game.turn() === "w" ? "Your Move" : "AI Thinking...";
    }
}

function resetGame() {
    game.reset();
    board.position("start");
    statusElement.innerText = "Your Move";
}

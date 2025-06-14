export function findBestMove(
  currentBoard,
  currentPlayer,
  opponentPlayer,
  currentHistory,
  checkWinnerFunction,
) {
  const availableMoves = currentBoard
    .map((cell, index) => (cell === null ? index : null))
    .filter((val) => val !== null);

  const simulateMove = (boardToSimulate, move, player, historyToSimulate) => {
    const newBoard = [...boardToSimulate];
    const newHistory = JSON.parse(JSON.stringify(historyToSimulate));

    if (newHistory[player].length >= 3) {
      const oldestMove = newHistory[player][0];
      newBoard[oldestMove] = null;
      newHistory[player] = [...newHistory[player].slice(1), move];
    } else {
      newHistory[player] = [...newHistory[player], move];
    }
    newBoard[move] = player;
    return { newBoard, newHistory };
  };

  if (availableMoves.length === 0) {
    return null;
  }

  // 1) Try to win
  for (let i = 0; i < availableMoves.length; i++) {
    const move = availableMoves[i];
    const { newBoard } = simulateMove(
      currentBoard,
      move,
      currentPlayer,
      currentHistory,
    );
    if (checkWinnerFunction(newBoard)?.winner === currentPlayer) {
      return move;
    }
  }

  // 2) Block opponent from winning
  for (let i = 0; i < availableMoves.length; i++) {
    const move = availableMoves[i];
    const { newBoard } = simulateMove(
      currentBoard,
      move,
      opponentPlayer,
      currentHistory,
    );
    if (checkWinnerFunction(newBoard)?.winner === opponentPlayer) {
      return move;
    }
  }

  // 3) Aim for the center
  if (currentBoard[4] === null) {
    return 4;
  }

  // 4) Aim for any corner
  const corners = [0, 2, 6, 8].filter((index) => currentBoard[index] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5) Any random position
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

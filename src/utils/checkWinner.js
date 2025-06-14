import { combinations } from "./combinations";

export function checkWinner(currentBoard) {
  for (let combination of combinations) {
    const [a, b, c] = combination;
    if (
      currentBoard[a] &&
      currentBoard[a] === currentBoard[b] &&
      currentBoard[a] === currentBoard[c]
    ) {
      return { winner: currentBoard[a], line: combination };
    }
  }
  return null;
}

import { useState, useEffect, useCallback, useRef } from "react";
import { checkWinner } from "./utils/checkWinner";
import { findBestMove } from "./utils/helper";
import Board from "./ui/Board";

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameHistory, setGameHistory] = useState({ X: [], O: [] });
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [animatingCells, setAnimatingCells] = useState({});
  const [gameMode, setGameMode] = useState("multiplayer"); // 'multiplayer' or 'singleplayer'

  const boardRef = useRef(null);

  const handleCellClick = useCallback(
    (index, isBotMove = false) => {
      if (board[index] || winner) return;

      if (gameMode === "singleplayer" && !isXNext && !isBotMove) {
        return;
      }

      const currentPlayer = isXNext ? "X" : "O";
      let newBoard = [...board];
      let newHistory = { ...gameHistory };

      setAnimatingCells((prev) => ({ ...prev, [index]: "add" }));

      if (newHistory[currentPlayer].length >= 3) {
        const oldestMove = newHistory[currentPlayer][0];
        newBoard[oldestMove] = null;
        setAnimatingCells((prev) => ({ ...prev, [oldestMove]: "remove" }));
        newHistory[currentPlayer] = [
          ...newHistory[currentPlayer].slice(1),
          index,
        ];
      } else {
        newHistory[currentPlayer] = [...newHistory[currentPlayer], index];
      }

      newBoard[index] = currentPlayer;

      setBoard(newBoard);
      setGameHistory(newHistory);

      const result = checkWinner(newBoard);
      if (result) {
        setWinner(result.winner);
        setWinningLine(result.line);
      }

      setIsXNext(!isXNext);

      setTimeout(() => {
        setAnimatingCells({});
      }, 400);
    },
    [board, winner, gameMode, isXNext, gameHistory],
  );

  // AI's turn logic
  useEffect(() => {
    if (gameMode === "singleplayer" && !isXNext && !winner) {
      const aiMove = findBestMove(board, "O", "X", gameHistory, checkWinner);
      if (aiMove !== null) {
        setTimeout(() => {
          handleCellClick(aiMove, true);
        }, 700);
      }
    }
  }, [isXNext, gameMode, board, winner, gameHistory, handleCellClick]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameHistory({ X: [], O: [] });
    setWinner(null);
    setWinningLine([]);
    setAnimatingCells({});
  };

  // Memoized function for strike line styles, dependent on winningLine
  const getStrikeLineStyle = useCallback(() => {
    if (winningLine.length === 0) return {};

    const [a, b, c] = winningLine;
    const lineWidthPercent = (8 / boardRef.current.offsetWidth) * 100;
    const shortenFactor = 0.75; // Shorten the line to 75% of the cell width/height
    const commonLineStyle = {
      position: "absolute",
      backgroundColor: "#34D399", // emerald-400
      borderRadius: "9999px",
      boxShadow: "0 0 10px rgba(52, 211, 153, 0.5)",
      zIndex: 10,
      transformOrigin: "center center",
    };

    const adjustedSpanPercent = (100 / 3) * 3 * shortenFactor; // Effectively 100% * shortenFactor
    const offsetPercent = (100 - adjustedSpanPercent) / 2;

    if (a === 0 && b === 1 && c === 2) {
      // Top Row
      return {
        ...commonLineStyle,
        width: `${adjustedSpanPercent}%`,
        height: `${lineWidthPercent}px`,
        top: `${21 - lineWidthPercent / 2}%`,
        left: `${offsetPercent}%`,
      };
    } else if (a === 3 && b === 4 && c === 5) {
      // Middle Row
      return {
        ...commonLineStyle,
        width: `${adjustedSpanPercent}%`,
        height: `${lineWidthPercent}px`,
        top: `${51 - lineWidthPercent / 2}%`,
        left: `${offsetPercent}%`,
      };
    } else if (a === 6 && b === 7 && c === 8) {
      // Bottom Row
      return {
        ...commonLineStyle,
        width: `${adjustedSpanPercent}%`,
        height: `${lineWidthPercent}px`,
        top: `${82.33 - lineWidthPercent / 2}%`,
        left: `${offsetPercent}%`,
      };
    } else if (a === 0 && b === 3 && c === 6) {
      // Left Column
      return {
        ...commonLineStyle,
        height: `${adjustedSpanPercent}%`,
        width: `${lineWidthPercent}px`,
        left: `${20 - lineWidthPercent / 2}%`,
        top: `${offsetPercent}%`,
      };
    } else if (a === 1 && b === 4 && c === 7) {
      // Middle Column
      return {
        ...commonLineStyle,
        height: `${adjustedSpanPercent}%`,
        width: `${lineWidthPercent}px`,
        left: `${51 - lineWidthPercent / 2}%`,
        top: `${offsetPercent}%`,
      };
    } else if (a === 2 && b === 5 && c === 8) {
      // Right Column
      return {
        ...commonLineStyle,
        height: `${adjustedSpanPercent}%`,
        width: `${lineWidthPercent}px`,
        left: `${82 - lineWidthPercent / 2}%`,
        top: `${offsetPercent}%`,
      };
    } else if (a === 0 && b === 4 && c === 8) {
      // Top-left to Bottom-right Diagonal
      // A diagonal across a 100% x 100% square has a length of sqrt(2)*100% ~= 141.42%
      const fullDiagonalLength = 141.42;
      const adjustedDiagonalLength = fullDiagonalLength * shortenFactor;
      return {
        ...commonLineStyle,
        width: `${adjustedDiagonalLength}%`,
        height: `${lineWidthPercent}px`,
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) rotate(45deg)`,
      };
    } else if (a === 2 && b === 4 && c === 6) {
      // Top-right to Bottom-left Diagonal
      const fullDiagonalLength = 141.42;
      const adjustedDiagonalLength = fullDiagonalLength * shortenFactor;
      return {
        ...commonLineStyle,
        width: `${adjustedDiagonalLength}%`,
        height: `${lineWidthPercent}px`,
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) rotate(-45deg)`,
      };
    }

    return {};
  }, [winningLine]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">XO Infinite</h1>
          <p className="mb-4 text-sm text-balance text-gray-300">
            Each player can only have 3 pieces on the board!
          </p>

          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                setGameMode("multiplayer");
                resetGame();
              }}
              className={`rounded-l-lg px-4 py-2 font-semibold transition-colors duration-200 ${gameMode === "multiplayer" ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
            >
              2 Players
            </button>
            <button
              type="button"
              onClick={() => {
                setGameMode("singleplayer");
                resetGame();
              }}
              className={`rounded-r-lg px-4 py-2 font-semibold transition-colors duration-200 ${gameMode === "singleplayer" ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
            >
              Vs. AI
            </button>
          </div>

          {winner ? (
            <div className="mb-4 text-2xl font-bold text-emerald-400">
              {gameMode === "singleplayer"
                ? winner === "X"
                  ? "You "
                  : "AI "
                : `Player ${winner} `}
              Won! 🎉
            </div>
          ) : (
            <div className="text-xl font-semibold text-gray-100">
              Current Player:{" "}
              <span
                className={`${isXNext ? "text-cyan-400" : "text-pink-400"}`}
              >
                {isXNext ? "X" : "O"}
              </span>
            </div>
          )}
        </div>

        <Board
          board={board}
          handleCellClick={handleCellClick}
          winner={winner}
          gameMode={gameMode}
          isXNext={isXNext}
          animatingCells={animatingCells}
          boardRef={boardRef}
          getStrikeLineStyle={getStrikeLineStyle}
        />

        <button
          type="button"
          onClick={resetGame}
          className="w-full transform rounded-xl bg-gradient-to-r from-cyan-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-cyan-700 hover:to-pink-700"
        >
          New Game
        </button>

        <div className="mt-6 rounded-lg bg-gray-700 p-4 text-xs text-gray-300">
          <h3 className="mb-2 font-semibold text-white">Game Rules:</h3>
          <ul className="list-disc space-y-1 pl-4">
            <li>Each player can have maximum 3 pieces on the board</li>
            <li>
              After 3 moves, your oldest piece disappears when you place a new
              one
            </li>
            <li>First to get 3 in a row wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TicTacToe;

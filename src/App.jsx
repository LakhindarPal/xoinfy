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
      <div className="w-full max-w-md rounded-3xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white">
            XO Infinite
          </h1>
          <div className="mb-6 flex justify-center rounded-lg bg-gray-700/50 p-1 shadow-inner">
            <button
              onClick={() => {
                setGameMode("multiplayer");
                resetGame();
              }}
              className={`flex-1 rounded-lg px-4 py-3 font-semibold transition-all duration-300 ${gameMode === "multiplayer" ? "bg-indigo-600 text-white shadow-md" : "text-gray-300 hover:bg-gray-600/50 hover:text-white"}`}
            >
              2 Players
            </button>
            <button
              onClick={() => {
                setGameMode("singleplayer");
                resetGame();
              }}
              className={`flex-1 rounded-lg px-4 py-3 font-semibold transition-all duration-300 ${gameMode === "singleplayer" ? "bg-indigo-600 text-white shadow-md" : "text-gray-300 hover:bg-gray-600/50 hover:text-white"}`}
            >
              Vs. AI
            </button>
          </div>

          {winner ? (
            <div className="animate-pulse-once mb-4 text-3xl font-bold text-emerald-400">
              {gameMode === "singleplayer"
                ? winner === "X"
                  ? "You"
                  : "AI"
                : `Player ${winner}`}{" "}
              Won!
              <span role="img" aria-label="party popper">
                🎉
              </span>
            </div>
          ) : (
            <div className="text-2xl font-semibold text-gray-200">
              {gameMode === "singleplayer" ? (
                isXNext ? (
                  <span className="animate-fade-in-out text-cyan-400">
                    Your Turn (X)
                  </span>
                ) : (
                  <span className="animate-fade-in-out text-fuchsia-400">
                    AI's Turn (O)
                  </span>
                )
              ) : (
                <span
                  className={`${isXNext ? "text-cyan-400" : "text-fuchsia-400"} animate-fade-in-out`}
                >
                  Player {isXNext ? "X" : "O"}'s Turn
                </span>
              )}
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
          onClick={resetGame}
          className="focus:ring-opacity-50 mt-8 w-full transform rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-800 hover:shadow-xl focus:ring-4 focus:ring-indigo-500 focus:outline-none"
        >
          Start New Game
        </button>

        <div className="mt-8 rounded-xl border border-gray-600/30 bg-gray-700/40 p-5 text-xs text-gray-400">
          <h3 className="mb-3 text-lg font-bold text-white">Game Rules:</h3>
          <ul className="space-y-2 leading-relaxed">
            <li>
              • Each player can only have a maximum of 3 pieces on the board at
              any given time.
            </li>
            <li>
              • After placing 3 pieces, your oldest piece will disappear when
              you place a new one.
            </li>
            <li>
              • The first player to get 3 of their pieces in a row
              (horizontally, vertically, or diagonally) wins!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TicTacToe;

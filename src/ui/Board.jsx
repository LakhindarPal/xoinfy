const Board = ({
  board,
  handleCellClick,
  winner,
  gameMode,
  isXNext,
  animatingCells,
  boardRef,
  getStrikeLineStyle,
}) => {
  return (
    <div className="relative mb-8">
      <div
        ref={boardRef}
        className="relative grid grid-cols-3 gap-2 rounded-xl bg-gray-700 p-4"
      >
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            className={`flex aspect-square transform items-center justify-center rounded-lg border-2 border-transparent bg-gray-600 text-4xl font-bold shadow-md transition-all duration-300 hover:scale-105 hover:bg-gray-500 hover:shadow-lg ${cell === "X" ? "border-cyan-400/30 text-cyan-400" : cell === "O" ? "border-pink-400/30 text-pink-400" : ""} ${animatingCells[index] === "add" ? "animate-cell-add" : ""} ${animatingCells[index] === "remove" ? "animate-cell-remove" : ""} ${!cell && !winner ? "cursor-pointer hover:border-gray-400/50 hover:bg-gray-500" : ""} ${winner || (gameMode === "singleplayer" && !isXNext) ? "cursor-not-allowed" : ""} `}
            disabled={winner || (gameMode === "singleplayer" && !isXNext)}
          >
            <span
              className={`transition-all duration-300 ${
                animatingCells[index] === "add"
                  ? "animate-text-appear"
                  : animatingCells[index] === "remove"
                    ? "animate-text-disappear"
                    : ""
              }`}
            >
              {cell}
            </span>
          </button>
        ))}

        {winner && (
          <div
            className="animate-strike-line absolute rounded-full bg-emerald-400 shadow-lg"
            style={getStrikeLineStyle()}
          />
        )}
      </div>
    </div>
  );
};

export default Board;

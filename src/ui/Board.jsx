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
        className="shadow-inner-lg relative grid grid-cols-3 gap-3 rounded-2xl bg-gray-900/60 p-5"
      >
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            className={`flex aspect-square items-center justify-center rounded-lg border-2 bg-gray-800 text-5xl font-extrabold shadow-xl transition-all duration-300 ease-out ${cell === "X" ? "border-cyan-500/40 text-cyan-400" : cell === "O" ? "border-fuchsia-500/40 text-fuchsia-400" : "border-gray-700/50 text-transparent"} ${!cell && !winner ? "cursor-pointer hover:scale-102 hover:bg-gray-700/70 hover:shadow-2xl" : ""} ${winner || (gameMode === "singleplayer" && !isXNext) ? "cursor-not-allowed opacity-70" : ""} ${animatingCells[index] === "add" ? "animate-cell-add" : ""} ${animatingCells[index] === "remove" ? "animate-cell-remove" : ""} `}
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
            className="animate-strike-line absolute"
            style={getStrikeLineStyle()}
          />
        )}
      </div>
    </div>
  );
};

export default Board;

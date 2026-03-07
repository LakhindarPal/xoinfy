export type Mark = "x" | "o";
export type Cell = Mark | null;
export type Mode = "bot" | "pvp";
export type Screen = "menu" | "game";
export type Moves = Record<Mark, number[]>;

export type GameState = {
  screen: Screen;
  mode: Mode;
  myMark: Mark;
  board: Cell[];
  moves: Moves;
  turn: Mark;
  timeLeft: number;
  score: {
    x: number;
    o: number;
  };
  showReset: boolean;
  roundOver: boolean;
  timedOut: boolean;
  winner: Mark | null;
  winLine: number[] | null;
};

import type { Cell, Mark, Moves } from "./model";

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;
const CORNERS = [0, 2, 6, 8] as const;
const EDGES = [1, 3, 5, 7] as const;

export function blankBoard(): Cell[] {
  return Array.from({ length: 9 }, () => null);
}

export function blankMoves(): Moves {
  return { x: [], o: [] };
}

export function otherMark(current: Mark): Mark {
  return current === "x" ? "o" : "x";
}

export function boardFrom(moves: Moves): Cell[] {
  const board = blankBoard();

  for (const i of moves.x) {
    board[i] = "x";
  }

  for (const i of moves.o) {
    board[i] = "o";
  }

  return board;
}

function findWin(lineMoves: number[]): number[] | null {
  if (lineMoves.length < 3) {
    return null;
  }

  const set = new Set(lineMoves);
  for (const line of WIN_LINES) {
    if (line.every((pos) => set.has(pos))) {
      return [...line];
    }
  }

  return null;
}

export function evalRound(moves: Moves): { winner: Mark | null; winLine: number[] | null } {
  const xWin = findWin(moves.x);
  if (xWin) {
    return { winner: "x", winLine: xWin };
  }

  const oWin = findWin(moves.o);
  if (oWin) {
    return { winner: "o", winLine: oWin };
  }

  return { winner: null, winLine: null };
}

export function isTaken(moves: Moves, i: number): boolean {
  return moves.x.includes(i) || moves.o.includes(i);
}

export function pushMove(moves: Moves, mark: Mark, i: number): Moves {
  const list = [...moves[mark]];
  if (list.length === 3) {
    list.shift();
  }
  list.push(i);

  return {
    ...moves,
    [mark]: list,
  };
}

export function openCells(moves: Moves): number[] {
  const cells: number[] = [];

  for (let i = 0; i < 9; i += 1) {
    if (!isTaken(moves, i)) {
      cells.push(i);
    }
  }

  return cells;
}

export function chooseBotCell(moves: Moves, bot: Mark, human: Mark): number {
  const open = openCells(moves);
  if (open.length === 0) {
    return -1;
  }

  for (const i of open) {
    const sim = pushMove(moves, bot, i);
    if (evalRound(sim).winner === bot) {
      return i;
    }
  }

  for (const i of open) {
    const sim = pushMove(moves, human, i);
    if (evalRound(sim).winner === human) {
      return i;
    }
  }

  if (open.includes(4)) {
    return 4;
  }

  for (const i of CORNERS) {
    if (open.includes(i)) {
      return i;
    }
  }

  for (const i of EDGES) {
    if (open.includes(i)) {
      return i;
    }
  }

  return open[Math.floor(Math.random() * open.length)] ?? -1;
}

export function isMoveList(v: unknown): v is number[] {
  return (
    Array.isArray(v) && v.length <= 3 && v.every((i) => Number.isInteger(i) && i >= 0 && i <= 8)
  );
}

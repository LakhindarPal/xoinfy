import { computed, ref, watch } from "vue";

import {
  blankBoard,
  blankMoves,
  boardFrom,
  chooseBotCell,
  evalRound,
  isMoveList,
  otherMark,
  pushMove,
} from "./logic";
import type { GameState, Mark, Mode } from "./model";

const STORE_KEY = "xoinfy:tictactoe:v3";
const TURN_SEC = 10;
const START_MARK: Mark = "x";

function zeroScore(): GameState["score"] {
  return { x: 0, o: 0 };
}

function baseRound(
  score: GameState["score"],
): Pick<
  GameState,
  | "board"
  | "moves"
  | "turn"
  | "timeLeft"
  | "score"
  | "showReset"
  | "roundOver"
  | "timedOut"
  | "winner"
  | "winLine"
> {
  return {
    board: blankBoard(),
    moves: blankMoves(),
    turn: START_MARK,
    timeLeft: TURN_SEC,
    score,
    showReset: false,
    roundOver: false,
    timedOut: false,
    winner: null,
    winLine: null,
  };
}

function initialGame(): GameState {
  return {
    screen: "menu",
    mode: "bot",
    myMark: START_MARK,
    ...baseRound(zeroScore()),
  };
}

function isMark(v: unknown): v is Mark {
  return v === "x" || v === "o";
}

function isMode(v: unknown): v is Mode {
  return v === "bot" || v === "pvp";
}

function isBool(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function sameBoard(a: GameState["board"], b: GameState["board"]): boolean {
  return a.length === b.length && a.every((cell, i) => cell === b[i]);
}

function isGameState(v: unknown): v is GameState {
  if (!v || typeof v !== "object") {
    return false;
  }

  const s = v as Partial<GameState>;
  if (!(s.screen === "menu" || s.screen === "game")) {
    return false;
  }

  if (!isMode(s.mode) || !isMark(s.myMark) || !isMark(s.turn)) {
    return false;
  }

  if (typeof s.timeLeft !== "number" || s.timeLeft < 0) {
    return false;
  }

  if (!s.moves || typeof s.moves !== "object" || Array.isArray(s.moves)) {
    return false;
  }

  if (!isMoveList(s.moves.x) || !isMoveList(s.moves.o)) {
    return false;
  }

  const taken = [...s.moves.x, ...s.moves.o];
  if (new Set(taken).size !== taken.length) {
    return false;
  }

  if (!Array.isArray(s.board) || s.board.length !== 9) {
    return false;
  }

  const fromMoves = boardFrom({ x: s.moves.x, o: s.moves.o });
  if (!sameBoard(fromMoves, s.board)) {
    return false;
  }

  if (!s.score || typeof s.score !== "object" || Array.isArray(s.score)) {
    return false;
  }

  if (typeof s.score.x !== "number" || typeof s.score.o !== "number") {
    return false;
  }

  if (!isBool(s.showReset) || !isBool(s.roundOver) || !isBool(s.timedOut)) {
    return false;
  }

  if (!(isMark(s.winner) || s.winner === null)) {
    return false;
  }

  return s.winLine === null || (Array.isArray(s.winLine) && s.winLine.length === 3);
}

function loadGame(): GameState {
  const fallback = initialGame();

  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as unknown;
    return isGameState(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function withScore(score: GameState["score"], winner: Mark): GameState["score"] {
  return {
    ...score,
    [winner]: score[winner] + 1,
  };
}

export function useTicTacToe() {
  const game = ref<GameState>(loadGame());
  const hoverCell = ref<number | null>(null);

  const inGame = computed(() => game.value.screen === "game");
  const myMark = computed(() => game.value.myMark);
  const botMark = computed(() => otherMark(game.value.myMark));
  const canAct = computed(
    () => game.value.screen === "game" && !game.value.roundOver && !game.value.showReset,
  );

  const botTurn = computed(
    () => canAct.value && game.value.mode === "bot" && game.value.turn === botMark.value,
  );

  const showModal = computed(() => game.value.showReset || game.value.roundOver);

  const canPreview = computed(
    () => canAct.value && (game.value.mode === "pvp" || game.value.turn === myMark.value),
  );

  const scoreText = computed(() => {
    if (game.value.mode === "bot") {
      return {
        x: game.value.myMark === "x" ? "X (YOU)" : "X (BOT)",
        o: game.value.myMark === "o" ? "O (YOU)" : "O (BOT)",
      };
    }

    return {
      x: game.value.myMark === "x" ? "X (P1)" : "X (P2)",
      o: game.value.myMark === "o" ? "O (P1)" : "O (P2)",
    };
  });

  const roundText = computed(() => {
    if (!game.value.roundOver || !game.value.winner) {
      return "";
    }

    if (game.value.mode === "bot") {
      if (game.value.winner === game.value.myMark) {
        return game.value.timedOut ? "YOU WON! (BOT TIMED OUT)" : "YOU WON!";
      }
      return game.value.timedOut ? "OH NO, YOU LOST... (TIME OUT)" : "OH NO, YOU LOST...";
    }

    if (game.value.winner === game.value.myMark) {
      return game.value.timedOut ? "PLAYER 1 WINS! (TIME OUT)" : "PLAYER 1 WINS!";
    }

    return game.value.timedOut ? "PLAYER 2 WINS! (TIME OUT)" : "PLAYER 2 WINS!";
  });

  function pickMark(mark: Mark): void {
    if (game.value.screen !== "menu") {
      return;
    }

    game.value = {
      ...game.value,
      myMark: mark,
    };
  }

  function expiringAt(i: number): Mark | null {
    const current = game.value.turn;
    return game.value.moves[current].length === 3 && game.value.moves[current][0] === i
      ? current
      : null;
  }

  function newGame(mode: Mode): void {
    game.value = {
      ...game.value,
      screen: "game",
      mode,
      ...baseRound(zeroScore()),
    };
  }

  function play(i: number, mark: Mark): void {
    const moves = pushMove(game.value.moves, mark, i);
    const board = boardFrom(moves);
    const result = evalRound(moves);

    if (result.winner) {
      game.value = {
        ...game.value,
        board,
        moves,
        roundOver: true,
        timedOut: false,
        winner: result.winner,
        winLine: result.winLine,
        score: withScore(game.value.score, result.winner),
      };
      return;
    }

    game.value = {
      ...game.value,
      board,
      moves,
      turn: otherMark(mark),
      timeLeft: TURN_SEC,
    };
  }

  function onTimeout(): void {
    if (!canAct.value) {
      return;
    }

    const winner = otherMark(game.value.turn);

    game.value = {
      ...game.value,
      timeLeft: 0,
      roundOver: true,
      timedOut: true,
      winner,
      winLine: null,
      score: withScore(game.value.score, winner),
    };
  }

  function playCell(i: number): void {
    if (!canAct.value || game.value.board[i] !== null) {
      return;
    }

    if (game.value.mode === "bot" && game.value.turn !== myMark.value) {
      return;
    }

    play(i, game.value.turn);
  }

  function next(): void {
    game.value = {
      ...game.value,
      ...baseRound(game.value.score),
    };
  }

  function quit(): void {
    game.value = initialGame();
  }

  function openReset(): void {
    if (game.value.screen !== "game" || game.value.roundOver) {
      return;
    }

    game.value = {
      ...game.value,
      showReset: true,
    };
  }

  function closeReset(): void {
    game.value = {
      ...game.value,
      showReset: false,
    };
  }

  function resetGame(): void {
    game.value = {
      ...game.value,
      ...baseRound(zeroScore()),
    };
  }

  function botPlay(): void {
    if (!botTurn.value) {
      return;
    }

    const i = chooseBotCell(game.value.moves, botMark.value, myMark.value);
    if (i >= 0) {
      play(i, botMark.value);
    }
  }

  watch(
    game,
    (nextGame) => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(nextGame));
      } catch {
        // Ignore storage write errors (private mode/full quota).
      }
    },
    { deep: true },
  );

  watch(
    () => [botTurn.value, game.value.moves.x.length, game.value.moves.o.length] as const,
    ([active], _, onCleanup) => {
      if (!active) return;
      const tick = setTimeout(() => botPlay(), 420);
      onCleanup(() => clearTimeout(tick));
    },
  );

  watch(canPreview, (active, _, onCleanup) => {
    if (!active) return;
    const tick = setInterval(() => {
      if (game.value.timeLeft <= 1) {
        onTimeout();
      } else {
        game.value = {
          ...game.value,
          timeLeft: game.value.timeLeft - 1,
        };
      }
    }, 1000);
    onCleanup(() => clearInterval(tick));
  });

  return {
    game,
    hoverCell,
    inGame,
    showModal,
    canPreview,
    scoreText,
    roundText,
    pickMark,
    expiringAt,
    newGame,
    playCell,
    next,
    quit,
    openReset,
    closeReset,
    resetGame,
  };
}

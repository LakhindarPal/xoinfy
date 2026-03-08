<script setup lang="ts">
import logo from "./assets/logo.svg";
import iconX from "./assets/icons/icon-x.svg";
import iconO from "./assets/icons/icon-o.svg";
import iconXDefault from "./assets/icons/icon-x-default.svg";
import iconODefault from "./assets/icons/icon-o-default.svg";
import iconXOutline from "./assets/icons/icon-x-outline.svg";
import iconOOutline from "./assets/icons/icon-o-outline.svg";
import iconXWin from "./assets/icons/icon-x-win.svg";
import iconOWin from "./assets/icons/icon-o-win.svg";
import iconRestart from "./assets/icons/icon-restart.svg";
import { useTicTacToe } from "./game/useTTT";
import type { Mark } from "./game/model";

const {
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
} = useTicTacToe();

const ICONS = {
  x: {
    normal: iconX,
    win: iconXWin,
    outline: iconXOutline,
    default: iconXDefault,
  },
  o: {
    normal: iconO,
    win: iconOWin,
    outline: iconOOutline,
    default: iconODefault,
  },
} as const;

function iconForMark(mark: Mark, variant: "normal" | "win" | "outline" | "default"): string {
  return ICONS[mark][variant];
}
</script>

<template>
  <main class="min-h-dvh bg-navy-dark px-6 py-8 text-silver">
    <section
      v-if="!inGame"
      class="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-115 items-center justify-center"
    >
      <div class="w-full max-w-82 sm:max-w-115">
        <img :src="logo" alt="XO" width="72" height="32" class="mx-auto mb-8 h-8 w-18 sm:mb-10" />

        <div class="panel-shadow mb-6 rounded-[0.95rem] bg-navy p-6 text-center sm:mb-10">
          <p class="mb-2 text-base font-bold tracking-[0.06em]">PICK YOUR MARK</p>
          <p class="mb-4 text-sm font-semibold tracking-[0.07em] text-silver/90">
            REMEMBER : X GOES FIRST
          </p>

          <div class="mb-4 grid h-18 grid-cols-2 gap-2 rounded-[0.7rem] bg-navy-dark p-2">
            <button
              v-for="mark in ['x', 'o'] as const"
              :key="mark"
              type="button"
              :aria-label="`Pick ${mark.toUpperCase()}`"
              class="group cursor-pointer rounded-[0.65rem] transition"
              :class="
                game.myMark === mark
                  ? 'bg-silver'
                  : 'bg-transparent hover:bg-silver/10 active:bg-silver/20'
              "
              @click="pickMark(mark)"
            >
              <img
                :src="mark === 'x' ? iconXDefault : iconODefault"
                :alt="`Pick ${mark.toUpperCase()}`"
                class="mx-auto h-8 w-8 sm:h-10 sm:w-10 opacity-95"
                :class="game.myMark === mark ? '' : 'icon-muted'"
              />
            </button>
          </div>

          <p class="text-sm tracking-[0.07em] text-silver/90">
            You picked
            <span class="font-bold text-silver">{{ game.myMark.toUpperCase() }}</span>
          </p>

          <div class="mt-4 rounded-[0.7rem] bg-navy-dark/65 p-4 text-left">
            <p class="mb-2 text-xs font-bold tracking-[0.08em] text-silver">HOW TO PLAY</p>
            <ul
              class="space-y-1 text-xs font-medium tracking-[0.03em] text-silver/90 list-disc list-inside"
            >
              <li>You can only have 3 marks on the board at a time.</li>
              <li>Placing a 4th mark will remove your oldest mark.</li>
              <li>Get your 3 active marks in a row to win the round!</li>
              <li>Move before the timer runs out, or you forfeit the round.</li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          class="btn-shadow-yellow mb-5 h-auto min-h-14 w-full cursor-pointer rounded-[0.95rem] bg-yellow py-3 pb-5 text-[1.5rem] font-bold tracking-[0.04em] text-navy-dark transition hover:bg-yellow-hover active:translate-y-px sm:py-4 sm:pb-6"
          @click="newGame('bot')"
        >
          NEW GAME (VS BOT)
        </button>

        <button
          type="button"
          class="btn-shadow-cyan h-auto min-h-14 w-full cursor-pointer rounded-[0.95rem] bg-cyan py-3 pb-5 text-[1.5rem] font-bold tracking-[0.04em] text-navy-dark transition hover:bg-cyan-hover active:translate-y-px sm:py-4 sm:pb-6"
          @click="newGame('pvp')"
        >
          NEW GAME (VS PLAYER)
        </button>
      </div>
    </section>

    <section
      v-else
      class="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-115 items-center justify-center"
    >
      <div class="w-full max-w-82 sm:max-w-115">
        <div class="mb-5 flex justify-center sm:mb-5">
          <img :src="logo" alt="XO" width="72" height="32" class="h-8 w-18" />
        </div>

        <header class="mb-5 grid grid-cols-[1fr_1fr_auto] items-center gap-[0.6rem] sm:gap-5">
          <div
            class="panel-shadow flex h-10 items-center justify-center gap-2 rounded-[0.6rem] bg-navy text-sm font-bold tracking-[0.06em] sm:h-13 sm:rounded-[0.7rem] sm:text-lg"
          >
            <img
              :src="iconForMark(game.turn, 'default')"
              alt="turn"
              class="icon-muted h-4 w-4 sm:h-5 sm:w-5"
            />
            TURN
          </div>

          <div
            class="panel-shadow flex h-10 items-center justify-center gap-2 rounded-[0.6rem] bg-navy text-sm font-bold tracking-[0.06em] sm:h-13 sm:rounded-[0.7rem] sm:text-lg"
          >
            <span> TIME </span>
            <span class="tracking-[0.05em] text-silver"> {{ game.timeLeft }}s </span>
          </div>

          <button
            type="button"
            aria-label="Restart Game"
            class="btn-shadow-gray flex h-10 w-10 cursor-pointer items-center justify-center rounded-[0.6rem] bg-silver transition hover:bg-silver-hover active:translate-y-px sm:h-13 sm:w-13 sm:rounded-[0.7rem]"
            @click="openReset"
          >
            <img
              :src="iconRestart"
              alt="Restart"
              width="20"
              height="20"
              class="h-4 w-4 sm:h-5 sm:w-5"
            />
          </button>
        </header>

        <div class="grid grid-cols-3 gap-[0.8rem] sm:gap-5">
          <button
            v-for="(_, index) in game.board"
            :key="index"
            type="button"
            :aria-label="`Play cell ${index}`"
            class="panel-shadow relative h-24 rounded-[0.95rem] bg-navy transition sm:h-35"
            :class="[
              game.board[index] === null && canPreview
                ? 'cursor-pointer hover:bg-navy-hover'
                : 'cursor-default',
              game.winLine?.includes(index) && game.winner === 'x' ? 'bg-cyan' : '',
              game.winLine?.includes(index) && game.winner === 'o' ? 'bg-yellow' : '',
              expiringAt(index) && !game.roundOver ? 'expiring-cell' : '',
            ]"
            @mouseenter="hoverCell = index"
            @mouseleave="hoverCell = null"
            @click="playCell(index)"
          >
            <img
              v-if="game.board[index]"
              :src="
                game.winLine?.includes(index) && game.winner
                  ? iconForMark(game.board[index] as Mark, 'win')
                  : expiringAt(index) === game.board[index] && !game.roundOver
                    ? iconForMark(game.board[index] as Mark, 'default')
                    : iconForMark(game.board[index] as Mark, 'normal')
              "
              :alt="game.board[index] as string"
              class="mx-auto h-10 w-10 sm:h-16 sm:w-16"
              :class="
                expiringAt(index) === game.board[index] && !game.roundOver ? 'expiring-icon' : ''
              "
            />

            <img
              v-else-if="canPreview && hoverCell === index"
              :src="iconForMark(game.turn, 'outline')"
              :alt="`${game.turn} preview`"
              class="mx-auto h-10 w-10 sm:h-16 sm:w-16"
            />
          </button>
        </div>

        <footer
          class="mt-5 grid grid-cols-2 gap-[0.8rem] text-center text-xs font-medium tracking-[0.06em] text-navy-dark sm:mt-5 sm:gap-5 sm:text-sm"
        >
          <div class="rounded-[0.95rem] bg-cyan py-2 sm:py-3">
            <p>{{ scoreText.x }}</p>
            <p class="text-xl font-bold leading-tight sm:text-2xl">{{ game.score.x }}</p>
          </div>

          <div class="rounded-[0.95rem] bg-yellow py-2 sm:py-3">
            <p>{{ scoreText.o }}</p>
            <p class="text-xl font-bold leading-tight sm:text-2xl">{{ game.score.o }}</p>
          </div>
        </footer>
      </div>
    </section>

    <div v-if="showModal" class="fixed inset-0 z-20 bg-black/50">
      <div class="mt-[33vh] bg-navy px-6 py-10 text-center sm:py-12">
        <template v-if="game.showReset">
          <p class="mb-7 text-[2.5rem] font-bold tracking-[0.06em] text-silver">RESTART GAME?</p>

          <div class="flex justify-center gap-4">
            <button
              type="button"
              class="btn-shadow-gray h-auto min-h-[3.2rem] cursor-pointer rounded-[0.7rem] bg-silver px-5 py-2 pb-4 text-xl font-bold tracking-[0.04em] text-navy-dark transition hover:bg-silver-hover active:translate-y-px sm:py-3 sm:pb-5"
              @click="closeReset"
            >
              NO, CANCEL
            </button>

            <button
              type="button"
              class="btn-shadow-yellow h-auto min-h-[3.2rem] cursor-pointer rounded-[0.7rem] bg-yellow px-5 py-2 pb-4 text-xl font-bold tracking-[0.04em] text-navy-dark transition hover:bg-yellow-hover active:translate-y-px sm:py-3 sm:pb-5"
              @click="resetGame"
            >
              YES, RESTART
            </button>
          </div>
        </template>

        <template v-else>
          <p
            v-if="game.winner"
            class="mb-2 text-base font-bold tracking-[0.07em] text-silver sm:text-xl"
          >
            {{ roundText }}
          </p>

          <div
            class="mb-7 flex items-center justify-center gap-4 text-[2.3rem] font-bold tracking-[0.05em] sm:text-[3.5rem]"
            :class="game.winner === 'x' ? 'text-cyan' : 'text-yellow'"
          >
            <img
              v-if="game.winner"
              :src="iconForMark(game.winner, 'normal')"
              :alt="game.winner"
              class="h-11 w-11 sm:h-16 sm:w-16"
            />

            <span>TAKES THE ROUND</span>
          </div>

          <div class="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              class="btn-shadow-gray h-auto min-h-[3.2rem] cursor-pointer rounded-[0.7rem] bg-silver px-5 py-2 pb-4 text-xl font-bold tracking-[0.04em] text-navy-dark transition hover:bg-silver-hover active:translate-y-px sm:py-3 sm:pb-5"
              @click="quit"
            >
              QUIT
            </button>

            <button
              type="button"
              class="btn-shadow-yellow h-auto min-h-[3.2rem] cursor-pointer rounded-[0.7rem] bg-yellow px-5 py-2 pb-4 text-xl font-bold tracking-[0.04em] text-navy-dark transition hover:bg-yellow-hover active:translate-y-px sm:py-3 sm:pb-5"
              @click="next"
            >
              NEXT ROUND
            </button>
          </div>
        </template>
      </div>
    </div>
  </main>
</template>

<style scoped>
.icon-muted {
  filter: brightness(0) saturate(100%) invert(79%) sepia(14%) saturate(256%) hue-rotate(153deg)
    brightness(88%) contrast(88%);
}

.panel-shadow {
  box-shadow: inset 0 -0.5rem 0 0 var(--color-navy-shadow);
}

.btn-shadow-yellow {
  box-shadow: inset 0 -0.5rem 0 0 var(--color-yellow-shadow);
}

.btn-shadow-cyan {
  box-shadow: inset 0 -0.5rem 0 0 var(--color-cyan-shadow);
}

.btn-shadow-gray {
  box-shadow: inset 0 -0.25rem 0 0 var(--color-silver-shadow);
}

.expiring-cell {
  box-shadow:
    inset 0 -0.5rem 0 0 var(--color-navy-shadow),
    inset 0 0 0 2px rgb(168 191 201 / 0.2);
}

.expiring-icon {
  animation: expire-pulse 1.2s ease-in-out infinite;
}

@keyframes expire-pulse {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.9;
  }

  50% {
    transform: scale(1);
    opacity: 0.45;
  }
}
</style>

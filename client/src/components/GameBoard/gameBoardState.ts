import React, { Reducer, useReducer } from "react";
import { GameBoard as GameBoardType, GameState, GuessState, LetterGuess } from "codegen";
import { KeyboardState } from "components/Keyboard";

export enum BoardRowType {
  GUESSED,
  GUESSING,
  REMAINING,
}

export type BoardCell = {
  letter: string;
  guess?: LetterGuess;
  animate: boolean;
};

export type BoardRow = {
  type: BoardRowType;
  letters: BoardCell[];
};

export type GameBoardState = {
  wrongGuess?: string;
  isModalOpen: boolean;
  correctLetters: KeyboardState;
  incorrectLetters: KeyboardState;
  inWordLetters: KeyboardState;
  gameBoardState: BoardRow[];
  currentGuessState: BoardCell[];
  pendingGuess?: string;
  initialLoad: boolean;
};

export type GameBoardAction =
  | { type: "letter_pressed"; letter: string; state: GameState }
  | { type: "backspace_pressed" }
  | { type: "guess"; state: GameState }
  | { type: "guess_success" }
  | { type: "guess_error"; message: string }
  | { type: "dismiss_guess_error" }
  | { type: "open_modal" }
  | { type: "close_modal" }
  | { type: "recompute_game_board"; guesses: GameBoardType["guesses"] }
  | { type: "animate_up_to"; upTo: number; lastGuess: GuessState[] };

const gameReducer: Reducer<GameBoardState, GameBoardAction> = (
  previousState: GameBoardState,
  action: GameBoardAction,
) => {
  switch (action.type) {
    case "letter_pressed":
      if (previousState.currentGuessState.length < 5 && action.state === GameState.InProgress) {
        const nextGuess = [
          ...previousState.currentGuessState,
          { letter: action.letter, animate: false },
        ];
        const nextGameBoardState = nextBoardState(previousState.gameBoardState, nextGuess);
        return {
          ...previousState,
          currentGuessState: nextGuess,
          gameBoardState: nextGameBoardState,
        };
      } else {
        return previousState;
      }
    case "backspace_pressed":
      if (previousState.currentGuessState.length !== 0) {
        const nextGuess = [
          ...previousState.currentGuessState.slice(0, previousState.currentGuessState.length - 1),
        ];
        const nextGameBoardState = nextBoardState(previousState.gameBoardState, nextGuess);
        return {
          ...previousState,
          currentGuessState: nextGuess,
          gameBoardState: nextGameBoardState,
        };
      }
      return previousState;
    case "guess":
      if (action.state !== GameState.InProgress) {
        return previousState;
      } else if (previousState.currentGuessState.length === 5) {
        return {
          ...previousState,
          pendingGuess: previousState.currentGuessState
            .map((curr) => curr.letter)
            .join("")
            .toLowerCase(),
        };
      } else {
        return { ...previousState, wrongGuess: "Too short" };
      }
    case "guess_success":
      return { ...previousState, pendingGuess: undefined };
    case "guess_error":
      return { ...previousState, wrongGuess: action.message, pendingGuess: undefined };
    case "dismiss_guess_error":
      return { ...previousState, wrongGuess: undefined };
    case "open_modal":
      return { ...previousState, isModalOpen: true };
    case "close_modal":
      return { ...previousState, isModalOpen: false };
    case "recompute_game_board":
      const boardRows: BoardRow[] =
        action.guesses.map((row) => {
          return {
            letters: row.map((guess) => ({
              letter: guess.letter.toUpperCase(),
              guess: guess.guess,
              animate: false,
            })),
            type: BoardRowType.GUESSED,
          };
        }) || [];
      if (boardRows.length < 6) {
        boardRows.push({
          letters: Array(5).fill({ letter: "", animate: false }),
          type: BoardRowType.GUESSING,
        });
      }

      if (boardRows.length < 6) {
        boardRows.push(
          ...Array(6 - boardRows.length).fill({
            type: BoardRowType.REMAINING,
            letters: Array(5).fill({ letter: "", animate: false }),
          }),
        );
      }

      const correctLetters: KeyboardState = {};
      const incorrectLetters: KeyboardState = {};
      const inWordLetters: KeyboardState = {};
      action.guesses.forEach((row) =>
        row.forEach((guess) => {
          switch (guess.guess) {
            case LetterGuess.InLocation:
              correctLetters[guess.letter.toUpperCase()] = true;
              break;
            case LetterGuess.InWord:
              inWordLetters[guess.letter.toUpperCase()] = true;
              break;
            case LetterGuess.Incorrect:
              incorrectLetters[guess.letter.toUpperCase()] = true;
              break;
          }
        }),
      );

      return {
        ...previousState,
        gameBoardState: boardRows,
        currentGuessState: [],
        incorrectLetters,
        inWordLetters,
        correctLetters,
      };
    case "animate_up_to":
      const nextGuessState: BoardRow = { type: BoardRowType.GUESSING, letters: [] };
      action.lastGuess.slice(0, action.upTo).forEach((value) => {
        nextGuessState.letters.push({
          ...value,
          letter: value.letter.toUpperCase(),
          animate: true,
        });
      });
      action.lastGuess.slice(action.upTo).forEach((value) => {
        nextGuessState.letters.push({
          ...value,
          letter: value.letter.toUpperCase(),
          animate: false,
        });
      });

      const nextGameBoardState: BoardRow[] = [
        ...previousState.gameBoardState.filter((v) => v.type === BoardRowType.GUESSED),
        nextGuessState,
        ...previousState.gameBoardState.filter((v) => v.type === BoardRowType.REMAINING),
      ];

      return { ...previousState, gameBoardState: nextGameBoardState };
    default:
      return previousState;
  }
};

function nextBoardState(previousGameBoard: BoardRow[], nextGuess: BoardCell[]): BoardRow[] {
  return [
    ...previousGameBoard.filter((v) => v.type === BoardRowType.GUESSED),
    {
      type: BoardRowType.GUESSING,
      letters: [...nextGuess, ...Array(5 - nextGuess.length).fill({ letter: "", animate: false })],
    },
    ...previousGameBoard.filter((v) => v.type === BoardRowType.REMAINING),
  ];
}

export function useGameBoardState(): [GameBoardState, (a: GameBoardAction) => void] {
  const [localState, dispatch] = useReducer(gameReducer, {
    isModalOpen: false,
    correctLetters: {},
    incorrectLetters: {},
    inWordLetters: {},
    gameBoardState: [],
    currentGuessState: [],
    initialLoad: false,
  });

  return [localState, dispatch];
}

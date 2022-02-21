import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  currentDayNumber,
  isBoardState,
  isGuesses,
  isSolutions,
} from "./boardUtils";

const MAX_GUESSES = 6;
const BOARD_STATE_STORAGE_KEY = "boardState";

enum GameStatus {
  IN_PROGRESS,
  WON,
  LOST,
}

type BoardState = {
  guesses: BoardCell[][];
  status: GameStatus;
  day: number;
};

export enum GuessStatus {
  INVALID,
  IN_WORD,
  IN_LOCATION,
}

type BoardCell = {
  letter: string;
  status: GuessStatus;
};

export function usePersistentBoardState() {
  const [validGuesses, setValidGuesses] = useState<Guesses>();
  const [solutions, setValidSolutions] = useState<string[]>();

  const [boardState, setBoardState] = useState<BoardState>({
    guesses: [],
    status: GameStatus.IN_PROGRESS,
    day: currentDayNumber(),
  });

  const [currentWordFailed, setCurrentWordFailed] = useState<boolean>();

  // load any state that might be persisted
  useEffect(() => {
    const persistedStateOrNull = localStorage.getItem(BOARD_STATE_STORAGE_KEY);
    if (persistedStateOrNull!!) {
      try {
        const result = JSON.parse(persistedStateOrNull);
        if (isBoardState(result)) {
          const state = result as BoardState;
          if (result.day === currentDayNumber()) {
            setBoardState(state);
          } else {
            setBoardState((prevState) => {
              persistState(prevState);
              return prevState;
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadOrFetchGuesses().then((guesses) => {
      setValidGuesses(guesses);
    });

    loadOrFetchSolutions().then((solutions) => {
      setValidSolutions(solutions);
    });
  }, []);

  const onGuess = useCallback(
    (guess: string) => {
      if (boardState.guesses.length === MAX_GUESSES) {
        return;
      }

      if (!!validGuesses && validGuesses[guess]) {
        const solution = !!solutions ? solutions[currentDayNumber()] : null;
        if (solution !== null) {
          const guessState = guess.split("").map((letter, i) => {
            if (letter === solution.charAt(i)) {
              return { letter, status: GuessStatus.IN_LOCATION };
            } else if (solution.indexOf(letter) > -1) {
              return { letter, status: GuessStatus.IN_WORD };
            } else {
              return { letter, status: GuessStatus.INVALID };
            }
          });
          const correct = guessState.reduce(
            (acc, curr) => acc && curr.status === GuessStatus.IN_LOCATION,
            true,
          );
          setBoardState((prevState) => {
            const status = correct
              ? GameStatus.WON
              : prevState.guesses.length === 5
              ? GameStatus.LOST
              : GameStatus.IN_PROGRESS;
            return {
              ...prevState,
              guesses: [...prevState.guesses, guessState],
              status,
            };
          });
        }
      } else {
        setCurrentWordFailed((v) => !!v);
      }
    },
    [boardState.guesses.length, solutions, validGuesses],
  );

  return { boardState, onGuess, currentWordFailed };
}

function persistState(state: BoardState) {
  localStorage.setItem(BOARD_STATE_STORAGE_KEY, JSON.stringify(state));
}

async function loadOrFetchSolutions(): Promise<string[]> {
  try {
    const serializedSolutions = localStorage.getItem("solutions");
    const solutions = serializedSolutions
      ? JSON.parse(serializedSolutions)
      : null;
    if (isSolutions(solutions)) {
      return solutions;
    } else {
      console.error("stored solutions invalid");
    }
  } catch (e) {
    console.error(e);
  }

  const res = await axios.get("/api/solutions");
  localStorage.setItem("solutions", JSON.stringify(res.data));
  return res.data;
}

type Guesses = { [k: string]: boolean };

async function loadOrFetchGuesses(): Promise<Guesses> {
  try {
    const serializedGuesses = localStorage.getItem("guesses");
    const guesses = serializedGuesses ? JSON.parse(serializedGuesses) : null;
    if (isGuesses(guesses)) {
      return guesses;
    } else {
      console.error("stored guesses invalid");
    }
  } catch (e) {
    console.error(e);
  }

  const res = await axios.get("/api/guesses");
  localStorage.setItem("guesses", JSON.stringify(res.data));
  return res.data;
}

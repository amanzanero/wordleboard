import type { NextPage } from "next";
import { useGuessMutation, useTodayGameBoard } from "query/guess";
import GameBoard from "components/gameBoard";
import styles from "styles/gameBoard.module.css";
import React, { useCallback, useState } from "react";
import { GameState } from "../codegen";

const TOP = "QWERTYUIOP";
const MIDDLE = "ASDFGHJKL";

const Home: NextPage = () => {
  const [guess, setCurrentGuess] = useState<string[]>([]);
  const { data } = useTodayGameBoard();
  const guessMutation = useGuessMutation({
    onSuccess: () => {
      setCurrentGuess([]);
    },
  });

  const onLetterPress = useCallback(
    (letter: string) => {
      setCurrentGuess((prevState) => {
        if (prevState.length < 5 && data?.state === GameState.InProgress) {
          return [...prevState, letter];
        } else {
          return prevState;
        }
      });
    },
    [data?.state],
  );

  const onBackspace = useCallback(() => {
    setCurrentGuess((prevState) => {
      if (prevState.length !== 0) {
        return [...prevState.slice(0, prevState.length - 1)];
      } else {
        return prevState;
      }
    });
  }, []);

  const onEnter = () => {
    if (guess.length === 5) {
      guessMutation.mutate({ word: guess.join("").toLowerCase() });
    }
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div className="flex justify-center py-2">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          WordleBoard
        </h1>
      </div>
      <hr className="w-full dark:border-gray-600" />
      <div className="max-w-lg w-full flex flex-col flex-grow pb-2 px-1">
        {!!data ? (
          <GameBoard state={data} currentWord={guess} />
        ) : (
          <div className="flex-grow" />
        )}
        {/*keyboard container*/}
        <div className="w-full h-48 flex flex-col pt-2">
          <div className="flex w-full h-full mb-2">
            {TOP.split("").map((letter, i) => (
              <LetterButton
                key={`letter-${letter}`}
                letter={letter}
                last={i === TOP.length - 1}
                onPress={onLetterPress}
              />
            ))}
          </div>
          <div className="flex w-full h-full mb-2">
            <div className={`${styles.half}`} />
            {MIDDLE.split("").map((letter, i) => (
              <LetterButton
                key={`letter-${letter}`}
                letter={letter}
                last={i === MIDDLE.length - 1}
                onPress={onLetterPress}
              />
            ))}
            <div className={styles.half} />
          </div>
          <div className="flex w-full h-full">
            <button
              className={`bg-gray-200 text-black dark:bg-gray-400 dark:text-white rounded uppercase font-bold ${styles.oneAndAHalf} ${styles.small} mr-1`}
              onClick={onEnter}>
              enter
            </button>
            {"ZXCVBNM".split("").map((letter, i) => (
              <LetterButton
                key={`letter-${letter}`}
                last={false}
                onPress={onLetterPress}
                letter={letter}
              />
            ))}
            <button
              className={`bg-gray-200 dark:bg-gray-400 rounded ${styles.oneAndAHalf} flex justify-center items-center`}
              onClick={onBackspace}>
              <svg
                className=""
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
                width="24">
                <path
                  className="fill-black dark:fill-white"
                  d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LetterButton: React.FC<{
  letter: string;
  last: boolean;
  onPress: (letter: string) => void;
}> = ({ letter, last, onPress }) => (
  <button
    key={`letter-${letter}`}
    onClick={() => onPress(letter)}
    className={`h-full flex-1 rounded bg-gray-200 text-black dark:bg-gray-400 dark:text-white font-bold ${
      last ? "" : "mr-1"
    }`}>
    {letter}
  </button>
);

export default Home;

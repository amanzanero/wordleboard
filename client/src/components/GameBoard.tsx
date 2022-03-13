import React from "react";
import { GuessState, LetterGuess, TodayQuery } from "codegen";
import { classnames } from "utils/classnames";
import styles from "styles/GameBoard.module.css";

type UserLetterGuess = {
  letter: string;
  guess?: LetterGuess;
  animate: boolean;
};

export type CurrentGuessState = UserLetterGuess[];

const GameBoard: React.FC<{
  state: TodayQuery["todayBoard"];
  currentWord: CurrentGuessState;
  shouldShake: boolean;
}> = ({ state, currentWord, shouldShake }) => {
  const remaining: string[][] =
    state.guesses.length < 5 ? Array(5 - state.guesses.length).fill(Array(5).fill("")) : [];
  const wordArray: CurrentGuessState = [
    ...currentWord,
    ...Array(5 - currentWord.length).fill({ letter: "", animate: false }),
  ];

  return (
    <div className="flex-grow w-full flex justify-center items-center overflow-hidden">
      {/*board*/}
      <div className="h-96 w-80 flex flex-col justify-between gap-y-1">
        {state.guesses.map((row, i) => (
          <div key={`guessed-${i}`} className="flex h-full w-full gap-x-1">
            {row.map((guess, i) => (
              <GuessBox key={`guess-${i}`} guess={guess} />
            ))}
          </div>
        ))}
        {/* current guess */}
        {state.guesses.length < 6 && (
          <div
            className={classnames(
              "flex h-full w-full gap-x-1",
              shouldShake ? "animate-wiggle" : "",
            )}>
            {wordArray.map((curr, i) => (
              <LetterBox key={`current-${curr.letter}-${i}`} guess={curr} />
            ))}
          </div>
        )}
        {remaining.map((row, i) => (
          <div key={`remaining-${i}`} className="flex h-full w-full gap-x-1">
            {row.map((guess, j) => (
              <TransparentLetterBox key={`remainingbox-${j}`}>{guess}</TransparentLetterBox>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const GuessBox: React.FC<{ guess: GuessState }> = ({ guess }) => {
  const color = () => {
    switch (guess.guess) {
      case LetterGuess.Incorrect:
        return "bg-gray-500 dark:bg-gray-700";
      case LetterGuess.InLocation:
        return "bg-green-600";
      case LetterGuess.InWord:
        return "bg-yellow-500";
    }
  };
  return (
    <div
      className={classnames(
        "text-white uppercase w-full h-full font-extrabold text-3xl flex justify-center items-center",
        color(),
      )}>
      {guess.letter}
    </div>
  );
};

const LetterBox: React.FC<{ guess: UserLetterGuess }> = ({ guess }) => {
  const color = () => {
    switch (guess.guess) {
      case LetterGuess.Incorrect:
        return "bg-gray-500 dark:bg-gray-700";
      case LetterGuess.InLocation:
        return "bg-green-600";
      case LetterGuess.InWord:
        return "bg-yellow-500";
      default:
        return "bg-white dark:bg-darkmode";
    }
  };

  return (
    <div
      className={classnames(
        "uppercase w-full h-full font-extrabold text-3xl relative transition-transform",
        guess.letter === "" ? "" : "animate-pop",
        guess.animate ? "animate-card" : "",
        styles.cardContainer,
      )}>
      <div
        className={classnames(
          "h-full w-full absolute flex justify-center items-center text-black dark:text-white",
          styles.cardBack,
          styles.card,
          color(),
        )}>
        {guess.letter}
      </div>
      <div
        className={classnames(
          "h-full w-full absolute flex justify-center items-center bg-white dark:bg-darkmode text-black dark:text-white border-2",
          guess.letter === ""
            ? "border-gray-400 dark:border-gray-600"
            : "border-gray-500 dark:border-gray-700",
          styles.card,
        )}>
        {guess.letter}
      </div>
    </div>
  );
};

const TransparentLetterBox: React.FC = ({ children }) => (
  <div className="border-2 text-transparent uppercase font-extrabold text-3xl flex justify-center items-center border-gray-400 dark:border-gray-600 w-full h-full">
    {children}
  </div>
);

export default GameBoard;

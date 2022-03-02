import React from "react";
import { GuessState, LetterGuess, TodayQuery } from "codegen";

const GameBoard: React.FC<{
  state: TodayQuery["todayBoard"];
  currentWord: string[];
}> = ({ state, currentWord }) => {
  const remaining: string[][] =
    state.guesses.length < 5 ? Array(5 - state.guesses.length).fill(Array(5).fill("")) : [];
  const wordArray = [...currentWord, ...Array(5 - currentWord.length).fill("")];

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
        {state.guesses.length < 5 && (
          <div className="flex h-full w-full gap-x-1">
            {wordArray.map((letter, i) => (
              <LetterBox key={`current-${i}`}>{letter}</LetterBox>
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
        return "bg-gray-600";
      case LetterGuess.InLocation:
        return "bg-green-600";
      case LetterGuess.InWord:
        return "bg-yellow-500";
    }
  };
  return (
    <div
      className={`${color()} border-2 text-white uppercase w-full h-full font-extrabold text-3xl flex justify-center items-center border-gray-600 dark:border-gray-500`}>
      {guess.letter}
    </div>
  );
};

const LetterBox: React.FC = ({ children }) => (
  <div className="border-2 text-black dark:text-white uppercase w-full h-full font-extrabold text-3xl flex justify-center items-center border-gray-600 dark:border-gray-500">
    {children}
  </div>
);

const TransparentLetterBox: React.FC = ({ children }) => (
  <div className="border-2 text-transparent uppercase font-extrabold text-3xl flex justify-center items-center border-gray-600 dark:border-gray-500 w-full h-full">
    {children}
  </div>
);

export default GameBoard;

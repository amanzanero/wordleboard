import React from "react";
import styles from "../styles/GameBoard.module.css";
import { classnames } from "../utils/classnames";

const TOP = "QWERTYUIOP";
const MIDDLE = "ASDFGHJKL";
const BOTTOM = "ZXCVBNM";

export type KeyboardState = { [k: string]: boolean };

type Props = {
  onLetterPress: (letter: string) => void;
  onGuess: () => void;
  onBackspace: () => void;
  correctSet: KeyboardState;
  inWordSet: KeyboardState;
  incorrectSet: KeyboardState;
};

const Keyboard: React.FC<Props> = ({
  onGuess,
  onLetterPress,
  onBackspace,
  correctSet,
  inWordSet,
  incorrectSet,
}) => (
  <div className="w-full h-48 flex flex-col pt-2">
    <div className="flex w-full h-full mb-2">
      {TOP.split("").map((letter, i) => (
        <LetterButton
          key={`letter-${letter}`}
          letter={letter}
          last={i === TOP.length - 1}
          onPress={onLetterPress}
          inWord={inWordSet[letter] || false}
          correct={correctSet[letter] || false}
          incorrect={incorrectSet[letter] || false}
        />
      ))}
    </div>
    <div className="flex w-full h-full mb-2">
      <div className={styles.half} />
      {MIDDLE.split("").map((letter, i) => (
        <LetterButton
          key={`letter-${letter}`}
          letter={letter}
          last={i === MIDDLE.length - 1}
          onPress={onLetterPress}
          inWord={inWordSet[letter] || false}
          correct={correctSet[letter] || false}
          incorrect={incorrectSet[letter] || false}
        />
      ))}
      <div className={styles.half} />
    </div>
    <div className="flex w-full h-full">
      <button
        className={classnames(
          "bg-gray-200 text-black dark:bg-gray-500 dark:text-white rounded uppercase font-bold mr-1",
          styles.oneAndAHalf,
          styles.small,
        )}
        onClick={onGuess}>
        enter
      </button>
      {BOTTOM.split("").map((letter, i) => (
        <LetterButton
          key={`letter-${letter}-${i}`}
          last={false}
          onPress={onLetterPress}
          letter={letter}
          inWord={inWordSet[letter] || false}
          correct={correctSet[letter] || false}
          incorrect={incorrectSet[letter] || false}
        />
      ))}
      <button
        className={classnames(
          "bg-gray-200 dark:bg-gray-500 rounded flex justify-center items-center",
          styles.oneAndAHalf,
        )}
        onClick={onBackspace}>
        <BackspaceIcon />
      </button>
    </div>
  </div>
);

const LetterButton: React.FC<{
  letter: string;
  last: boolean;
  onPress: (letter: string) => void;
  correct: boolean;
  inWord: boolean;
  incorrect: boolean;
}> = ({ letter, last, onPress, correct, inWord, incorrect }) => {
  const color = () => {
    if (correct) {
      return "bg-green-600 active:bg-green-700 text-white";
    } else if (inWord) {
      return "bg-yellow-500 active:bg-yellow-600 text-white";
    } else if (incorrect) {
      return "bg-gray-500 active:bg-gray-600 dark:bg-gray-700 dark:active:bg-gray-800 text-white";
    } else {
      return "bg-gray-200 active:bg-gray-300 text-black dark:bg-gray-500 dark:active:bg-gray-600 text-black dark:text-white";
    }
  };
  return (
    <button
      key={`letter-${letter}`}
      onClick={() => onPress(letter)}
      className={classnames("h-full flex-1 rounded font-bold", last ? "" : "mr-1", color())}>
      {letter}
    </button>
  );
};

const BackspaceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
    <path
      className="fill-black dark:fill-white"
      d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"
    />
  </svg>
);

export default Keyboard;

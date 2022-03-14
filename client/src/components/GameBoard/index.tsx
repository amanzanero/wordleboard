import React from "react";
import { LetterGuess } from "codegen";
import { classnames } from "utils/classnames";
import styles from "styles/GameBoard.module.css";
import { BoardCell, BoardRow, BoardRowType } from "./gameBoardState";

const GameBoard: React.FC<{
  gameBoardState: BoardRow[];
  shouldShake: boolean;
}> = ({ gameBoardState, shouldShake }) => {
  const currentGuessRow = gameBoardState.filter((g) => g.type === BoardRowType.GUESSING)[0];
  const remainingRows = gameBoardState.filter((g) => g.type === BoardRowType.REMAINING);

  return (
    <div className="flex-grow w-full flex justify-center items-center overflow-hidden">
      {/*board*/}
      <div className="h-96 w-80 flex flex-col justify-between gap-y-1">
        {gameBoardState
          .filter((g) => g.type === BoardRowType.GUESSED)
          .map((row, i) => (
            <div key={`guessed-${i}`} className="flex h-full w-full gap-x-1">
              {row.letters.map((cell, i) => (
                <GuessBox key={`guess-${i}`} cell={cell} />
              ))}
            </div>
          ))}
        {/* current guess */}
        {currentGuessRow && (
          <div
            className={classnames(
              "flex h-full w-full gap-x-1",
              shouldShake ? "animate-wiggle" : "",
            )}>
            {currentGuessRow.letters.map((cell, i) => (
              <LetterBox key={`current-${cell.letter}-${i}`} cell={cell} />
            ))}
          </div>
        )}
        {remainingRows.map((row, i) => (
          <div key={`remaining-${i}`} className="flex h-full w-full gap-x-1">
            {row.letters.map((cell, j) => (
              <TransparentLetterBox key={`remaining-box-${j}`}>{cell.letter}</TransparentLetterBox>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const GuessBox: React.FC<{ cell: BoardCell }> = ({ cell }) => {
  const color = () => {
    switch (cell.guess) {
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
        "text-white uppercase w-full h-full font-extrabold text-3xl flex justify-center items-center",
        color(),
      )}>
      {cell.letter}
    </div>
  );
};

const LetterBox: React.FC<{ cell: BoardCell }> = ({ cell }) => {
  const color = () => {
    switch (cell.guess) {
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
        cell.letter === "" ? "" : "animate-pop",
        cell.animate ? "animate-card" : "",
        styles.cardContainer,
      )}>
      <div
        className={classnames(
          "h-full w-full absolute flex justify-center items-center text-white",
          styles.cardBack,
          styles.card,
          color(),
        )}>
        {cell.letter}
      </div>
      <div
        className={classnames(
          "h-full w-full absolute flex justify-center items-center bg-white dark:bg-darkmode text-black dark:text-white border-2",
          cell.letter === ""
            ? "border-gray-400 dark:border-gray-600"
            : "border-gray-500 dark:border-gray-700",
          styles.card,
        )}>
        {cell.letter}
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

export { useGameBoardState, BoardRowType } from "./gameBoardState";

export type { GameBoardAction, BoardCell, BoardRow, GameBoardState } from "./gameBoardState";

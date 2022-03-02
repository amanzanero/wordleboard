import type { NextPage } from "next";
import { useGuessMutation, useTodayGameBoard } from "query/guess";
import GameBoard from "components/GameBoard";
import React, { useCallback, useState } from "react";
import { GameState } from "../codegen";
import Loader from "../components/Loader";
import Keyboard from "../components/Keyboard";

const Game: NextPage = () => {
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

  const onGuess = () => {
    if (guess.length === 5) {
      guessMutation.mutate({ word: guess.join("").toLowerCase() });
    }
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div className="flex justify-center py-2">
        <h1 className="text-3xl font-bold text-black dark:text-white">WordleBoard</h1>
      </div>

      <hr className="w-full dark:border-gray-600" />

      <div className="max-w-lg w-full flex flex-col flex-grow pb-2 px-1">
        {!!data ? (
          <GameBoard state={data} currentWord={guess} />
        ) : (
          <div className="flex-grow flex items-center">
            <Loader />
          </div>
        )}

        <Keyboard onLetterPress={onLetterPress} onGuess={onGuess} onBackspace={onBackspace} />
      </div>
    </div>
  );
};

export default Game;

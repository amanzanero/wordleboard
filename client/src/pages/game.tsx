import type { NextPage } from "next";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import GameBoard from "components/GameBoard";
import { useGuessMutation, useTodayGameBoard } from "query/guess";
import { GameState, InvalidGuess, LetterGuess } from "codegen";
import Loader from "components/Loader";
import Keyboard, { KeyboardState } from "components/Keyboard";
import BaseLayout from "components/BaseLayout";
import { useFirebaseUser } from "library/auth";
import { useRouter } from "next/router";

const Game: NextPage = () => {
  const { user, loading: userLoading } = useFirebaseUser();
  const [guess, setCurrentGuess] = useState<string[]>([]);
  const router = useRouter();

  const { data, refetch } = useTodayGameBoard({ enabled: false });

  // fetch board when we are sure we have a user otherwise redirect
  useEffect(() => {
    if (!userLoading && !!user) {
      user ? refetch() : router.push("/");
      refetch();
    }
  }, [refetch, router, user, userLoading]);

  const guessMutation = useGuessMutation({
    onSuccess: (d) => {
      if ((d as InvalidGuess).error === undefined) {
        // do flip animation
      } else {
        setCurrentGuess([]);
        // do shake animation
      }
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

  const keyboardState = useMemo(() => {
    const correctSet: KeyboardState = {};
    const inWordSet: KeyboardState = {};
    const incorrectSet: KeyboardState = {};

    data?.guesses.forEach((row) =>
      row.forEach((guess) => {
        switch (guess.guess) {
          case LetterGuess.InLocation:
            correctSet[guess.letter.toUpperCase()] = true;
            break;
          case LetterGuess.InWord:
            inWordSet[guess.letter.toUpperCase()] = true;
            break;
          case LetterGuess.Incorrect:
            incorrectSet[guess.letter.toUpperCase()] = true;
            break;
        }
      }),
    );
    return { correctSet, inWordSet, incorrectSet };
  }, [data?.guesses]);

  return (
    <BaseLayout>
      <div className="max-w-lg w-full flex flex-col flex-grow pb-2 px-1">
        {!!data ? (
          <GameBoard state={data} currentWord={guess} />
        ) : (
          <div className="flex-grow flex items-center">
            <Loader />
          </div>
        )}

        <Keyboard
          onLetterPress={onLetterPress}
          onGuess={onGuess}
          onBackspace={onBackspace}
          correctSet={keyboardState.correctSet}
          inWordSet={keyboardState.inWordSet}
          incorrectSet={keyboardState.incorrectSet}
        />
      </div>
    </BaseLayout>
  );
};

export default Game;

import type { NextPage } from "next";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import GameBoard from "components/GameBoard";
import { useGuessMutation, useTodayGameBoard } from "query/guess";
import { GameState, GuessError, InvalidGuess, LetterGuess } from "codegen";
import LoadingSpinner from "components/LoadingSpinner";
import Keyboard, { KeyboardState } from "components/Keyboard";
import BaseLayout from "components/BaseLayout";
import { useFirebaseUser } from "library/auth";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";
import toast, { Toaster } from "react-hot-toast";

const Game: NextPage = () => {
  const { user, loading: userLoading } = useFirebaseUser();
  const [guess, setCurrentGuess] = useState<string[]>([]);
  const router = useRouter();
  const [wrongGuess, setWrongGuess] = useState(false);
  const queryClient = useQueryClient();

  const { data, refetch } = useTodayGameBoard({ enabled: false, user: user?.uid || "" });
  const notify = useCallback((text: string) => toast(text), []);

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
        setCurrentGuess([]);
        queryClient.setQueryData(["todayBoard", `user-${user?.uid}`], d);
        // do flip animation
      } else {
        // do shake animation
        const err = d as InvalidGuess;
        setWrongGuess(true);
        setTimeout(() => setWrongGuess(false), 250);

        // show toast
        switch (err.error) {
          case GuessError.InvalidLength:
            notify("Too short");
            break;
          case GuessError.NotAWord:
            notify("Invalid guess");
            break;
        }
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
    } else {
      setWrongGuess(true);
      setTimeout(() => setWrongGuess(false), 250);
      notify("Too short");
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
        <Toaster />
        {!!data ? (
          <GameBoard state={data} currentWord={guess} shouldShake={wrongGuess} />
        ) : (
          <div className="flex-grow flex items-center">
            <LoadingSpinner />
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

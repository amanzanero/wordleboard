import type { NextPage } from "next";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import GameBoard, { CurrentGuessState } from "components/GameBoard";
import { useGuessMutation, useTodayGameBoard } from "query/guess";
import {
  GameBoard as GameBoardType,
  GameState,
  GuessError,
  InvalidGuess,
  LetterGuess,
} from "codegen";
import LoadingSpinner from "components/LoadingSpinner";
import Keyboard, { KeyboardState } from "components/Keyboard";
import { useFirebaseUser } from "library/auth";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";
import toast, { Toaster } from "react-hot-toast";
import DrawerLayout from "components/DrawerLayout";
import { doEvery } from "utils/time";
import Head from "next/head";
import MetaTags from "../components/MetaTags";

const Game: NextPage = () => {
  const { user, loading: userLoading } = useFirebaseUser();
  const [guess, setCurrentGuess] = useState<CurrentGuessState>([]);
  const router = useRouter();
  const [wrongGuess, setWrongGuess] = useState(false);
  const queryClient = useQueryClient();

  const { data, refetch } = useTodayGameBoard({ enabled: false, user: user?.uid || "" });
  const notify = useCallback((text: string) => toast(text), []);

  // fetch board when we are sure we have a user otherwise redirect
  useEffect(() => {
    if (!userLoading) {
      user ? refetch() : router.push("/");
      refetch();
    }
  }, [refetch, router, user, userLoading]);

  const guessMutation = useGuessMutation({
    onSuccess: (result) => {
      if ((result as InvalidGuess).error === undefined) {
        const serverGuesses = [...(result as GameBoardType).guesses];
        const lastGuess = serverGuesses.pop();
        if (lastGuess === undefined) {
          console.error("should have a valid guess");
          return;
        }

        const actions: (() => void)[] = [];
        for (let i = 0; i < 6; i++) {
          actions.push(() => {
            const nextGuessState: CurrentGuessState = [];
            lastGuess.slice(0, i).forEach((value) => {
              nextGuessState.push({ ...value, letter: value.letter.toUpperCase(), animate: true });
            });
            lastGuess.slice(i).forEach((value) => {
              nextGuessState.push({ ...value, letter: value.letter.toUpperCase(), animate: false });
            });
            setCurrentGuess(nextGuessState);
          });
        }

        doEvery(400, actions).then(() => {
          setCurrentGuess([]);
          queryClient.setQueryData(["todayBoard", `user-${user?.uid}`], result);
        });
      } else {
        const err = result as InvalidGuess;
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
          return [...prevState, { letter, animate: false }];
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
    if (data?.state !== GameState.InProgress) {
      return;
    } else if (guess.length === 5) {
      guessMutation.mutate({
        word: guess
          .map((curr) => curr.letter)
          .join("")
          .toLowerCase(),
      });
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
    <>
      <Head>
        <title>WordleBoard - Play</title>
        <MetaTags />
      </Head>
      <DrawerLayout>
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
      </DrawerLayout>
    </>
  );
};

export default Game;

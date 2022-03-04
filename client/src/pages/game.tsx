import type { NextPage } from "next";
import { useGuessMutation, useTodayGameBoard } from "query/guess";
import GameBoard from "components/GameBoard";
import React, { useCallback, useEffect, useState } from "react";
import { GameState } from "../codegen";
import Loader from "../components/Loader";
import Keyboard from "../components/Keyboard";
import BaseLayout from "../components/BaseLayout";
import { useFirebaseUser } from "../library/auth";
import { useRouter } from "next/router";

const Game: NextPage = () => {
  const { user, loading: userLoading } = useFirebaseUser();
  const [guess, setCurrentGuess] = useState<string[]>([]);
  const { data, refetch } = useTodayGameBoard({ enabled: false });
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !!user) {
      refetch();
    }
  }, [refetch, user, userLoading]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/");
    }
  }, [userLoading, router, user]);

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
    <BaseLayout>
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
    </BaseLayout>
  );
};

export default Game;

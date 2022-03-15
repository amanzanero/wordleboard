import type { NextPage } from "next";
import React, { useCallback, useEffect } from "react";
import GameBoard, { useGameBoardState } from "components/GameBoard";
import { useGuessMutation, useTodayGameBoard } from "query/guess";
import { GameBoard as GameBoardType, GameState, GuessError, InvalidGuess } from "codegen";
import LoadingSpinner from "components/LoadingSpinner";
import Keyboard from "components/Keyboard";
import { useFirebaseUser } from "library/auth";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";
import toast, { Toaster } from "react-hot-toast";
import DrawerLayout from "components/DrawerLayout";
import { doEvery } from "utils/time";
import Head from "next/head";
import MetaTags from "../components/MetaTags";
import Modal from "../components/Modal";

const Game: NextPage = () => {
  const { user, loading: userLoading } = useFirebaseUser();
  const { data, refetch } = useTodayGameBoard({ enabled: false, user: user?.uid || "" });
  const [state, dispatch] = useGameBoardState();

  const router = useRouter();
  const queryClient = useQueryClient();
  const notify = useCallback((text: string) => toast(text), []);

  // fetch board when we are sure we have a user otherwise redirect
  useEffect(() => {
    if (!userLoading) {
      user ? refetch() : router.push("/");
    }
  }, [refetch, router, user, userLoading]);

  useEffect(() => {
    if (data?.state === GameState.Lost || data?.state === GameState.Won) {
      dispatch({ type: "open_modal" });
    }
  }, [data?.state, dispatch]);

  const { mutate } = useGuessMutation({
    onSuccess: (result) => {
      if ((result as InvalidGuess).error === undefined) {
        const serverGuesses = [...(result as GameBoardType).guesses];
        const lastGuess = serverGuesses.pop();
        if (lastGuess === undefined) {
          console.error("should have a valid guess");
          return;
        }

        const actions: (() => void)[] = [];
        for (let i = 1; i < 6; i++) {
          actions.push(() => dispatch({ type: "animate_up_to", upTo: i, lastGuess }));
        }
        doEvery(400, actions).then(() => {
          queryClient.setQueryData(["todayBoard", `user-${user?.uid}`], result);
          dispatch({ type: "guess_success" });
        });
      } else {
        const err = result as InvalidGuess;
        switch (err.error) {
          case GuessError.NotAWord:
            dispatch({ type: "guess_error", message: "Invalid guess" });
            break;
          case GuessError.InvalidLength:
            dispatch({ type: "guess_error", message: "Guess must be five letters" });
            break;
        }
      }
    },
  });

  useEffect(() => {
    if (!!state.pendingGuess?.length) {
      mutate({
        word: state.pendingGuess,
      });
    }
  }, [mutate, state.pendingGuess]);

  useEffect(() => {
    if (data?.guesses !== undefined) {
      dispatch({ type: "recompute_game_board", guesses: data.guesses });
    }
  }, [data?.guesses, dispatch]);

  useEffect(() => {
    if (!!state.wrongGuess) {
      notify(state.wrongGuess);
      setTimeout(() => dispatch({ type: "dismiss_guess_error" }), 250);
    }
  }, [dispatch, notify, state.wrongGuess]);

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
            <>
              <GameBoard gameBoardState={state.gameBoardState} shouldShake={!!state.wrongGuess} />
              <Keyboard
                onLetterPress={(letter) =>
                  dispatch({ type: "letter_pressed", letter, state: data.state })
                }
                onGuess={() => dispatch({ type: "guess", state: data.state })}
                onBackspace={() => dispatch({ type: "backspace_pressed" })}
                correctSet={state.correctLetters}
                inWordSet={state.inWordLetters}
                incorrectSet={state.incorrectLetters}
              />
            </>
          ) : (
            <div className="flex-grow flex items-center">
              <LoadingSpinner />
            </div>
          )}
        </div>
        <Modal open={state.isModalOpen} closeModal={() => dispatch({ type: "close_modal" })} />
      </DrawerLayout>
    </>
  );
};

export default Game;

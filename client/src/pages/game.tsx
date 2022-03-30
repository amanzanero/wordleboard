import type { NextPage } from "next";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
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
import MetaTags from "components/MetaTags";
import Modal from "components/Modal";
import { gameToEmoji } from "../components/GameBoard/gameBoardState";

const Game: NextPage = () => {
  const { user, loading: userLoading } = useFirebaseUser();
  const { data, refetch } = useTodayGameBoard({ enabled: false, user: user?.uid || "" });
  const [state, dispatch] = useGameBoardState();
  const [shareModalOpen, setShareModalOpen] = useState(false);

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
      dispatch({
        type: "open_modal",
        title: data.state === GameState.Won ? "Nice job!" : "Almost got it!",
        text: data.state === GameState.Won ? "alksjd;alksd" : " a;slkdjfa;sld",
      });
    }
  }, [data?.state, dispatch]);

  const { mutate } = useGuessMutation({
    onSuccess: (result) => {
      if (result.__typename === "GameBoard") {
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
      } else if (result.__typename === "InvalidGuess") {
        switch (result.error) {
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

  const [nativeShare, setNativeShare] = useState(true);
  useEffect(() => {
    setNativeShare(!!navigator.share);
  }, []);

  const onClickShare = useCallback(() => {
    dispatch({ type: "close_modal" });
    setShareModalOpen(true);
  }, [dispatch]);

  const onShareScore = useCallback(() => {
    if (!!data) {
      let num: string;
      switch (data.guesses.length) {
        case 6:
          num = data.state === GameState.Lost ? "X" : "6";
          break;
        default:
          num = data.guesses.length.toString();
      }
      navigator
        .share({
          text: `WordleBoard ${data.day} ${num}/6\n\n${gameToEmoji(state.gameBoardState)}`,
        })
        .then(() => setShareModalOpen(false));
    }
  }, [data, state.gameBoardState]);

  return (
    <>
      <Head>
        <title>WordleBoard - Play</title>
        <MetaTags />
      </Head>
      <DrawerLayout customHeader={<CustomHeader onClick={onClickShare} />}>
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
      </DrawerLayout>
      <Modal
        open={state.modalState.open}
        closeModal={() => dispatch({ type: "close_modal" })}
        title={state.modalState.title}>
        <span>
          Go see or join a{" "}
          <Link href="/leaderboards">
            <a className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">
              leaderboard
            </a>
          </Link>
          !
        </span>
        {nativeShare && (
          <span className="mt-4 w-full flex justify-between items-center">
            Or share your score!{" "}
            <button className="btn btn-primary" onClick={onShareScore}>
              Share
            </button>
          </span>
        )}
      </Modal>
      <Modal
        open={shareModalOpen}
        closeModal={() => setShareModalOpen(false)}
        title={"Share your score!"}>
        {[GameState.Won, GameState.Lost].includes(data?.state as any) ? (
          <div className="w-full flex justify-between items-center">
            <span>Share today&apos;s score with others</span>
            <button className="btn btn-primary" onClick={onShareScore}>
              share
            </button>
          </div>
        ) : (
          <div>Share this with others as soon as you finish</div>
        )}
      </Modal>
    </>
  );
};

const CustomHeader: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [nativeShare, setNativeShare] = useState(true);
  useEffect(() => {
    setNativeShare(!!navigator.share);
  }, []);

  return (
    <div className={"flex p-2 w-full max-w-screen-lg items-center justify-between"}>
      <label
        htmlFor="my-drawer"
        className="drawer-button p-3 border border-gray-300 dark:border-0 dark:bg-gray-600 rounded">
        <svg className="fill-black dark:fill-white" viewBox="0 0 100 80" width="20" height="20">
          <rect width="100" height="20" />
          <rect y="30" width="100" height="20" />
          <rect y="60" width="100" height="20" />
        </svg>
      </label>
      <h1 className="text-3xl font-bold text-black dark:text-white">WordleBoard</h1>
      {!nativeShare ? (
        <button
          className="p-3 border border-gray-300 dark:border-0 dark:bg-gray-600 rounded"
          onClick={onClick}>
          <ShareIcon />
        </button>
      ) : (
        <div className="p-4">{"  "}</div>
      )}
    </div>
  );
};

const ShareIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      className="fill-black dark:fill-white">
      <path d="M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z" />
    </svg>
  );
};

export default Game;

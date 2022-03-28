import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import DrawerLayout from "components/DrawerLayout";
import { useLeaderboard } from "query/leaderboards";
import { useTodayGameBoard } from "query/guess";
import { useFirebaseUser } from "library/auth";
import LoadingSpinner from "components/LoadingSpinner";
import { GameState, LeaderboardStat, User, UserStat } from "codegen";
import GameBoard from "components/GameBoard";
import { guessesToBoardState } from "components/GameBoard/gameBoardState";
import toast, { Toaster } from "react-hot-toast";

const LeaderboardPage: NextPage = () => {
  const router = useRouter();
  const { joinId } = router.query;
  const { user, loading: userIsLoading } = useFirebaseUser();
  const {
    data: today,
    isLoading: todayIsLoading,
    refetch: refetchToday,
  } = useTodayGameBoard({ user: user ? user.uid : "", enabled: false });

  useEffect(() => {
    if (!userIsLoading && !!user) {
      refetchToday();
    }
  }, [user, userIsLoading, refetchToday]);

  return (
    <DrawerLayout>
      <Toaster />
      {!(joinId && typeof joinId === "string") || todayIsLoading || userIsLoading || !today ? (
        <LoadingSpinner />
      ) : (
        <MainContent joinId={joinId} today={today.day} />
      )}
    </DrawerLayout>
  );
};

const MainContent: React.FC<{
  joinId: string;
  today: number;
}> = ({ joinId, today }) => {
  const router = useRouter();
  const { data: leaderboard, isLoading: leaderboardIsLoading } = useLeaderboard(joinId);
  const [daySelected, setDaySelected] = useState(today);
  const notify = useCallback((text: string) => toast(text), []);

  const options = useMemo(() => {
    const opts = Array.from(Array(today).keys()).reverse();
    opts.pop();
    return opts;
  }, [today]);

  // @ts-ignore
  const serverLeaderboardStat: LeaderboardStat | undefined = useMemo(() => {
    if (leaderboard?.__typename === "Leaderboard") {
      const stat = leaderboard.stats.filter((d) => d.day === daySelected);
      if (stat.length) {
        return stat[0];
      }
      return undefined;
    }
  }, [daySelected, leaderboard]);

  const leaderboardStats: UserStat[] | undefined = useMemo(() => {
    const defaultStat: (m: User) => UserStat = (member) => ({
      user: member,
      guesses: [],
      state: GameState.InProgress,
      day: daySelected,
    });
    if (leaderboard?.__typename === "Leaderboard") {
      return leaderboard.members.map((member) => {
        const stat = serverLeaderboardStat?.stats.filter((d) => d.user.id === member.id);
        if (stat?.length) {
          return stat[0];
        }
        // @ts-ignore
        return defaultStat(member);
      });
    }
    return [];
  }, [daySelected, leaderboard, serverLeaderboardStat?.stats]);
  const showCannotSee = daySelected === today && serverLeaderboardStat?.visible === false;

  switch (leaderboard?.__typename) {
    case undefined:
    default:
      return leaderboardIsLoading ? <LoadingSpinner /> : <div>unavailable</div>;
    case "Leaderboard":
      return (
        <div className="w-full h-full flex justify-center">
          <div className="flex flex-col max-w-screen-lg w-full px-2 pt-2">
            <div>
              <button
                className="btn btn-sm btn-active btn-link"
                onClick={() => router.push("/leaderboards")}>
                &lt; Leaderboards
              </button>
            </div>
            <div className="mt-4 w-full text-center">
              <h1 className="text-lg">
                Leaderboard: <span className="font-bold">{leaderboard.name}</span>
              </h1>
            </div>
            <div className="mt-4 w-full text-center flex justify-between items-center">
              <p>
                Share ID: <span className="font-bold">{leaderboard.id}</span>
              </p>
              <button
                onClick={() => {
                  navigator.clipboard
                    .writeText(leaderboard.id)
                    .then(() => notify("Copied to clipboard"));
                }}
                className="btn btn-sm btn-primary">
                COPY
              </button>
            </div>
            <div className="w-full flex justify-center mt-4">
              <select
                onChange={(event) => setDaySelected(parseInt(event.target.value))}
                defaultValue={daySelected}
                className="select select-bordered w-full max-w-xs">
                <option value={today}> {`Day ${today} (Today)`}</option>
                {options.map((i) => (
                  <option key={`option-${i}`} value={i}>
                    {`Day ${i}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 w-full flex flex-col">
              {showCannotSee && (
                <p className="italic mb-4">
                  You won&apos;t be able to see today&apos;s guesses until you finish today&apos;s
                  game
                </p>
              )}
              {leaderboardStats.map((stats, i) => {
                if (
                  stats.guesses.length === 0 ||
                  (stats.day === today && !serverLeaderboardStat?.visible)
                ) {
                  return (
                    <div
                      key={"stats-" + i}
                      className="text-xl font-medium p-4 border border-base-300 bg-base-100 rounded-box mb-2">
                      {stats.user.displayName}: {stats.guesses.length} guesses
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={"stats-" + i}
                      tabIndex={i}
                      className="collapse transition-all collapse-arrow border border-base-300 bg-base-100 rounded-box mb-2">
                      <div className="collapse-title text-xl font-medium">
                        {stats.user.displayName}: {stats.guesses.length} guesses
                      </div>
                      <div className="collapse-content">
                        <GameBoard
                          gameBoardState={guessesToBoardState(stats.guesses)}
                          shouldShake={false}
                        />
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      );
    case "LeaderboardResultError":
      return <div>{leaderboard.error}</div>;
  }
};
export default LeaderboardPage;

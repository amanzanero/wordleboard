import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useFirebaseAuth, useFirebaseUser } from "library/auth";
import LoadingSpinner from "components/LoadingSpinner";
import BaseLayout from "components/BaseLayout";
import { useJoinLeaderboard } from "query/leaderboards";
import GoogleLoginButton from "components/GoogleLoginButton";
import FacebookLoginButton from "components/FacebookLoginButton";
import { IS_DEV } from "../../../constants";

const JoinLeaderboardPage: NextPage = () => {
  const router = useRouter();
  const { joinId } = router.query;
  const { user, loading: userIsLoading } = useFirebaseUser();
  const { googleAuth, facebookAuth, devLogin } = useFirebaseAuth();
  const [showAuth, setShowAuth] = useState(false);

  const { mutate: joinMutation } = useJoinLeaderboard({
    onSuccess: (data) => {
      switch (data.__typename) {
        case "Leaderboard":
          router.push(`/leaderboards/${joinId}`);
          break;
        case "LeaderboardResultError":
        default:
          router.push("/404");
      }
    },
  });

  useEffect(() => {
    if (!userIsLoading && !!joinId && typeof joinId === "string") {
      if (!!user) {
        joinMutation({ id: joinId });
      } else {
        setShowAuth(true);
      }
    }
  }, [user, joinId, userIsLoading, joinMutation]);

  return (
    <BaseLayout>
      <div className="flex-grow flex flex-col items-center justify-center space-y-4">
        {showAuth ? (
          <>
            <FacebookLoginButton onClick={() => facebookAuth()} />
            <GoogleLoginButton onClick={() => googleAuth()} />
            {IS_DEV && (
              <>
                <button
                  onClick={() => devLogin("uuid")}
                  className="w-full bg-white dark:bg-blue-600 text-gray-600 dark:text-white p-2 text-lg rounded hover:ring-2 border border-gray-200 dark:border-0">
                  Login with dev user
                </button>
                <button
                  onClick={() => devLogin("uuid2")}
                  className="w-full bg-white dark:bg-blue-600 text-gray-600 dark:text-white p-2 text-lg rounded hover:ring-2 border border-gray-200 dark:border-0">
                  Login with dev user 2
                </button>
              </>
            )}
          </>
        ) : (
          <LoadingSpinner />
        )}
      </div>
    </BaseLayout>
  );
};

export default JoinLeaderboardPage;

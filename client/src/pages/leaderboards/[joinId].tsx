import React from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import DrawerLayout from "../../components/DrawerLayout";
import { useLeaderboard } from "../../query/leaderboards";
const LeaderboardPage: NextPage = () => {
  const router = useRouter();
  const { joinId } = router.query;

  return (
    <DrawerLayout>
      {joinId && typeof joinId === "string" && <MainContent joinId={joinId} />}
    </DrawerLayout>
  );
};

const MainContent: React.FC<{ joinId: string }> = ({ joinId }) => {
  const { data, isLoading } = useLeaderboard(joinId);

  switch (data?.__typename) {
    case undefined:
    default:
      return isLoading ? <div>loading</div> : <div>unavailable</div>;
    case "Leaderboard":
      return <div>success</div>;
    case "LeaderboardResultError":
      return <div>{data.error}</div>;
  }
};
export default LeaderboardPage;

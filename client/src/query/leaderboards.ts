import {
  LeaderboardByJoinIdQuery,
  LeaderboardByJoinIdDocument,
  NewLeaderboardMutation,
  NewLeaderboardMutationVariables,
  NewLeaderboardDocument,
  MyLeaderboardsQuery,
  MyLeaderboardsDocument,
  JoinLeaderboardMutation,
  JoinLeaderboardMutationVariables,
  JoinLeaderboardDocument,
} from "codegen";
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from "react-query";
import type { ClientError } from "graphql-request";
import { useGraphqlRequest } from "./baseQuery";

export function useLeaderboard(
  joinId: string,
  options?: UseQueryOptions<LeaderboardByJoinIdQuery["leaderboard"]>,
) {
  const request = useGraphqlRequest();
  return useQuery<LeaderboardByJoinIdQuery["leaderboard"]>(
    ["leaderboard", joinId],
    () => request(LeaderboardByJoinIdDocument, { joinId }).then((data) => data.leaderboard),
    options,
  );
}

export function useCreateNewLeaderboard(
  options?: UseMutationOptions<
    NewLeaderboardMutation["createLeaderboard"],
    ClientError,
    NewLeaderboardMutationVariables
  >,
) {
  const request = useGraphqlRequest();
  return useMutation<
    NewLeaderboardMutation["createLeaderboard"],
    ClientError,
    NewLeaderboardMutationVariables
  >(
    [],
    (args) => request(NewLeaderboardDocument, args).then((data) => data.createLeaderboard),
    options,
  );
}

export function useMyLeaderboards(options?: UseQueryOptions<MyLeaderboardsQuery["me"]>) {
  const request = useGraphqlRequest();
  return useQuery<MyLeaderboardsQuery["me"]>(
    ["leaderboards"],
    () => request(MyLeaderboardsDocument).then((data) => data.me),
    options,
  );
}

export function useJoinLeaderboard(
  options?: UseMutationOptions<
    JoinLeaderboardMutation["joinLeaderboard"],
    ClientError,
    JoinLeaderboardMutationVariables
  >,
) {
  const request = useGraphqlRequest();
  return useMutation<
    JoinLeaderboardMutation["joinLeaderboard"],
    ClientError,
    JoinLeaderboardMutationVariables
  >(
    [],
    (args) => request(JoinLeaderboardDocument, args).then((data) => data.joinLeaderboard),
    options,
  );
}

import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "react-query";
import { useGraphqlRequest } from "./baseQuery";
import {
  GuessDocument,
  GuessMutation,
  GuessMutationVariables,
  TodayDocument,
  TodayQuery,
} from "codegen";
import { ClientError } from "graphql-request";

export function useGuessMutation(
  options: UseMutationOptions<GuessMutation["guess"], ClientError, GuessMutationVariables>,
) {
  const request = useGraphqlRequest();
  return useMutation<GuessMutation["guess"], ClientError, GuessMutationVariables>(
    ["guess"],
    (args) => request(GuessDocument, args).then((data) => data.guess),
    options,
  );
}

export function useTodayGameBoard(
  options: { user: string } & UseQueryOptions<TodayQuery["todayBoard"]>,
) {
  const request = useGraphqlRequest();
  return useQuery<TodayQuery["todayBoard"]>(
    ["todayBoard", `user-${options.user}`],
    () => request(TodayDocument).then((data) => data.todayBoard),
    options,
  );
}

import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "react-query";
import { useGraphqlRequest } from "./baseQuery";
import {
  GuessDocument,
  GuessMutation,
  GuessMutationVariables,
  InvalidGuess,
  TodayDocument,
  TodayQuery,
} from "codegen";
import { GraphQLError } from "graphql";
import { useFirebaseUser } from "../library/auth";

export function useGuessMutation(
  options: UseMutationOptions<GuessMutation["guess"], GraphQLError, GuessMutationVariables>,
) {
  const request = useGraphqlRequest();
  return useMutation<GuessMutation["guess"], GraphQLError, GuessMutationVariables>(
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

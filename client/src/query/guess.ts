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
  TodayDocument,
  TodayQuery,
} from "codegen";
import { GraphQLError } from "graphql";

export function useGuessMutation(
  options?: UseMutationOptions<
    GuessMutation["guess"],
    GraphQLError,
    GuessMutationVariables
  >,
) {
  const request = useGraphqlRequest();
  const queryClient = useQueryClient();
  return useMutation<
    GuessMutation["guess"],
    GraphQLError,
    GuessMutationVariables
  >(
    ["gameBoard"],
    (args) => request(GuessDocument, args).then((data) => data.guess),
    {
      ...options,
      onSuccess: (data, x, y) => {
        if (options?.onSuccess !== undefined) options.onSuccess(data, x, y);
        if (data.__typename === "GameBoard") {
          queryClient.setQueryData(["gameBoard", "today"], data);
        }
      },
    },
  );
}

export function useTodayGameBoard(
  options?: UseQueryOptions<TodayQuery["todayBoard"]>,
) {
  const request = useGraphqlRequest();
  return useQuery<TodayQuery["todayBoard"]>(
    ["gameBoard", "today"],
    () => request(TodayDocument).then((data) => data.todayBoard),
    options,
  );
}

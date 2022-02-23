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

export function useGuessMutation(
  variables: GuessMutationVariables,
  options?: UseMutationOptions<GuessMutation["guess"]>,
) {
  const request = useGraphqlRequest();
  const queryClient = useQueryClient();
  return useMutation<GuessMutation["guess"]>(
    ["gameBoard"],
    () => request(GuessDocument, variables).then((data) => data.guess),
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

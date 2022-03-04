import { useCallback } from "react";
import { request } from "graphql-request";
import { RequestDocument } from "graphql-request/dist/types";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useFirebaseUser } from "../library/auth";

export function useGraphqlRequest() {
  const { user } = useFirebaseUser();

  return useCallback(
    async <TDocument = any, TVariables = Record<string, any>>(
      document: RequestDocument | TypedDocumentNode<TDocument, TVariables>,
      variables?: TVariables,
    ) => {
      const token = user ? await user.getIdToken() : undefined;
      return request<TDocument, TVariables>("/graphql", document, variables, {
        Authorization: `Bearer ${token}`,
      });
    },
    [user],
  );
}

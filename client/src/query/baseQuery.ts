import { useCallback } from "react";
import { request } from "graphql-request";
import { RequestDocument } from "graphql-request/dist/types";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export function useGraphqlRequest() {
  return useCallback(
    <TDocument = any, TVariables = Record<string, any>>(
      document: RequestDocument | TypedDocumentNode<TDocument, TVariables>,
      variables?: TVariables,
    ) => request<TDocument, TVariables>("/graphql", document, variables),
    [],
  );
}

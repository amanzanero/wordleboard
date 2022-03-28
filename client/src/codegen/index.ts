import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type GameBoard = {
  __typename?: 'GameBoard';
  day: Scalars['Int'];
  guesses: Array<Array<GuessState>>;
  state: GameState;
};

export enum GameState {
  InProgress = 'IN_PROGRESS',
  Lost = 'LOST',
  Won = 'WON'
}

export enum GuessError {
  InvalidLength = 'InvalidLength',
  NotAWord = 'NotAWord'
}

export type GuessResult = GameBoard | InvalidGuess;

export type GuessState = {
  __typename?: 'GuessState';
  guess: LetterGuess;
  letter: Scalars['String'];
};

export type InvalidGuess = {
  __typename?: 'InvalidGuess';
  error: GuessError;
};

export type Leaderboard = {
  __typename?: 'Leaderboard';
  id: Scalars['ID'];
  members: Array<User>;
  name: Scalars['String'];
  owner: Scalars['ID'];
  stats: Array<LeaderboardStat>;
};


export type LeaderboardStatsArgs = {
  after?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
};

export enum LeaderboardError {
  CouldNotCreate = 'CouldNotCreate',
  DoesNotExist = 'DoesNotExist',
  MaxCapacity = 'MaxCapacity',
  NotAuthorized = 'NotAuthorized'
}

export type LeaderboardResult = Leaderboard | LeaderboardResultError;

export type LeaderboardResultError = {
  __typename?: 'LeaderboardResultError';
  error: LeaderboardError;
};

export type LeaderboardStat = {
  __typename?: 'LeaderboardStat';
  day: Scalars['Int'];
  stats: Array<UserStat>;
  visible: Scalars['Boolean'];
};

export enum LetterGuess {
  Incorrect = 'INCORRECT',
  InLocation = 'IN_LOCATION',
  InWord = 'IN_WORD'
}

export type Mutation = {
  __typename?: 'Mutation';
  createLeaderboard: LeaderboardResult;
  guess: GuessResult;
  joinLeaderboard: LeaderboardResult;
};


export type MutationCreateLeaderboardArgs = {
  name: Scalars['String'];
};


export type MutationGuessArgs = {
  input: Scalars['String'];
};


export type MutationJoinLeaderboardArgs = {
  id: Scalars['String'];
};

export type NewUser = {
  displayName?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  day?: Maybe<GameBoard>;
  leaderboard: LeaderboardResult;
  me: User;
  todayBoard: GameBoard;
};


export type QueryDayArgs = {
  input: Scalars['Int'];
};


export type QueryLeaderboardArgs = {
  joinId: Scalars['ID'];
};

export type User = {
  __typename?: 'User';
  displayName: Scalars['String'];
  id: Scalars['ID'];
  individualStats: Array<UserStat>;
  leaderboards: Array<Leaderboard>;
};


export type UserIndividualStatsArgs = {
  after?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
};

export type UserStat = {
  __typename?: 'UserStat';
  day: Scalars['Int'];
  guesses: Array<Array<GuessState>>;
  state: GameState;
  user: User;
};

export type GuessMutationVariables = Exact<{
  word: Scalars['String'];
}>;


export type GuessMutation = { __typename?: 'Mutation', guess: { __typename: 'GameBoard', day: number, state: GameState, guesses: Array<Array<{ __typename?: 'GuessState', letter: string, guess: LetterGuess }>> } | { __typename: 'InvalidGuess', error: GuessError } };

export type TodayQueryVariables = Exact<{ [key: string]: never; }>;


export type TodayQuery = { __typename?: 'Query', todayBoard: { __typename?: 'GameBoard', day: number, state: GameState, guesses: Array<Array<{ __typename?: 'GuessState', letter: string, guess: LetterGuess }>> } };

export type LeaderboardByJoinIdQueryVariables = Exact<{
  joinId: Scalars['ID'];
}>;


export type LeaderboardByJoinIdQuery = { __typename?: 'Query', leaderboard: { __typename: 'Leaderboard', name: string, members: Array<{ __typename?: 'User', displayName: string, id: string }>, stats: Array<{ __typename?: 'LeaderboardStat', visible: boolean, day: number, stats: Array<{ __typename?: 'UserStat', day: number, state: GameState, user: { __typename?: 'User', displayName: string, id: string }, guesses: Array<Array<{ __typename?: 'GuessState', letter: string, guess: LetterGuess }>> }> }> } | { __typename: 'LeaderboardResultError', error: LeaderboardError } };

export type NewLeaderboardMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type NewLeaderboardMutation = { __typename?: 'Mutation', createLeaderboard: { __typename: 'Leaderboard', name: string, id: string } | { __typename: 'LeaderboardResultError', error: LeaderboardError } };

export type MyLeaderboardsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyLeaderboardsQuery = { __typename?: 'Query', me: { __typename?: 'User', leaderboards: Array<{ __typename?: 'Leaderboard', name: string, id: string, members: Array<{ __typename?: 'User', displayName: string }> }> } };


export const GuessDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Guess"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"word"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guess"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"word"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GameBoard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"guesses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"letter"}},{"kind":"Field","name":{"kind":"Name","value":"guess"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InvalidGuess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}}]} as unknown as DocumentNode<GuessMutation, GuessMutationVariables>;
export const TodayDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Today"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"todayBoard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"guesses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"letter"}},{"kind":"Field","name":{"kind":"Name","value":"guess"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]} as unknown as DocumentNode<TodayQuery, TodayQueryVariables>;
export const LeaderboardByJoinIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LeaderboardByJoinId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"joinId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaderboard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"joinId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"joinId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Leaderboard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"visible"}},{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"guesses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"letter"}},{"kind":"Field","name":{"kind":"Name","value":"guess"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LeaderboardResultError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}}]} as unknown as DocumentNode<LeaderboardByJoinIdQuery, LeaderboardByJoinIdQueryVariables>;
export const NewLeaderboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NewLeaderboard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createLeaderboard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Leaderboard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LeaderboardResultError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}}]} as unknown as DocumentNode<NewLeaderboardMutation, NewLeaderboardMutationVariables>;
export const MyLeaderboardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyLeaderboards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaderboards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MyLeaderboardsQuery, MyLeaderboardsQueryVariables>;
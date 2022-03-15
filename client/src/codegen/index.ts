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

export enum CreateNewUserError {
  InvalidCredentials = 'InvalidCredentials',
  UserAlreadyExists = 'UserAlreadyExists'
}

export type GameBoard = {
  __typename?: 'GameBoard';
  day: Scalars['Int'];
  guesses: Array<Array<GuessState>>;
  state: GameState;
  user: User;
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
  id: Scalars['Int'];
  members: Array<User>;
  name: Scalars['String'];
  stats: Array<LeaderboardStat>;
};

export type LeaderboardStat = {
  __typename?: 'LeaderboardStat';
  day: Scalars['Int'];
  stats: Array<UserStat>;
};

export enum LetterGuess {
  Incorrect = 'INCORRECT',
  InLocation = 'IN_LOCATION',
  InWord = 'IN_WORD'
}

export type Mutation = {
  __typename?: 'Mutation';
  createLeaderboard: Leaderboard;
  guess: GuessResult;
};


export type MutationCreateLeaderboardArgs = {
  input: Scalars['String'];
};


export type MutationGuessArgs = {
  input: Scalars['String'];
};

export type NewUser = {
  displayName?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  day?: Maybe<GameBoard>;
  leaderboard?: Maybe<Leaderboard>;
  me: User;
  todayBoard: GameBoard;
};


export type QueryDayArgs = {
  input: Scalars['Int'];
};


export type QueryLeaderboardArgs = {
  input: Scalars['ID'];
};

export type User = {
  __typename?: 'User';
  displayName: Scalars['String'];
  id: Scalars['ID'];
  individualStats: Array<UserStat>;
  leaderboards: Array<Leaderboard>;
};

export type UserStat = {
  __typename?: 'UserStat';
  day: Scalars['Int'];
  gameState: GameState;
  guessCount: Scalars['Int'];
  user: User;
};

export type GuessMutationVariables = Exact<{
  word: Scalars['String'];
}>;


export type GuessMutation = { __typename?: 'Mutation', guess: { __typename?: 'GameBoard', day: number, state: GameState, guesses: Array<Array<{ __typename?: 'GuessState', letter: string, guess: LetterGuess }>> } | { __typename?: 'InvalidGuess', error: GuessError } };

export type TodayQueryVariables = Exact<{ [key: string]: never; }>;


export type TodayQuery = { __typename?: 'Query', todayBoard: { __typename?: 'GameBoard', day: number, state: GameState, guesses: Array<Array<{ __typename?: 'GuessState', letter: string, guess: LetterGuess }>> } };


export const GuessDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Guess"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"word"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guess"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"word"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GameBoard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"guesses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"letter"}},{"kind":"Field","name":{"kind":"Name","value":"guess"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InvalidGuess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}}]} as unknown as DocumentNode<GuessMutation, GuessMutationVariables>;
export const TodayDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Today"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"todayBoard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"guesses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"letter"}},{"kind":"Field","name":{"kind":"Name","value":"guess"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]} as unknown as DocumentNode<TodayQuery, TodayQueryVariables>;
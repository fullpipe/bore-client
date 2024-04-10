import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: number;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BookState: any;
  DownloadState: any;
  Int64: any;
  Time: Date;
  Uint: number;
};

export type Book = {
  __typename?: 'Book';
  author: Scalars['String'];
  download: Download;
  error?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  parts: Array<Part>;
  progress?: Maybe<Progress>;
  reader: Scalars['String'];
  state: Scalars['BookState'];
  title: Scalars['String'];
};

export type BooksFilter = {
  search?: InputMaybe<Scalars['String']>;
};

export type Download = {
  __typename?: 'Download';
  downloaded: Scalars['Int64'];
  error?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  length: Scalars['Int64'];
  magnet: Scalars['String'];
  name: Scalars['String'];
  state: Scalars['DownloadState'];
};

export type Jwt = {
  __typename?: 'JWT';
  access: Scalars['String'];
  refresh: Scalars['String'];
  roles: Array<Role>;
};

export type LoginInput = {
  code: Scalars['String'];
  requestID: Scalars['ID'];
};

export type LoginRequestInput = {
  email: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createBook: Book;
  delete: Scalars['Boolean'];
  login: Jwt;
  loginRequest: Scalars['ID'];
  progress: Progress;
  refreshToken: Jwt;
  restart: Scalars['Boolean'];
};


export type MutationCreateBookArgs = {
  input: NewBookInput;
};


export type MutationDeleteArgs = {
  bookID: Scalars['ID'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLoginRequestArgs = {
  input: LoginRequestInput;
};


export type MutationProgressArgs = {
  input: ProgressInput;
};


export type MutationRefreshTokenArgs = {
  refreshToken: Scalars['String'];
};


export type MutationRestartArgs = {
  bookID: Scalars['ID'];
};

export type NewBookInput = {
  magnet: Scalars['String'];
};

export type Part = {
  __typename?: 'Part';
  duration: Scalars['Float'];
  id: Scalars['ID'];
  path: Scalars['String'];
  possition: Scalars['Uint'];
  source: Scalars['String'];
  title: Scalars['String'];
};

export type Progress = {
  __typename?: 'Progress';
  part: Scalars['Uint'];
  position: Scalars['Float'];
  speed: Scalars['Float'];
  updatedAt: Scalars['Time'];
};

export type ProgressInput = {
  bookID: Scalars['ID'];
  part: Scalars['Uint'];
  position: Scalars['Float'];
  speed: Scalars['Float'];
};

export type Query = {
  __typename?: 'Query';
  book?: Maybe<Book>;
  books: Array<Book>;
  lastBooks: Array<Book>;
};


export type QueryBookArgs = {
  id: Scalars['ID'];
};


export type QueryBooksArgs = {
  filter?: InputMaybe<BooksFilter>;
};

export enum Role {
  Admin = 'ADMIN',
  User = 'USER'
}

export type BooksQueryVariables = Exact<{ [key: string]: never; }>;


export type BooksQuery = { __typename?: 'Query', books: Array<{ __typename?: 'Book', id: number, title: string, author: string, reader: string, state: any, error?: string | null, download: { __typename?: 'Download', state: any, error?: string | null }, progress?: { __typename?: 'Progress', part: number, speed: number, position: number, updatedAt: Date } | null }> };

export type BookQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type BookQuery = { __typename?: 'Query', book?: { __typename?: 'Book', id: number, title: string, author: string, reader: string, progress?: { __typename?: 'Progress', part: number, speed: number, position: number, updatedAt: Date } | null, parts: Array<{ __typename?: 'Part', title: string, possition: number, path: string, duration: number }> } | null };

export type CreateBookMutationVariables = Exact<{
  input: NewBookInput;
}>;


export type CreateBookMutation = { __typename?: 'Mutation', createBook: { __typename?: 'Book', title: string, id: number } };

export type LoginRequestMutationVariables = Exact<{
  input: LoginRequestInput;
}>;


export type LoginRequestMutation = { __typename?: 'Mutation', loginRequest: number };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'JWT', access: string, refresh: string, roles: Array<Role> } };

export type RefreshMutationVariables = Exact<{
  refreshToken: Scalars['String'];
}>;


export type RefreshMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'JWT', access: string, refresh: string, roles: Array<Role> } };

export type DeleteMutationVariables = Exact<{
  bookID: Scalars['ID'];
}>;


export type DeleteMutation = { __typename?: 'Mutation', delete: boolean };

export type ProgressMutationVariables = Exact<{
  progress: ProgressInput;
}>;


export type ProgressMutation = { __typename?: 'Mutation', progress: { __typename?: 'Progress', position: number } };

export const BooksDocument = gql`
    query books {
  books {
    id
    title
    author
    reader
    state
    error
    download {
      state
      error
    }
    progress {
      part
      speed
      position
      updatedAt
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class BooksGQL extends Apollo.Query<BooksQuery, BooksQueryVariables> {
    override document = BooksDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const BookDocument = gql`
    query book($id: ID!) {
  book(id: $id) {
    id
    title
    author
    reader
    progress {
      part
      speed
      position
      updatedAt
    }
    parts {
      title
      possition
      path
      duration
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class BookGQL extends Apollo.Query<BookQuery, BookQueryVariables> {
    override document = BookDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateBookDocument = gql`
    mutation createBook($input: NewBookInput!) {
  createBook(input: $input) {
    title
    id
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class CreateBookGQL extends Apollo.Mutation<CreateBookMutation, CreateBookMutationVariables> {
    override document = CreateBookDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const LoginRequestDocument = gql`
    mutation loginRequest($input: LoginRequestInput!) {
  loginRequest(input: $input)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class LoginRequestGQL extends Apollo.Mutation<LoginRequestMutation, LoginRequestMutationVariables> {
    override document = LoginRequestDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const LoginDocument = gql`
    mutation login($input: LoginInput!) {
  login(input: $input) {
    access
    refresh
    roles
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class LoginGQL extends Apollo.Mutation<LoginMutation, LoginMutationVariables> {
    override document = LoginDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RefreshDocument = gql`
    mutation refresh($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    access
    refresh
    roles
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class RefreshGQL extends Apollo.Mutation<RefreshMutation, RefreshMutationVariables> {
    override document = RefreshDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteDocument = gql`
    mutation delete($bookID: ID!) {
  delete(bookID: $bookID)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteGQL extends Apollo.Mutation<DeleteMutation, DeleteMutationVariables> {
    override document = DeleteDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ProgressDocument = gql`
    mutation progress($progress: ProgressInput!) {
  progress(input: $progress) {
    position
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ProgressGQL extends Apollo.Mutation<ProgressMutation, ProgressMutationVariables> {
    override document = ProgressDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
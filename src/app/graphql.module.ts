import { Injector, NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService, Pair } from './service/auth.service';
import { ErrorResponse, onError } from '@apollo/client/link/error';
import { RefreshGQL } from 'src/generated/graphql';
import { RetryLink } from '@apollo/client/link/retry';
import { environment } from 'src/environments/environment';

const uri = environment.graphQLUrl;

export const createApollo = (
  httpLink: HttpLink,
  auth: AuthService,
  injector: Injector
) => {
  let pair: Pair | null = null;

  auth.token$.subscribe((p) => {
    pair = p;
  });

  const http = httpLink.create({ uri });

  const error = onError((e: ErrorResponse) => {
    if (!e.networkError) {
      return;
    }

    if (!pair) {
      return;
    }

    const networkError = e.networkError as HttpErrorResponse;
    if (!networkError.status) {
      return;
    }

    if (e.operation.operationName === 'refresh') {
      auth.logout();
    }

    if (networkError.status === 401) {
      injector
        .get(RefreshGQL)
        .mutate({ refreshToken: pair.refresh })
        .toPromise()
        .then((t) => {
          auth.authenticate(t.data.refreshToken);
        })
        .catch(() => {
          auth.logout();
        });
    }
  });

  const retry = new RetryLink({
    delay: {
      initial: 500,
      max: Infinity,
      jitter: true,
    },
    attempts: {
      max: 2,
      retryIf: (e, operation) => {
        if (operation.operationName === 'refresh') {
          return false;
        }

        const networkError = e as HttpErrorResponse;
        if (!networkError.status) {
          return false;
        }

        if (networkError.status === 401) {
          return true;
        }

        return false;
      },
    },
  });

  const tokenMiddleware = new ApolloLink((operation, forward) => {
    if (pair === null) {
      return forward(operation);
    }

    if (operation.operationName === 'refresh') {
      return forward(operation);
    }

    operation.setContext({
      headers: new HttpHeaders().set('Authentication', `Bearer ${pair.access}`),
    });

    return forward(operation);
  });

  // const link = tokenMiddleware.concat(http);
  const link = error.concat(retry.concat(tokenMiddleware.concat(http)));

  return {
    link,
    cache: new InMemoryCache(),
  };
};

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink, AuthService, Injector],
    },
  ],
})
export class GraphQLModule {}

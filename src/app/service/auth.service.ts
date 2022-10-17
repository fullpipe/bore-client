import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { Role } from 'src/generated/graphql';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly token$: Observable<Pair | null>;
  readonly logedIn$: Observable<boolean>;
  readonly isAdmin$: Observable<boolean>;

  private token = new Subject<Pair | null>();

  constructor(private storage: StorageService) {
    this.token$ = this.token.pipe(
      tap((p) => {
        this.storage.set('auth', p);
      }),
      shareReplay(1)
    );

    this.logedIn$ = this.token$.pipe(map((p) => p !== null));
    this.isAdmin$ = this.token$.pipe(
      map((p) => p !== null && p.roles.includes(Role.Admin))
    );

    this.token$.subscribe();
  }

  authenticate(pair: Pair) {
    this.token.next(pair);
  }

  init() {
    const pair = this.storage.get<Pair | null>('auth');

    this.token.next(pair);
  }

  logout() {
    this.token.next(null);
  }
}

export interface Pair {
  access: string;
  refresh: string;
  roles: string[];
}

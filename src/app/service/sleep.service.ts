import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, timer } from 'rxjs';
import { filter, map, mapTo, pairwise, switchMap, tap } from 'rxjs/operators';
import { PlayerService, PlayerStatus } from './player.service';

@Injectable({
  providedIn: 'root',
})
export class SleepService {
  readonly state$: Observable<State>;

  private status = SleepStatus.inactive;
  private timeLeft: number;
  private control = new BehaviorSubject<void>(null);

  constructor(private player: PlayerService) {
    this.state$ = this.control.pipe(
      switchMap(() => {
        switch (this.status) {
          case SleepStatus.active:
            return timer(0, 1000);
          default:
            return EMPTY;
        }
      }),
      tap(() => {
        if (this.status === SleepStatus.active) {
          this.timeLeft--;
          if (this.timeLeft === 0) {
            this.player.pause();
          }
        }
      }),
      mapTo({
        status: this.status,
        timeLeft: this.timeLeft,
      } as State)
    );

    this.state$.subscribe();
  }

  start(seconds: number) {
    this.timeLeft = seconds;
    this.status = SleepStatus.active;
    this.control.next();
  }

  stop() {
    this.timeLeft = 0;
    this.status = SleepStatus.inactive;
    this.control.next();
  }
}

interface State {
  status: SleepStatus;
  timeLeft: number;
}

enum SleepStatus {
  inactive = 'inactive',
  active = 'active',
}

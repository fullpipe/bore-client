import { Injectable } from '@angular/core';
import { BookGQL, BookQuery } from 'src/generated/graphql';
import { Howl } from 'howler';
import {
  BehaviorSubject,
  Subject,
  bindCallback,
  fromEvent,
  interval,
  NEVER,
  EMPTY,
  Observable,
  timer,
  merge,
} from 'rxjs';
import { filter, map, mergeAll, switchMap, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  readonly state$: Observable<State>;
  readonly book$: Observable<BookQuery['book'] | null>;
  private book: BookQuery['book'] | null;
  private bookSubj: BehaviorSubject<BookQuery['book'] | null> =
    new BehaviorSubject(null);
  private parts: Part[] = [];
  private cp = 0;
  private state: State = {
    title: '',
    currentPart: this.cp,
    status: PlayerStatus.empty,
    speed: 1,
    globalDuration: 0,
    globalPosition: 0,
    duration: 0,
    position: 0,
  };
  private stateSubj: BehaviorSubject<State> = new BehaviorSubject(this.state);
  private control: Subject<PlayerStatus> = new Subject();

  constructor(private bookGql: BookGQL, private storage: StorageService) {
    this.state$ = this.stateSubj.asObservable();
    this.book$ = this.bookSubj.asObservable();

    this.control
      .pipe(
        filter((s) => this.state.status !== s),
        tap((s) => {
          this.state.status = s;
        }),
        switchMap(() => {
          switch (this.state.status) {
            case PlayerStatus.play:
              return timer(0, 1000);
            default:
              return EMPTY;
          }
        }),
        tap(() => this.syncState())
      )
      .subscribe(() => {
        this.stateSubj.next(this.state);
        this.saveState();
      });
  }

  async loadFromState() {
    const savedState = this.storage.get<SavedState>('player');
    if (!savedState) {
      return;
    }

    await this.load(savedState.bookID);

    this.cp = savedState.currentPart;
    this.seek(savedState.position);
    this.speed(savedState.speed);
    this.control.next(PlayerStatus.none);
  }

  async load(bookID: number) {
    this.control.next(PlayerStatus.loading);
    const book = (await this.bookGql.fetch({ id: bookID }).toPromise()).data
      .book;

    this.book = book;
    this.bookSubj.next(book);

    const loaded = [];
    let globalDuration = 0;

    book.parts.forEach((p, idx) => {
      const part: Part = {
        howl: new Howl({
          src: ['http://localhost:8080/books/' + p.path],
          html5: true,
        }),
        title: p.title,
        duration: 0,
      };

      loaded.push(
        new Promise<void>((resolve, reject) => {
          part.howl.load();
          part.howl.once('load', () => {
            part.duration = part.howl.duration();
            globalDuration += part.duration;
            resolve();
          });
          part.howl.once('loaderror', reject);
        })
      );

      this.parts.push(part);
    });

    return Promise.all(loaded).then(() => {
      this.state.globalDuration = globalDuration;
      this.syncState();
      this.control.next(PlayerStatus.none);
    });
  }

  play() {
    if (this.parts[this.cp].howl.state() !== 'loaded') {
      this.parts[this.cp].howl.load();
      this.parts[this.cp].howl.once('load', () => {
        this.play();
      });

      return;
    }

    console.log('play');

    // // TODO: remove
    // if (this.cp === 0) {
    //   this.parts[this.cp].howl.seek(this.parts[this.cp].howl.duration() - 5);
    // }

    this.parts[this.cp].howl.rate(this.state.speed);
    this.parts[this.cp].howl.play();
    this.parts[this.cp].howl.off();
    this.parts[this.cp].howl.once('end', () => {
      this.nextPart();
    });
    this.control.next(PlayerStatus.play);
  }

  speed(speed: number) {
    this.state.speed = speed;
    this.parts[this.cp].howl.rate(this.state.speed);
  }

  nextPart() {
    this.parts[this.cp].howl.off();
    this.cp++;
    if (this.cp >= this.parts.length) {
      this.cp = this.parts.length - 1;
      this.stop();
    }

    // // TODO: remove
    // this.parts[this.cp].howl.seek(this.parts[this.cp].howl.duration() - 5);

    if (this.state.status === PlayerStatus.play) {
      this.play();
    }
  }

  part(idx: number) {
    if (this.cp === idx) {
      return;
    }

    this.parts[this.cp].howl.off();
    this.cp = idx;

    this.syncState();

    return this;
  }

  seekStart() {
    this.parts[this.cp].howl.off();
    this.parts[this.cp].howl.pause();
    this.control.next(PlayerStatus.seek);
  }

  seek(position: number) {
    this.parts[this.cp].howl.seek(position);
    this.syncState();
  }

  seekFor(duration: number) {
    let newPosition = this.parts[this.cp].howl.seek() + duration;
    if (newPosition > this.parts[this.cp].duration) {
      newPosition = this.parts[this.cp].duration;
    }

    if (newPosition < 0) {
      newPosition = 0;
    }

    this.parts[this.cp].howl.seek(newPosition);
    this.syncState();
  }

  stop() {
    this.parts[this.cp].howl.off();
    this.parts[this.cp].howl.stop();
    this.control.next(PlayerStatus.none);
  }

  pause() {
    this.parts[this.cp].howl.off();
    this.parts[this.cp].howl.pause();
    this.control.next(PlayerStatus.pause);
  }

  private saveState() {
    if (!this.book) {
      return;
    }

    this.storage.set<SavedState>('player', {
      bookID: this.book.id,
      currentPart: this.cp,
      position: this.state.position,
      speed: this.state.speed,
    });
  }

  private syncState() {
    let globalPosition = 0;
    for (let i = 0; i < this.cp; i++) {
      globalPosition += this.parts[i].duration;
    }

    this.state.globalPosition =
      globalPosition + this.parts[this.cp].howl.seek();
    this.state.duration = this.parts[this.cp].duration;
    this.state.position = this.parts[this.cp].howl.seek();

    this.state.title = this.parts[this.cp].title;
    this.state.currentPart = this.cp;
  }
}

export enum PlayerStatus {
  empty = 'empty',
  loading = 'loading',
  none = 'none',
  play = 'play',
  pause = 'pause',
  seek = 'seek',
}

export interface State {
  title: string;
  currentPart: number;
  status: PlayerStatus;
  speed: number;
  duration: number;
  position: number;
  globalDuration: number;
  globalPosition: number;
}

interface Part {
  title: string;
  duration: number;
  howl: Howl;
}

interface SavedState {
  bookID: number;
  currentPart: number;
  position: number;
  speed: number;
}

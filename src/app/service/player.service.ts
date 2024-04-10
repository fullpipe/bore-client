import { Injectable } from '@angular/core';
import { BookGQL, BookQuery } from 'src/generated/graphql';
import { Howl } from 'howler';
import { BehaviorSubject, Subject, EMPTY, Observable, timer } from 'rxjs';
import { filter, shareReplay, switchMap, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { ProgressService } from './progress.service';
import { environment } from 'src/environments/environment';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  readonly state$: Observable<State>;
  readonly book$: Observable<BookQuery['book'] | null>;

  currentPartIdx = 0;
  position = 0;
  rate = 0;
  status = PlayerStatus.empty;

  private book: BookQuery['book'] | null;
  private bookSubj: BehaviorSubject<BookQuery['book'] | null> =
    new BehaviorSubject(null);
  private parts: Part[] = [];
  private state: State = {
    title: '',
    currentPart: this.currentPartIdx,
    status: PlayerStatus.empty,
    speed: 1,
    duration: 0,
    position: 0,
  };
  private stateSubj: BehaviorSubject<State> = new BehaviorSubject(this.state);
  private control: Subject<PlayerStatus> = new Subject();
  private timer$: Observable<number>;

  constructor(
    private bookGql: BookGQL,
    private storage: StorageService,
    private progress: ProgressService,
    private title: Title,
  ) {
    this.state$ = this.stateSubj.pipe(shareReplay(1));
    this.book$ = this.bookSubj.asObservable();

    this.timer$ = this.control.pipe(
      filter((s) => this.status !== s),
      tap((s) => {
        this.status = s;
      }),
      switchMap((s) => {
        switch (s) {
          case PlayerStatus.play:
            return timer(0, 1000);
          default:
            return EMPTY;
        }
      }),
      shareReplay(1),
    );

    this.timer$
      .pipe(
        tap(() => {
          // this.syncState();
        }),
      )
      .subscribe(() => {
        if (this.cp.howl.playing()) {
          this.position = this.cp.howl.seek();
          if (this.position > this.cp.duration) {
            this.position = this.cp.duration;
          }

          if (this.cp.duration - this.position < 10) {
            this.preloadNext();
          }
        }

        this.pubState();
        this.saveState();
      });

    this.timer$.pipe(filter((t) => t % 5 === 0)).subscribe(() => {
      this.saveProgress();
    });
  }

  get cp() {
    return this.parts[this.currentPartIdx];
  }

  pubState() {
    this.stateSubj.next({
      title: this.cp.title,
      currentPart: this.currentPartIdx,
      duration: this.cp.duration,
      position: this.position,
      speed: this.rate,
      status: this.status,
    });
  }

  async loadFromState() {
    console.log('loadFromState');
    const savedState = this.storage.get<SavedState>('player');
    if (!savedState) {
      console.log('no saved state');
      return;
    }

    const progress = await this.progress.getBookProgress(savedState.bookID);
    if (!progress) {
      console.log('no progress');
      return;
    }

    console.log('saved progress:', progress);

    await this.load(savedState.bookID);
    this.currentPartIdx = progress.part || 0;

    this.currentPartIdx = progress.part || 0;
    this.position = progress.position || 0;
    this.rate = progress.speed || 1;

    this.control.next(PlayerStatus.none);
    this.pubState();
  }

  async load(bookID: number) {
    if (this.book && this.book.id === bookID) {
      console.log(`book ${bookID} already loaded`);
      return;
    }

    console.log('load: ', bookID);
    this.control.next(PlayerStatus.loading);
    const book = (await this.bookGql.fetch({ id: bookID }).toPromise()).data
      .book;

    console.log(book);

    this.book = book;
    this.bookSubj.next(book);

    this.title.setTitle(book.title);

    book.parts.forEach((p, _idx): void => {
      const part: Part = {
        howl: new Howl({
          src: [environment.bookUrl + '/' + p.path],
          html5: true,
          preload: false,
          autoplay: false,
        }),
        title: p.title,
        duration: p.duration,
      };

      this.parts.push(part);
    });
  }

  play() {
    if (this.cp.howl.playing()) {
      return;
    }

    if (this.cp.howl.state() !== 'loaded') {
      this.cp.howl.load();
      this.cp.howl.once('load', () => {
        this.play();
      });

      return;
    }

    this.cp.howl.off();
    this.cp.howl.seek(this.position);
    this.cp.howl.rate(this.rate);

    this.cp.howl.once('end', () => {
      if (!this.hasNextPart()) {
        this.end();
        return;
      }

      this.nextPart();
      this.play();
    });

    this.title.setTitle(`${this.cp.title} - ${this.book.title}`);

    this.cp.howl.play();
    this.control.next(PlayerStatus.play);
    this.pubState();
  }

  preloadNext() {
    if (!this.hasNextPart()) {
      return;
    }

    const next = this.parts[this.currentPartIdx + 1];
    if (next.howl.state() != 'unloaded') {
      return;
    }

    next.howl.load();
  }

  speed(speed: number) {
    this.rate = speed;
    this.cp.howl.rate(speed);
    this.pubState();
  }

  hasNextPart() {
    return this.currentPartIdx + 1 < this.parts.length;
  }

  nextPart() {
    const nextPartIdx = this.currentPartIdx + 1;
    if (nextPartIdx >= this.parts.length) {
      this.stop();
      return;
    }

    this.part(nextPartIdx);
  }

  pause() {
    this.cp.howl.off();
    this.cp.howl.pause();
    this.position = this.cp.howl.seek();
    this.control.next(PlayerStatus.pause);
    this.pubState();
  }

  part(idx: number) {
    if (this.currentPartIdx === idx) {
      return;
    }

    this.cp.howl.off();
    this.cp.howl.pause();
    this.cp.howl.unload();

    this.currentPartIdx = idx;
    this.position = 0;

    this.pubState();

    return this;
  }

  seekStart() {
    this.cp.howl.off();
    this.cp.howl.pause();
    this.control.next(PlayerStatus.seek);
    this.pubState();
  }

  seek(position: number) {
    this.position = position;
    this.pubState();
  }

  seekFor(duration: number) {
    let newPosition = this.cp.howl.seek() + duration;
    if (newPosition > this.cp.duration) {
      newPosition = this.cp.duration;
    }

    if (newPosition < 0) {
      newPosition = 0;
    }

    this.cp.howl.seek(newPosition);
    this.pubState();
  }

  stop() {
    this.cp.howl.off();
    this.cp.howl.stop();
    this.control.next(PlayerStatus.none);
    this.pubState();
  }

  end() {
    this.stop();
    this.currentPartIdx = 0;
    this.pubState();
  }

  private saveState() {
    if (!this.book) {
      return;
    }

    this.storage.set<SavedState>('player', {
      bookID: this.book.id,
      part: this.currentPartIdx,
      position: this.position,
      speed: this.rate,
    });
  }

  private async saveProgress() {
    if (!this.book) {
      return;
    }

    await this.progress.save({
      bookID: this.book.id,
      part: this.currentPartIdx,
      position: this.position,
      speed: this.rate,
    });
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
}

interface Part {
  title: string;
  duration: number;
  howl: Howl;
}

interface SavedState {
  bookID: number;
  part: number;
  position: number;
  speed: number;
}

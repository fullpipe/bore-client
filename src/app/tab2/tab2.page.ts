import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { QueryRef } from 'apollo-angular';
import {
  BehaviorSubject,
  combineLatest,
  concat,
  Observable,
  OperatorFunction,
  SchedulerLike,
  timer,
} from 'rxjs';
import { debounceTime, map, publish, switchMap, take } from 'rxjs/operators';
import {
  BooksGQL,
  BooksQuery,
  BookState,
  DeleteGQL,
} from 'src/generated/graphql';
import { AuthService } from '../service/auth.service';
import { PlayerService } from '../service/player.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  books: Observable<BooksQuery['books']>;
  bookState = BookState;
  search = '';
  searchQuery$ = new BehaviorSubject('');

  private query: QueryRef<BooksQuery>;

  constructor(
    private booksGql: BooksGQL,
    private deleteGql: DeleteGQL,
    private player: PlayerService,
    private navCtl: NavController,
    protected auth: AuthService
  ) {
    this.query = booksGql.watch();
    this.books = combineLatest(
      this.searchQuery$.pipe(debounceTime(100)),
      this.query.valueChanges.pipe(map((result) => result.data.books))
    ).pipe(
      map((result) => {
        const s = result[0].toLowerCase();

        if (s === '') {
          return result[1];
        }

        return result[1].filter((b) => {
          if (b.title && b.title.toLowerCase().includes(s)) {
            return true;
          }
          if (b.author && b.author.toLowerCase().includes(s)) {
            return true;
          }

          return false;
        });
      })
    );
  }

  filter(f: string) {
    this.searchQuery$.next(f);
  }

  bookID(_: number, book: BooksQuery['books'][0]): number {
    return book.id;
  }

  async play(bookID: number) {
    this.player.load(bookID).then(() => this.player.play());
    this.navCtl.navigateForward('/play');
  }

  async restart(bookID: number) {
    this.booksGql.watch().refetch();
  }

  async delete(bookID: number) {
    await this.deleteGql.mutate({ bookID }).toPromise();
    this.query.refetch();
  }

  ionViewWillEnter(): void {
    this.query.refetch();
    this.query.startPolling(10000);
  }

  ionViewDidLeave(): void {
    this.query.stopPolling();
  }
}

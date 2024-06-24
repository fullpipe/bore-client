import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { QueryRef } from 'apollo-angular';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BooksGQL, BooksQuery, DeleteGQL } from 'src/generated/graphql';
import { AuthService } from '../service/auth.service';
import { PlayerService } from '../service/player.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  books: Observable<BooksQuery['books']>;

  private query: QueryRef<BooksQuery>;

  constructor(
    private booksGql: BooksGQL,
    private deleteGql: DeleteGQL,
    private player: PlayerService,
    private navCtl: NavController,
    protected auth: AuthService,
  ) {
    this.query = booksGql.watch();
    this.books = this.query.valueChanges.pipe(
      map((result) => result.data.books),
    );
  }

  bookID(_: number, book: BooksQuery['books'][0]): number {
    return book.id;
  }

  async play(bookID: number) {
    this.player.load(bookID).then(() => this.player.play());
    this.navCtl.navigateForward('/play');
  }

  async restart(bookID: number) {
    console.log('restart', bookID);
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

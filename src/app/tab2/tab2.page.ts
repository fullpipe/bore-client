import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BooksGQL, BooksQuery } from 'src/generated/graphql';
import { PlayerService } from '../service/player.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  books: Observable<BooksQuery['books']>;
  constructor(
    booksGql: BooksGQL,
    private player: PlayerService,
    private navCtl: NavController
  ) {
    this.books = booksGql
      .watch()
      .valueChanges.pipe(map((result) => result.data.books));
  }

  async play(bookID: number) {
    this.player.load(bookID).then(() => this.player.play());
    this.navCtl.navigateForward('/tabs/tab1');
  }
}

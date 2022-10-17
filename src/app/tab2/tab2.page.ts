import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BooksGQL, BooksQuery } from 'src/generated/graphql';
import { AuthService } from '../service/auth.service';
import { PlayerService } from '../service/player.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  books: Observable<BooksQuery['books']>;
  constructor(
    booksGql: BooksGQL,
    private player: PlayerService,
    private navCtl: NavController,
    protected auth: AuthService
  ) {
    console.log('constructor');
    this.books = booksGql
      .watch()
      .valueChanges.pipe(map((result) => result.data.books));
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log('ngOnInit');
  }
  async play(bookID: number) {
    this.player.load(bookID).then(() => this.player.play());
    this.navCtl.navigateForward('/tabs/tab1');
  }
}

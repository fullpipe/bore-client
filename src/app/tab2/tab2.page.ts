import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BooksGQL, BooksQuery } from 'src/generated/graphql';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  books: Observable<BooksQuery['books']>;
  constructor(private booksGql: BooksGQL) {
    this.books = booksGql
      .watch()
      .valueChanges.pipe(map((result) => result.data.books));
  }

  play(bookID: number) {
    console.log(bookID);
  }
}

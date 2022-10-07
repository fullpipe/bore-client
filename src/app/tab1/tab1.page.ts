import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BooksGQL, BooksQuery } from 'src/generated/graphql';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  books: Observable<BooksQuery['books']>;
  constructor(private booksGql: BooksGQL) {
    this.books = booksGql
      .watch()
      .valueChanges.pipe(map((result) => result.data.books));
  }
}

import { Injectable } from '@angular/core';
import { BookGQL } from 'src/generated/graphql';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  constructor(private bookGql: BookGQL) {}

  async play(bookID: number) {
    const book = (await this.bookGql.fetch({ id: bookID }).toPromise()).data
      .book;

    const sound = new Howl({
      src: [book.parts[0].path],
      html5: true,
    });

    sound.play();
  }
}

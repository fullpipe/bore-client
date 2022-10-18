import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CreateBookGQL } from 'src/generated/graphql';

@Component({
  selector: 'app-book-new',
  templateUrl: './book-new.component.html',
  styleUrls: ['./book-new.component.scss'],
})
export class BookNewComponent implements OnInit {
  magnet: string;
  loading = false;

  constructor(
    private createBookGql: CreateBookGQL,
    private nav: NavController
  ) {}

  ngOnInit() {}

  async newBook() {
    this.loading = true;

    await this.createBookGql
      .mutate({
        input: {
          magnet: this.magnet,
        },
      })
      .toPromise();

    this.nav.navigateRoot('/tabs/tab2');

    this.loading = false;
  }
}

// magnet:?xt=urn:btih:B811ACC36B9DF09FACA829EFDC5B5DCD98386DCC&tr=http%3A%2F%2Fbt.t-ru.org%2Fann%3Fmagnet&dn=%D0%93%D0%B5%D1%80%D0%B1%D0%B5%D1%80%D1%82%20%D0%A4%D1%80%D1%8D%D0%BD%D0%BA%20%E2%80%93%20%D0%94%D1%8E%D0%BD%D0%B0%203%2C%20%D0%94%D0%B5%D1%82%D0%B8%20%D0%94%D1%8E%D0%BD%D1%8B%20%5B%D0%93%D0%BE%D0%BB%D0%BE%D0%B2%D0%B8%D0%BD%20%D0%9A%D0%B8%D1%80%D0%B8%D0%BB%D0%BB%2C%202019%2C%20128%20kbps%2C%20MP3%5D

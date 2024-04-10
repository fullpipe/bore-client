import { Injectable } from '@angular/core';
import { BookGQL, ProgressGQL, ProgressInput } from 'src/generated/graphql';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private logedIn = false;
  private collection: ProgressCollection;
  constructor(
    private storage: StorageService,
    private progressGql: ProgressGQL,
    private auth: AuthService,
    private bookGql: BookGQL,
  ) {
    this.auth.logedIn$.subscribe((l) => (this.logedIn = l));
    this.collection = this.storage.get<ProgressCollection>(
      'ProgressCollection',
      {},
    );
  }

  async save(progress: Omit<Progress, 'updatedAt'>) {
    console.log(progress);
    const newProgress: Progress = { ...progress, updatedAt: new Date() };

    this.collection[newProgress.bookID] = newProgress;
    this.dump();

    if (this.logedIn) {
      await this.progressGql.mutate({ progress }).toPromise();
    }
  }

  dump() {
    this.storage.set('ProgressCollection', this.collection);
  }

  async getBookProgress(
    bookID: number,
  ): Promise<Omit<Progress, 'bookID' | 'updatedAt'>> {
    const progress = this.collection[bookID] || null;

    if (this.logedIn) {
      const book = (await this.bookGql.fetch({ id: bookID }).toPromise()).data
        .book;

      if (!progress) {
        return book.progress;
      }

      if (book.progress && book.progress.updatedAt > progress.updatedAt) {
        return book.progress;
      }
    }

    return progress;
  }
}

type ProgressCollection = {
  [key: number]: Progress;
};

export interface Progress {
  bookID: number;
  part: number;
  position: number;
  speed: number;
  updatedAt: Date;
}

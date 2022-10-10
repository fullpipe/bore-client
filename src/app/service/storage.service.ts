import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string, def?: T): T {
    const raw = localStorage.getItem(key);

    if (raw === null) {
      return def !== null ? def : null;
    }

    return JSON.parse(raw) as T;
  }
}

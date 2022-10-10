import { Component } from '@angular/core';
import { RangeCustomEvent } from '@ionic/angular';
import { BookQuery } from 'src/generated/graphql';
import { PlayerService, PlayerStatus, State } from '../service/player.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  state: State;
  book: BookQuery['book'] | null;
  playerStatus = PlayerStatus;

  constructor(private player: PlayerService) {
    this.player.state$.subscribe((s) => (this.state = s));
    this.player.book$.subscribe((b) => (this.book = b));
  }

  async start(id: number) {
    await this.player.load(id);
    this.player.play();
  }
  pause() {
    this.player.pause();
  }
  resume() {
    this.player.play();
  }

  seekFor(duration: number) {
    this.player.seekFor(duration);
  }

  onIonChange(ev: Event) {
    if (this.state.status !== PlayerStatus.seek) {
      return;
    }

    this.player.seek((ev as RangeCustomEvent).detail.value as number);
  }

  onIonKnobMoveStart(ev: Event) {
    this.player.seekStart();
  }

  onIonKnobMoveEnd(ev: Event) {
    this.player.play();
  }

  timeLeft(): string {
    const value = this.state.duration - this.state.position;

    const minutes = Math.floor(value / 60);
    const seconds = Math.ceil(value - minutes * 60);

    return `${minutes.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })}:${seconds.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })}`;
  }
  pinFormatter(value: number) {
    const minutes = Math.floor(value / 60);
    const seconds = Math.ceil(value - minutes * 60);

    return `${minutes.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })}:${seconds.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })}`;
  }
}

import { Component } from '@angular/core';
import { ActionSheetController, RangeCustomEvent } from '@ionic/angular';
import { BookQuery } from 'src/generated/graphql';
import { PlayerService, PlayerStatus, State } from '../service/player.service';
import { SleepService } from '../service/sleep.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  state: State;
  book: BookQuery['book'] | null;
  playerStatus = PlayerStatus;
  beforeSeek: PlayerStatus;

  constructor(
    private player: PlayerService,
    private sleep: SleepService,
    private actionSheetCtrl: ActionSheetController,
  ) {
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

  startPart(idx: number) {
    this.player.part(idx).play();
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
    this.beforeSeek = this.state.status;
    this.player.seekStart();
  }

  onIonKnobMoveEnd(ev: Event) {
    if (this.beforeSeek == PlayerStatus.play) {
      this.player.play();
    } else {
      this.player.pause();
    }
  }

  async selectSpeed() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Change playback speed',
      buttons: [
        {
          text: 'x0.8',
          data: 0.8,
        },
        {
          text: 'x1.0',
          data: 1,
        },
        {
          text: 'x1.2',
          data: 1.2,
        },
        {
          text: 'x1.5',
          data: 1.5,
        },
        {
          text: 'x2',
          data: 2,
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();

    const result = await actionSheet.onDidDismiss();

    if (!result.data) {
      return;
    }

    console.log(result);
    this.player.speed(result.data as number);
  }

  async selectSleep() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Stop after',
      buttons: [
        {
          text: '30 seconds',
          data: 30,
        },
        {
          text: '5 minutes',
          data: 5 * 60,
        },
        {
          text: '15 minutes',
          data: 15 * 60,
        },
        {
          text: '30 minutes',
          data: 30 * 60,
        },
        {
          text: '60 minutes',
          data: 60 * 60,
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();

    const result = await actionSheet.onDidDismiss();

    if (result.role && result.role === 'cancel') {
      this.sleep.stop();
    }

    if (!result.data) {
      return;
    }

    this.sleep.start(result.data as number);
  }

  timePass(): string {
    return this.formatTime(this.state.position);
  }

  timeLeft(): string {
    return this.formatTime(this.state.duration - this.state.position);
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.ceil(time - minutes * 60);

    return `${minutes.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })}:${seconds.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })}`;
  }
}

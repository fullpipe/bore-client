import { Component } from '@angular/core';
import { PlayerService } from '../service/player.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  constructor(private player: PlayerService) {}

  play(id: number) {
    this.player.play(id);
  }
}

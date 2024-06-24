import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PlayerService } from './service/player.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('box', { read: ElementRef }) box: ElementRef;
  constructor(private player: PlayerService) {}

  ngOnInit(): void {
    this.player.loadFromState();
  }
}

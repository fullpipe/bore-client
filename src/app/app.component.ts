import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GestureController } from '@ionic/angular';
import { PlayerService } from './service/player.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('box', { read: ElementRef }) box: ElementRef;
  constructor(
    private player: PlayerService,
    private gestureCtrl: GestureController
  ) {}

  ngAfterViewInit(): void {
    const loadFromState = this.gestureCtrl.create({
      el: this.box.nativeElement,
      threshold: 0,
      gestureName: 'preload-hook',
      onStart: () => {
        this.player.loadFromState();
        loadFromState.destroy();
      },
    });
    loadFromState.enable();
    console.log('asd');
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // this.player.loadFromState();
  }
}

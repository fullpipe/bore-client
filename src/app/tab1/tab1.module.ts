import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { IsVisibleDirective } from '../directive/isVisible.directive';
import { IntoViewDirective } from '../directive/intoView.directive';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, Tab1PageRoutingModule],
  declarations: [Tab1Page, IsVisibleDirective, IntoViewDirective],
})
export class Tab1PageModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookNewComponent } from './book-new/book-new.component';
import { Tab2Page } from './tab2.page';

const routes: Routes = [
  {
    path: '',
    component: Tab2Page,
  },
  {
    path: 'book-new',
    component: BookNewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Tab2PageRoutingModule {}

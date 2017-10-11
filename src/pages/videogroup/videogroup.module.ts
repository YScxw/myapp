import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VideogroupPage } from './videogroup';

@NgModule({
  declarations: [
    VideogroupPage,
  ],
  imports: [
    IonicPageModule.forChild(VideogroupPage),
  ],
  exports: [
    VideogroupPage
  ]
})
export class VideogroupPageModule {}

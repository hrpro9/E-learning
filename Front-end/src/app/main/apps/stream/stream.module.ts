import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FuseSharedModule } from '@fuse/shared.module';
import { StreamService } from './stream.service';
import { StreamComponent } from './stream.component';
import { VideoJSComponent } from './video/video.component';
import { FormsModule } from '@angular/forms';
import { ChatViewComponent } from './chat-view/chat-view.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

const routes: Routes = [
  {
    path: '**',
    component: StreamComponent,
    resolve: {
      chat: StreamService
    }
  }
];

@NgModule({
  declarations: [
    VideoJSComponent,
    StreamComponent,
    ChatViewComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FuseSharedModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRadioModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  exports: [
    StreamComponent
  ],
  providers: [
    StreamService
  ]
})
export class StreamModule { }

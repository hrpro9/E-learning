import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConferenceComponent } from "./conference.component";
import { Routes, RouterModule } from "@angular/router";
import { ConferenceService } from "./conference.service";
import { ChatViewComponent } from "./chat-view/chat-view.component";
import { FuseSharedModule } from "@fuse/shared.module";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatRadioModule } from "@angular/material/radio";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { VideoComponent } from "./video/video.component";

const routes: Routes = [
    {
        path: "**",
        component: ConferenceComponent,
        resolve: {
            chat: ConferenceService,
        },
    },
];

@NgModule({
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
    declarations: [ConferenceComponent, ChatViewComponent, VideoComponent],
    exports: [ConferenceComponent],
})
export class ConferenceModule {}

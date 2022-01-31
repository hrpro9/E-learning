import { Component, ViewEncapsulation } from "@angular/core";

import { fuseAnimations } from "@fuse/animations";
import { ChatService } from "../chat.service";
import { AppService } from "app/app.service";

@Component({
    selector: "chat-start",
    templateUrl: "./chat-start.component.html",
    styleUrls: ["./chat-start.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class ChatStartComponent {
    constructor(private _chatService: ChatService) {
        console.log(_chatService.UserId);
    }

    SetUserId(newId: string): void {
        this._chatService.UserId = newId;
    }
}

import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { FusePerfectScrollbarDirective } from "@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive";

import { ChatService } from "app/main/apps/chat/chat.service";
import { v1 as uuid } from "uuid";
import { ConferenceService } from "../conference.service";
import { IChat } from "../../IChat";
import { IChatData } from "../../IChatData";

@Component({
    selector: "chat-view",
    templateUrl: "./chat-view.component.html",
    styleUrls: ["./chat-view.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class ChatViewComponent implements OnInit, OnDestroy, AfterViewInit {
    user: any;
    chat: IChat;
    dialog: any[];
    contact: any;
    contacts: any[];
    replyInput: any;
    messageArray: Array<{ user: String; message: String }> = [];

    hasLive: any[];
    liveId: any;

    users = [];
    usersCount: number = 1;

    @ViewChild(FusePerfectScrollbarDirective)
    directiveScroll: FusePerfectScrollbarDirective;

    @ViewChildren("replyInput")
    replyInputField;

    @ViewChild("replyForm")
    replyForm: NgForm;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ConferenceService} _conferenceService
     */
    constructor(private _conferenceService: ConferenceService) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // this._conferenceService.getChat("2").subscribe({ next: thischat => this.chat = thischat, error: err => console.log(err) });
        //Socket io
        this._conferenceService.newUserJoined().subscribe((data) => {
            if (this.chat.id == data.room) {
                this.dialog.push(data), this.scrollToBottom();
            }
        });

        this._conferenceService.userLeftRoom().subscribe((data) => {
            if (this.chat.id == data.room) {
                this.dialog.push(data), this.scrollToBottom();
            }
        });

        this._conferenceService.newMessageReceived().subscribe((data) => {
            if (this.chat.id == data.room) {
                this.dialog.push(data), this.scrollToBottom();
            }
        });

        this._conferenceService.roomActiveUsers().subscribe((data) => {
            this.users.push(data.users),
                (this.usersCount = data.count),
                console.log(data.count);
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // await this._conferenceService.getChat("2").subscribe({ next: thischat => this.chat = thischat, error: err => console.log(err) });
        this.user = this._conferenceService.user;
        this.contacts = this._conferenceService.contacts;
        this.chat = this._conferenceService.chat;
        this.dialog = this._conferenceService.chat.dialog;
        this.join();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        this.replyInput = this.replyInputField.first.nativeElement;
        this.readyToReply();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Decide whether to show or not the contact's avatar in the message row
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    shouldShowContactAvatar(message, i): boolean {
        return (
            message.who !== this.user.id &&
            ((this.dialog[i + 1] &&
                this.dialog[i + 1].who !== this.dialog[i].who) ||
                !this.dialog[i + 1])
        );
    }

    shouldShowContactName(message, i): boolean {
        return (
            message.who !== this.user.id &&
            ((this.dialog[i - 1] &&
                this.dialog[i - 1].who !== this.dialog[i].who) ||
                !this.dialog[i - 1])
        );
    }

    /**
     * Check if the given message is the first message of a group
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    isFirstMessageOfGroup(message, i): boolean {
        return (
            i === 0 ||
            (this.dialog[i - 1] && this.dialog[i - 1].who !== message.who)
        );
    }

    /**
     * Check if the given message is the last message of a group
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    isLastMessageOfGroup(message, i): boolean {
        return (
            i === this.dialog.length - 1 ||
            (this.dialog[i + 1] && this.dialog[i + 1].who !== message.who)
        );
    }

    /**
     * Ready to reply
     */
    readyToReply(): void {
        setTimeout(() => {
            this.focusReplyInput();
            this.scrollToBottom();
        });
    }

    /**
     * Focus to the reply input
     */
    focusReplyInput(): void {
        setTimeout(() => {
            this.replyInput.focus();
        });
    }

    /**
     * Scroll to the bottom
     *
     * @param {number} speed
     */
    scrollToBottom(speed?: number): void {
        speed = speed || 400;
        if (this.directiveScroll) {
            this.directiveScroll.update();

            setTimeout(() => {
                this.directiveScroll.scrollToBottom(0, speed);
            });
        }
    }

    /**
     * Reply
     */
    reply(event): void {
        event.preventDefault();

        if (!this.replyForm.form.value.message) {
            return;
        }

        // Message
        const message = {
            who: this.user.id,
            message: this.replyForm.form.value.message,
            time: new Date().toISOString(),
        };

        // Add the message to the chat
        // this.dialog.push(message);

        // Reset the reply form
        this.replyForm.reset();

        // Update the server
        this._conferenceService
            .SendMessage(this.chat.id, message)
            .then((response) => {
                this.readyToReply();
            });
    }

    // Socket io

    join() {
        this._conferenceService.joinRoom({
            user: this.user.name,
            room: this.chat.id,
        });
    }

    leave() {
        this._conferenceService.leaveRoom({
            user: this.user.name,
            room: this.chat.id,
        });
    }
}

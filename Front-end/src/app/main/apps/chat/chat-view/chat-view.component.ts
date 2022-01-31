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
import { StreamService } from "../../stream/stream.service";

@Component({
    selector: "chat-view",
    templateUrl: "./chat-view.component.html",
    styleUrls: ["./chat-view.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class ChatViewComponent implements OnInit, OnDestroy, AfterViewInit {
    user: any;
    chat: any;
    dialog: any;
    contact: any;
    contacts: any[];
    replyInput: any;
    selectedChat: any;
    messageArray: Array<{ user: String; message: String }> = [];

    hasLive: any[];
    liveId: any;

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
     * @param {ChatService} _chatService
     */
    constructor(private _chatService: ChatService) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();

        //Socket io
        // this._chatService.newUserJoined()
        //     .subscribe(data => { this.dialog.push(data), this.scrollToBottom() });

        // this._chatService.userLeftRoom()
        //     .subscribe(data => { this.dialog.push(data), this.scrollToBottom() });

        this._chatService.newMessageReceived().subscribe((data) => {
            if (this.selectedChat.chatId == data.room) {
                this.dialog.push(data), this.scrollToBottom();
            }
        });

        this._chatService.liveStarted().subscribe((data) => {
            this._chatService.getChat(this.chat.id);
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.user = this._chatService.user;
        this.contacts = this._chatService.contacts;

        this._chatService.onChatSelected
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chatData) => {
                if (chatData) {
                    this.selectedChat = chatData;
                    this.chat = chatData.chat;
                    this.dialog = chatData.dialog;
                    this.readyToReply();
                }
            });

        //this.join();
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
     * Select contact
     */
    selectContact(): void {
        this._chatService.selectContact(this.contact);
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
        this._chatService
            .SendMessage(this.selectedChat.chatId, message)
            .then((response) => {
                this.readyToReply();
            });
    }

    //Socket io
    join() {
        this._chatService.joinRoom({
            user: this.user.name,
            room: this.chat.id,
        });
    }

    leave() {
        this._chatService.leaveRoom({
            user: this.user.name,
            room: this.chat.id,
        });
    }

    StartStream() {
        console.log("began streaming");
        const id = uuid() + uuid();
        this._chatService.createNewStreamChat(this.selectedChat.name, id);
        this._chatService.startStream(this.selectedChat.chatId, id);
        window.open(`apps/stream/${id}`);
    }

    StartConference() {
        console.log("began streaming");
        const id = uuid() + uuid();
        this._chatService.createNewConferenceChat(
            this.chat.name,
            this.chat.equip,
            this.chat.group,
            id
        );
        this._chatService.startConference(this.selectedChat.chatId, id);
        window.open(`apps/conference/${id}`);
    }
}

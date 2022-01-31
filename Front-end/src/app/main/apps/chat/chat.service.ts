import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from "@angular/router";
import { BehaviorSubject, Observable, Subject } from "rxjs";

import { FuseUtils } from "@fuse/utils";
import { promise } from "protractor";
import * as io from "socket.io-client";
import { AppService } from "app/app.service";
import { analyzeAndValidateNgModules } from "@angular/compiler";

@Injectable()
export class ChatService implements Resolve<any> {
    private socket = io("http://localhost:3000");

    server_Url: string = "http://localhost:83/TestApi/api/";
    UserId: string = "P313542";
    contacts: any[];
    chats: any[];
    user: any;
    newChatId: any;
    onChatSelected: BehaviorSubject<any>;
    onContactSelected: BehaviorSubject<any>;
    onChatsUpdated: Subject<any>;
    onUserUpdated: Subject<any>;
    onLeftSidenavViewChanged: Subject<any>;
    onRightSidenavViewChanged: Subject<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private _appService: AppService
    ) {
        // Set the defaults
        this.onChatSelected = new BehaviorSubject(null);
        this.onContactSelected = new BehaviorSubject(null);
        this.onChatsUpdated = new Subject();
        this.onUserUpdated = new Subject();
        this.onLeftSidenavViewChanged = new Subject();
        this.onRightSidenavViewChanged = new Subject();
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getContacts(),
                this.getChats(),
                this.getUser(),
            ]).then(([contacts, chats, user]) => {
                this.contacts = contacts;
                this.chats = chats;
                this.user = user;
                this.socket.emit("save", user.id);
                resolve();
            }, reject);
        });
    }

    /**
     * Get chat
     *
     * @param chatId
     * @returns {Promise<any>}
     */
    getChat(chatId): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(this.server_Url + "chat/" + chatId)
                .subscribe((response: any) => {
                    const chat = response;

                    const chatData = {
                        chatId: chat.id,
                        dialog: chat.dialog,
                        type: chat.type,
                        chat: chat,
                    };

                    this.onChatSelected.next({ ...chatData });
                }, reject);
        });
    }

    /**
     * Create new chat
     *
     * @param contactId
     * @returns {Promise<any>}
     */
    createNewPrivateChat(contactId): Promise<any> {
        return new Promise((resolve, reject) => {
            const chat = {
                IdUserCree: this.UserId.trim(),
                IdUserContact: contactId.trim(),
            };
            let chatId: string;
            // Post the created chat
            this._httpClient
                .post(this.server_Url + "chat", { ...chat })
                .subscribe((response: any) => {
                    chatId = response.id;
                    //get chat
                    this.newChatId = chatId;
                    this.joinRoom({ user: this.user.name, room: chatId });
                    // Update the user data from server
                    this.getChats().then((updatedChats) => {
                        this.onChatsUpdated.next(updatedChats);
                        this.chats = updatedChats;
                        resolve(updatedChats);
                    });
                }, reject);
        });
    }

    createNewStreamChat(chatName, id): Promise<any> {
        return new Promise((resolve, reject) => {
            const chat = {
                ID: id,
                IdUserCree: this.UserId.trim(),
                Type: "Stream",
                Nom: chatName,
            };
            let chatId: string;
            // Post the created chat
            this._httpClient
                .post(this.server_Url + "chat", { ...chat })
                .subscribe((response: any) => {
                    chatId = response.id;
                    //get chat
                    this.newChatId = chatId;
                    this.joinRoom({ user: this.user.name, room: chatId });
                }, reject);
        });
    }

    createNewConferenceChat(chatName, idEquip, idGroup, id): Promise<any> {
        return new Promise((resolve, reject) => {
            const chat = {
                ID: id,
                IdUserCree: this.UserId.trim(),
                IdEquip: idEquip,
                IdGroup: idGroup,
                Type: "Conference",
                Nom: chatName,
            };
            let chatId: string;
            // Post the created chat
            this._httpClient
                .post(this.server_Url + "chat", { ...chat })
                .subscribe((response: any) => {
                    chatId = response.id;
                    //get chat
                    this.newChatId = chatId;
                    this.joinRoom({ user: this.user.name, room: chatId });

                    console.log("created");
                }, reject);
        });
    }

    forceJoinRoom(data) {
        this.socket.emit("force join", data);
    }

    /**
     * Select contact
     *
     * @param contact
     */
    selectContact(contact): void {
        this.onContactSelected.next(contact);
    }

    /**
     * Set user status
     *
     * @param status
     */
    setUserStatus(status): void {
        this.user.status = status;
    }

    /**
     * Update user data
     *
     * @param userData
     */
    updateUserData(userData): void {
        this._httpClient
            .post("api/chat-user/" + this.user.id, userData)
            .subscribe((response: any) => {
                this.user = userData;
            });
    }

    /**
     * Update the chat dialog
     *
     * @param chatId
     * @param dialog
     * @returns {Promise<any>}
     */
    SendMessage(chatId, msg): Promise<any> {
        return new Promise((resolve, reject) => {
            const message = {
                IdUser: this.user.id,
                Content: msg.message,
                Time: msg.time,
                IdConversation: chatId,
            };
            this.socket.emit("message", message);

            let chat;
            this.onChatSelected.subscribe((chatData) => {
                if (chatData) {
                    chat = chatData.chat;
                }
            });

            const conversation = {
                ID: chat.id,
                Nom: chat.name,
                Type: chat.type,
                IdEquip: chat.equip,
                IdGroup: chat.group,
                IdUserCree: chat.userCree,
                IdUserContact: chat.userContact,
                hasStream: chat.hasStream,
                hasConference: chat.hasConference,
                streamId: chat.streamId,
                conferenceId: chat.conferenceId,
                lastMessage: msg.message,
            };

            this._httpClient
                .put(this.server_Url + "chat/" + chatId, conversation)
                .subscribe((updatedChat) => {
                    resolve(updatedChat);
                }, reject);

            this._httpClient
                .post(this.server_Url + "chat/message", message)
                .subscribe((updatedChat) => {
                    resolve(updatedChat);
                }, reject);
        });
    }

    startStream(chatId, streamId): Promise<any> {
        return new Promise((resolve, reject) => {
            this.socket.emit("startStream", { chatId, streamId });

            const chat = this.chats.find((item) => item.id == chatId);
            const conversation = {
                ID: chat.id,
                Nom: chat.name,
                Type: chat.type,
                IdEquip: chat.equip,
                IdGroup: chat.group,
                IdUserCree: chat.userCree,
                IdUserContact: chat.userContact,
                hasStream: true,
                streamId: streamId,
            };

            this._httpClient
                .put(this.server_Url + "chat/" + chatId, conversation)
                .subscribe((updatedChat) => {
                    resolve(updatedChat);
                }, reject);
        });
    }

    startConference(chatId, conferenceId): Promise<any> {
        return new Promise((resolve, reject) => {
            this.socket.emit("startConference", { chatId, conferenceId });

            const chat = this.chats.find((item) => item.id == chatId);
            const conversation = {
                ID: chat.id,
                Nom: chat.name,
                Type: chat.type,
                IdEquip: chat.equip,
                IdGroup: chat.group,
                IdUserCree: chat.userCree,
                IdUserContact: chat.userContact,
                hasConference: true,
                conferenceId: conferenceId,
            };

            this._httpClient
                .put(this.server_Url + "chat/" + chatId, conversation)
                .subscribe((updatedChat) => {
                    resolve(updatedChat);
                }, reject);
        });
    }

    /**
     * Get contacts
     *
     * @returns {Promise<any>}
     */
    getContacts(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(this.server_Url + "chat/contacts/" + this.UserId)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    /**
     * Get chats
     *
     * @returns {Promise<any>}
     */
    getChats(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(this.server_Url + "chats/" + this.UserId)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    /**
     * Get user
     *
     * @returns {Promise<any>}
     */
    getUser(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(this.server_Url + "chat/user/" + this.UserId)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    //Socket io

    newUserJoined() {
        let observable = new Observable<{
            who: String;
            message: String;
            time: string;
        }>((observer) => {
            this.socket.on("new user joined", (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });

        return observable;
    }

    forcedToJoinRoom() {
        let observable = new Observable<{
            who: String;
            message: String;
            time: string;
        }>((observer) => {
            this.socket.on("force joined", (contactId) => {
                console.log("begin..");
                this.createNewPrivateChat(contactId);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }

    userLeftRoom() {
        let observable = new Observable<{
            who: String;
            message: String;
            time: string;
        }>((observer) => {
            this.socket.on("left room", (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });

        return observable;
    }

    newMessageReceived() {
        let observable = new Observable<{
            who: String;
            message: String;
            time: string;
            room: string;
        }>((observer) => {
            this.socket.on("new message", (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });

        return observable;
    }

    liveStarted() {
        let observable = new Observable<{ liveId: string }>((observer) => {
            this.socket.on("live started", (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });

        return observable;
    }

    joinRoom(data) {
        this.socket.emit("join", data);
    }

    leaveRoom(data) {
        this.socket.emit("leave", data);
    }
}

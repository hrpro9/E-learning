import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { BehaviorSubject, Observable, observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import {
    Resolve,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    ActivatedRoute,
} from "@angular/router";
import { IChatData } from "../IChatData";
import { AppService } from "app/app.service";

@Injectable({
    providedIn: "root",
})
export class ConferenceService implements Resolve<any> {
    private socket = io("http://localhost:3000");
    server_Url: string = "http://localhost:83/TestApi/api/";
    UserId: string = "P313542";
    chatId: string;
    onChatSelected: BehaviorSubject<any>;
    data: any;
    chat: any;

    user: any;
    contacts: any[];

    constructor(
        private _httpClient: HttpClient,
        private route: ActivatedRoute,
        private _appService: AppService
    ) {
        this.onChatSelected = new BehaviorSubject(null);
        this.data = this.onChatSelected.asObservable();

        console.log(this.UserId);
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getContacts(),
                this.getUser(),
                this.getChat(route.paramMap.get("id")),
            ]).then(([contacts, user, chatData]) => {
                this.contacts = contacts;
                this.user = user;
                this.chat = chatData;
                this.socket.emit("save", user.id);
                resolve();
            }, reject);
        });
    }

    // getChat(chatId): Observable<any> {
    //   return this._httpClient.get(this.server_Url + "chat/" + chatId);
    // }

    getChat(chatId): Promise<IChatData> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(this.server_Url + "chat/" + chatId)
                .subscribe((response: any) => {
                    // const chat = response;

                    // const chatData = {
                    //   chatId: chat.id,
                    //   dialog: chat.dialog,
                    //   type: chat.type,
                    //   chat: chat
                    // };
                    // this.chat = chat;
                    // this.onChatSelected.next({ ...chatData });
                    resolve(response);
                }, reject);
        });
    }

    getUser(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(this.server_Url + "chat/user/" + this.UserId)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    getContacts(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient
                .get(this.server_Url + "chat/contacts/" + this.UserId)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    SendMessage(chatId, msg): Promise<any> {
        return new Promise((resolve, reject) => {
            const message = {
                IdUser: this.user.id,
                Content: msg.message,
                Time: msg.time,
                IdConversation: chatId,
            };
            this.socket.emit("message", message);

            const chat = this.chat;
            const conversation = {
                ID: chat.id,
                Nom: chat.name,
                Type: chat.type,
                IdEquip: chat.equip,
                IdGroup: chat.group,
                IdUserCree: chat.userCree,
                IdUserContact: chat.userContact,
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
    //Socket io

    newUserJoined() {
        let observable = new Observable<{
            who: String;
            message: String;
            time: string;
            room: string;
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

    userLeftRoom() {
        let observable = new Observable<{
            who: String;
            message: String;
            time: string;
            room: string;
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

    roomActiveUsers() {
        let observable = new Observable<{ count: number; users: [] }>(
            (observer) => {
                this.socket.on("room users", (data) => {
                    observer.next(data);
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );

        return observable;
    }

    joinRoom(data) {
        this.socket.emit("join", data);
    }

    leaveRoom(data) {
        this.socket.emit("leave", data);
    }
}

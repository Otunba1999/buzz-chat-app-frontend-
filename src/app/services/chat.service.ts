import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Chat } from '../models/chat';
import { BehaviorSubject, Subject, filter, map, pipe } from 'rxjs';
import { User } from '../models/user';
import * as Stomp from 'stompjs';
import SockJs from 'sockjs-client';
import { JsonPipe } from '@angular/common';
import { Message } from '../models/message';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private _baseUrl: string = 'http://localhost:3000/api/buzz/auth';
  private _updatedSortedChat = new BehaviorSubject<Chat[]>([]);
  private _userChats = new Subject<Chat[]>();
  stompClient: any;
  webSocketEndpoint: string = 'http://localhost:3000/ws';
  topic: string = '/topic/public';
  private _connectedUser: User;
  private _user = new Subject<any>();
  private _message = new Subject<Message>();
  private _readMessages = new Subject<Message[]>();
  private _onlineUser = new Subject<User>();
  constructor(private http: HttpClient, private authService: AuthService) {}

  set connectedUser(user: User) {
    this._connectedUser = user;
  }

  get connectedUser() {
    return this._connectedUser;
  }
  emitUserChats(chats: Chat[]) {
    this._userChats.next(chats);
  }

  emitLastMessage(message: Message) {
    this._message.next(message);
  }
  get userChats() {
    return this._userChats.asObservable();
  }

  get newMessage() {
    return this._message.asObservable();
  }

  get readMessages() {
    return this._readMessages.asObservable();
  }

  get user() {
    return this._user.asObservable();
  }

  _connect(data: any) {
    if (!this.authService.isAuthenticated) return;

    let ws = new SockJs(this.webSocketEndpoint, null, {
      withCredentials: true,
    });
    this.stompClient = Stomp.over(ws);
    const _this = this;

    this.stompClient.connect(
      {},
      (frame: any) => {
        console.log('Connection established: ' + frame);

        // Subscribe to the public topic to get updates about new users
        this.stompClient.subscribe(this.topic, (sdkEvent) => {
          this.handleNewUser(sdkEvent);
        });

        // Subscribe to the reply queue to get the connected user's data
        this.stompClient.subscribe(
          '/user/queue/reply',
          (sdkEvent) => {
            this._connectedUser = JSON.parse(sdkEvent.body);
          },
          (error) => {
            console.log('error on subscription on /user/queue/reply: ', error);
          }
        );

        // Subscribe to personal messages queue
        this.stompClient.subscribe(
          `/user/${_this._connectedUser.id}/queue/messages`,
          (sdkEvent) => {
            this.onMessageReceived(sdkEvent);
          }
        );
        // Sunscribe to personal read messages queue
        this.stompClient.subscribe(
          `/user/${_this._connectedUser.id}/queue/read`
        ),
          (sdkEvent) => {
            this.onReadMessageReceived(sdkEvent);
          };
        this._send(data);
      },
      this.errorCallback
    );
  }
  handleNewUser(data) {
    const newUser: User = JSON.parse(data.body);
    if (newUser.username != this._connectedUser.username)
      this._user.next(newUser);
    // _this.onMessageReceived(sdkEvent);
  }
  _disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
    console.log('websocket disconnected');
  }
  errorCallback(error) {
    console.log('Error occur =>' + error);
  }
  /**
   * Send message to server via websocket
   * @param {*} message
   */
  _send(message: any) {
    this.stompClient.send('/app/user.addUser', {}, JSON.stringify(message));
  }
  _sendMessage(message: Message) {
    this.stompClient.send('/app/chat', {}, JSON.stringify(message));
  }
  _readMessage(ids: string) {
    this.stompClient.send('/app/read', {}, JSON.stringify(ids));
  }
  onReadMessageReceived(messages: any) {
    const readMessages = JSON.parse(messages.body) as Message[];

    this._readMessages.next(readMessages);
  }
  onMessageReceived(message) {
    const newMessage: Message = JSON.parse(message.body);
    this._message.next(newMessage);
  }

  get baseUrl() {
    return this._baseUrl;
  }
  get updatedSortedChat() {
    return this._updatedSortedChat.asObservable();
  }

  getUserChats() {
    return this.http.get<any>(`${this.baseUrl}/chats`);
  }

  getAllMessages(senderId: string, receiverId: string) {
    return this.http.get<Message[]>(
      `${this.baseUrl}/messages/${senderId}/${receiverId}`
    );
  }
  sendMessage(data: any, username: string) {
    return null;
  }

  searchUser(username: string) {
    return this.http.get<Chat[]>(`${this.baseUrl}/users/${username}`);
  }

  readMessage(messageIds: string) {
    return null;
  }
  emitUpdatedChat(chats: Chat[]) {
    this._updatedSortedChat.next(this.sortChat(chats));
    console.log('from chat service sortedChat =', this.sortChat(chats));
  }
  sortChat(chats: Chat[]) {
    return chats.sort((chatA, chatB) => {
      const timeA = new Date().getTime();
      const timeB = new Date().getTime();
      return timeA - timeB;
    });
  }
}

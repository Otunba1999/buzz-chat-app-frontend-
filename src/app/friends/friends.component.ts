import { CommonModule } from '@angular/common';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from '../chat/chat.component';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';
import { ChatService } from '../services/chat.service';
import { Chat } from '../models/chat';
import { Message } from '../models/message';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';
import { transition, trigger, useAnimation } from '@angular/animations';
import { slideFromBottom } from '../animations/slide-from-bottom';
import { ClickOutsideDirective } from '../click-outside.directive';
import { UserService } from '../services/user.service';
import { keyPress } from '../animations/key-press';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ChatComponent,
    ProfileMenuComponent,
    ClickOutsideDirective,
  ],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss',
  animations: [
    keyPress,
    trigger('showMenu', [
      transition(':enter', [useAnimation(slideFromBottom)]),
    ]),
  ],
})
export class FriendsComponent {
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService
  ) {}
  placeholder: string = 'Search or start a new chat';
  searchText: string = '';
  message: string = '';
  messages: Message[];
  lastMessage: Message;
  filteredChats: Chat[] = [];
  @ViewChild('chatSecImage') profileImg: ElementRef<HTMLImageElement>;
  @ViewChild('image') image: ElementRef<HTMLImageElement>;
  @ViewChild('iconButton') iconButton: ElementRef;
  @ViewChild('messageList') messageList: ElementRef<HTMLDivElement>;
  // @ViewChild('profileMenu', {static: false}) profileMenu ;
  chat: Chat | undefined;
  appUser: User | undefined;
  isImageLoaded: boolean = false;
  chats: Chat[] = [];
  recipient: User;
  isActive: boolean = false;
  showProfileMenu = false;
  isMenuOpening = false;
  imageUrl: string = 'http://localhost:3000/api/buzz/auth/download/';
  connectedUserUrl: string;
  isKeyPressed: boolean = false;

  ngOnInit() {
    this.chatService.userChats.subscribe((users) => {
      this.chats = users;
      this.filteredChats = this.chats;
    });

    this.authService.user.subscribe((user) => {
      this.appUser = user;
      this.connectedUserUrl = this.appUser.imageUrl;
    });

    this.chatService.newMessage.subscribe((message) => {
      console.log('from friend component new message => ' + message);
      this.messages.push(message);
      this.chat.lastMessage = message;
    });

    this.chatService.readMessages.subscribe((readMessages) => {
      let unread = readMessages.length;
      for (let i = this.messages.length - 1; i <= 0; i--) {
        if (unread === 0) break;
        for (let mes of readMessages) {
          if (mes.id === this.messages[i].id) {
            this.messages[i] = mes;
            unread--;
          }
        }
      }
    });

    this.userService.imageUrl.subscribe((url) => {
      this.appUser.imageUrl = url;
    });
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleKey() {
    this.isKeyPressed = !this.isKeyPressed;
  }

  clearText() {
    if (this.searchText) this.searchText = '';
  }
  isChatActive(chat: Chat) {
    return chat === this.chat;
  }
  onImageLoaded() {
    this.isImageLoaded = true;
    this.image.nativeElement.style.opacity = '1';
  }
  onChatSecImageLoaded() {
    this.profileImg.nativeElement.style.opacity = '1';
  }

  openChat(chat: Chat) {
    this.chat = chat;

    this.recipient = chat.user;

    this.chatService
      .getAllMessages(this.appUser.id, this.recipient.id)
      .subscribe((messages) => {
        this.messages = messages;
        const unReadMesssages = messages.filter((mes) => {
          return mes.senderId === chat.user.id && mes.status === 'DELIVERED';
        });
        const ids = unReadMesssages.map((mes) => mes.id);
        if (ids.length > 0) {
          const stringId = ids.join(',');
          this.chatService._readMessage(stringId);
        }
      });
  }

  getSender(chat: Chat) {
    const user = null;
    return user;
  }
  getTime(message: Message) {
    const date = new Date(message.timestamp);
    const hours = date.getHours();
    const mins = date.getMinutes();
    const h = String(hours).length <= 1 ? `0${hours}` : `${hours}`;
    const m = String(mins).length <= 1 ? `0${mins}` : `${mins}`;
    return `${h}:${m}`;
  }
  sendMessage() {
    const data: Message = {
      id: null,
      senderId: this.appUser.id,
      recipientId: this.recipient.id,
      content: this.message,
      timestamp: new Date(),
      status: 'DELIVERED',
      chatId: null,
      messageType: 'TEXT',
    };
    this.chatService._sendMessage(data);
    this.messages.push(data);
    this.chat.lastMessage = data;
    this.scrollToBottom();
    this.message = '';
  }

  filterChat() {
    if (this.searchText.trim() !== '') this.filteredChats = this.chats;
    this.chatService.searchUser(this.searchText).subscribe((user) => {
      this.filteredChats = user;
    });
  }

  displayMenu() {
    this.isMenuOpening = true;
    this.showProfileMenu = true;
    setTimeout(() => {
      document.addEventListener('click', this.onDocumentClick.bind(this));
      this.isMenuOpening = false;
    }, 0);
  }
  hideMenu() {
    if (!this.isMenuOpening) {
      this.showProfileMenu = false;
      // document.removeEventListener('click', this.onDocumentClick.bind(this));
    }
  }
  scrollToBottom() {
    try {
      this.messageList.nativeElement.scrollTop =
        this.messageList.nativeElement.scrollHeight;
    } catch (error) {
      console.log('scroll to bottom fail', error);
    }
  }
  private onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickInside = target.closest('#profileMenu');
    if (!clickInside) this.hideMenu();
  }
}

import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chat } from '../models/chat';
import { CommonModule } from '@angular/common';
import { User } from '../models/user';
import { Message } from '../models/message';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  constructor(
    private authService: AuthService,
    private chatService: ChatService
  ) {}
  @Input() chat: Chat | undefined;
  @Input() lastMessage: Message;
  @ViewChild('image') image: ElementRef<HTMLImageElement>;
  unRead: number;
  sender: string;
  index: number;
  appUser: User;
  baseUrl = 'http://localhost:3000/api/buzz/auth/download/';

  ngOnInit() {
    this.authService.user.subscribe((user) => {
      this.sender = user.username;
      this.appUser = user;
    });
   
  }

  getTime(chat: Chat) {
    const date = new Date(chat.lastMessage.timestamp);
    const hours = date.getHours();
    const mins = date.getMinutes();
    const h = String(hours).length <= 1 ? `0${hours}` : `${hours}`;
    const m = String(mins).length <= 1 ? `0${mins}` : `${mins}`;
    return `${h}:${m}`;
  }
  onImageLoad() {
    this.image.nativeElement.style.opacity = '1';
  }
}

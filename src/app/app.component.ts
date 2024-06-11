import { Component } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { FormPageComponent } from './form-page/form-page.component';
import { slideInAnimation } from './animations/animation';
import { AuthService } from './services/auth.service';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [slideInAnimation],
})
export class AppComponent {
  title = 'buzz';
  constructor(
    private contexts: ChildrenOutletContexts,
    private authService: AuthService,
    private chatService: ChatService
  ) {}
  ngOnInit() {
    this.authService.autoLogin();
    this.authService.refresh.subscribe((value) => {
      this.chatService.connectedUser = value;
      this.chatService._connect({ username: value.username, password: '' });

      this.chatService.getUserChats().subscribe((chats) => {
        this.chatService.emitUserChats(chats);
      });
    });
    // }
  }

  getRouteAnimationData() {
    const data =
      this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    return data;
  }
  ngOnDestroy() {
    localStorage.removeItem('auth');
  }
}

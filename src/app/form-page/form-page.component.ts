import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-page.component.html',
  styleUrl: './form-page.component.scss',
})
export class FormPageComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService
  ) {}

  isShowPassword: boolean = false;
  isLogonMode: boolean = true;
  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  ngOnInit() {}

  showPassword() {
    this.isShowPassword = !this.isShowPassword;
  }
  changeToLogin() {
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.isLogonMode = !this.isLogonMode;
  }
  onSubmit() {
    if (this.isLogonMode) {
      const data = { username: this.username, password: this.password };
      this.authService.loginUser(data).subscribe((authResponse) => {
        this.chatService.connectedUser = authResponse.user;
        this.authService.emitUser(authResponse.user);
        
        this.router.navigate(['chat']);
        this.chatService._connect(data);
        this.chatService.getUserChats().subscribe((chats) => {
          this.chatService.emitUserChats(chats);
        });
      });
    } else {
      
      if (this.password === this.confirmPassword) {
        const data = { username: this.username, password: this.password };
        this.authService.registerUser(data).subscribe((user) => {
          this.isLogonMode = !this.isLogonMode;
          
        });
      }
    }
  }
}

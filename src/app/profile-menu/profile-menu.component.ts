import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../spinner/spinner.component';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';
import { keyPress } from '../animations/key-press';

@Component({
  selector: 'profile-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
  animations: [keyPress],
})
export class ProfileMenuComponent {
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  @ViewChild('input', { static: false }) input: ElementRef<HTMLInputElement>;
  @ViewChild('file', { static: false }) fileInput: ElementRef<HTMLInputElement>;
  @ViewChild('image') image: ElementRef<HTMLImageElement>;
  @ViewChild('active', { static: false }) active: ElementRef<HTMLDivElement>;
  options = [
    { icon: 'fa fa-laptop', value: 'General' },
    { icon: 'fa fa-key', value: 'Account' },
    { icon: 'fa fa-comments-o', value: 'Chats' },
    { icon: 'fa fa-info-circle', value: 'Help' },
  ];
  appUser: User | undefined;
  accountUserUsername = '';
  isReadOnly: boolean = true;
  maxLimit: number = 25;
  nameLength: number = 0;
  showSelect: boolean = false;
  imageUrl: string;
  showSpinner: boolean = true;
  isKeyPressed = false;
  baseUrl: string = 'http://localhost:3000/api/buzz/auth/download/';

  ngOnInit() {
    this.authService.user.subscribe((user) => {
      this.appUser = user;
    });
    this.accountUserUsername = this.appUser?.username;
    this.imageUrl = this.appUser?.imageUrl;

    document.getElementById('active').classList.add('active');
  }

  toggleKey() {
    this.isKeyPressed = !this.isKeyPressed;
  }

  changeReadOnly(event) {
    this.isReadOnly = false;
    this.input.nativeElement.focus();
    event.preventDefault();
  }
  activeOption(event: MouseEvent) {
    const activeEle = document
      .querySelector('.active')
      .classList.remove('active');

    const target = event.currentTarget as HTMLElement;

    const p = target.querySelector('p');

    if (p) {
      for (let op of this.options) {
        if (p.textContent === op.value || p.textContent === 'Profile') {
          target.classList.add('active');
          break;
        }
      }
    }
    return false;
  }

  preventFocus(event: Event) {
    event.preventDefault();
  }
  onBlur() {
    this.isReadOnly = true;
    const data = { username: this.accountUserUsername, password: '' };
    this.userService.updateUsername(data).subscribe();
  }

  onMouseEnter() {
    this.showSelect = true;
  }
  onMouseOut() {
    this.showSelect = false;
  }

  selectFile() {
    this.fileInput.nativeElement.click();
  }
  getSelectedFile(event) {
    this.showSpinner = true;
    const selectedFile = event.target.files[0];

    const formData = new FormData();
    formData.append('file', selectedFile);

    this.userService.uploadPic(formData).subscribe((res) => {
      this.userService.emitUrl(res.imageUrl);
      this.appUser.imageUrl = res.imageUrl;
      this.showSpinner = false;
    });
  }
  onLoaded() {
    this.showSpinner = false;
    this.image.nativeElement.style.opacity = '1';
  }

  limitInput(event) {
    if (event.target.value.length > this.maxLimit) {
      event.preventDefault();
      this.accountUserUsername = event.target.value.slice(0, this.maxLimit);
    }
  }

  getLimit() {
    this.nameLength = this.accountUserUsername.length;
    return `${this.nameLength}/${this.maxLimit}`;
  }

  logout() {
    this.authService.logout();
  }
}

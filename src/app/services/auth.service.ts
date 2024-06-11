import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse } from '../models/auth-response';
import {
  BehaviorSubject,
  ReplaySubject,
  Subject,
  catchError,
  tap,
  throwError,
} from 'rxjs';
import { User } from '../models/user';
import { ChatService } from './chat.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}
  private _baseUrl: string = 'http://localhost:3000/api/buzz';
  private _isAuthenticated: boolean = false;
  authResponse = new BehaviorSubject<AuthResponse>(null);
  private _user = new BehaviorSubject<User>(null);
  private _refresh = new ReplaySubject<User>(null);

  get isAuthenticated() {
    return this._isAuthenticated;
  }
  emitUser(user: User) {
    this._user.next(user);
  }

  get user() {
    return this._user.asObservable();
  }
  get baseUrl() {
    return this._baseUrl;
  }

  get refresh() {
    return this._refresh.asObservable();
  }

  registerUser(data: any) {
    return this.http.post<any>(`${this.baseUrl}/register`, data);
  }

  loginUser(data: any) {
    localStorage.clear();
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap((auth) => {
        this._user.next(auth.user);
        const response = new AuthResponse(auth.user, auth.token);
        this.authResponse.next(response);
        // this._user.next(response.user);
        this._isAuthenticated = true;

        localStorage.setItem('auth', JSON.stringify(response));
      }),
      catchError((err) => {
        let errMessage = 'Invalid cridentials';
        return throwError(() => errMessage);
      })
    );
  }

  logout() {
    this.authResponse.next(null);
    this._isAuthenticated = false;
    localStorage.removeItem('auth');
    this.router.navigate(['form']);
  }
  autoLogin() {
    const authData = localStorage.getItem('auth');

    if (authData) {
      try {
        const existingResponse: AuthResponse = JSON.parse(authData);

        if (existingResponse) {
          this._user.next(existingResponse._user);
          const response = new AuthResponse(
            existingResponse._user,
            existingResponse._token
          );
          this.authResponse.next(response);
          this._isAuthenticated = true;
          this._refresh.next(response._user);
        }
      } catch (error) {
        console.log('Error parsing data from local storage');
      }
    }
  }
}

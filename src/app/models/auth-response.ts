import { User } from './user';

export class AuthResponse {
  constructor(public _user: User, public _token: string) {}
  get user(){
    return this._user;
  }
  get token(){
    return this._token;
  }
}

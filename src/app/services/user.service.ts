import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthResponse } from '../models/auth-response';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}
  private _baseUrl: string = 'http://localhost:3000/api/buzz/auth';
  private _imageUrl = new Subject<string>();

  emitUrl(url: string){
    this._imageUrl.next(url);
  }
  get imageUrl(){
    return this._imageUrl.asObservable();
  }

  uploadPic(data: any) {
    return this.http.post<any>(`${this._baseUrl}/user/upload-profile-pic`, data);
  }
  updateUsername(data: any){
    return this.http.put<AuthResponse>(`${this._baseUrl}/user/update`, data);
  }
}

import { Routes } from '@angular/router';
import { FormPageComponent } from './form-page/form-page.component';
import { FriendsComponent } from './friends/friends.component';
import { authGuard } from './auth.guard';
// import { animation } from '@angular/animations';

export const routes: Routes = [
    {path: '', pathMatch: 'full', redirectTo: '/form'},
    {path: 'form', component:FormPageComponent, data: {animation : 'formPage'}},
    {path: 'chat', component:FriendsComponent, canActivate: [authGuard],  data: {animation : 'chatPage'}}
];

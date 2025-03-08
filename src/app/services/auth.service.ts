import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user : any = {
    name:'Prueba 1',
    foto: './images/user-default.png'
  }

  constructor() { }


}

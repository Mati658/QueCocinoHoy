import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import supabase from '../supabaseClient'; // Importamos la instancia única
import { NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  ngZone = inject(NgZone);
  supabaseUrl : string = environment.URL;
  supabaseKey : string = environment.SUPABASE_KEY;
  usuario : any;
  sesion : any;
  flagLogin : boolean = false;

  constructor() { 
    // this.signOut()
    this.getState()
  }

  async handleSignInWithGoogle(response:any) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    })
    this.sesion = (data != undefined ? data : error);
    this.flagLogin = this.sesion != error ? false : true
    this.getState()
  }

  async getState(){
    this.usuario = (await supabase.auth.getUserIdentities()).data?.identities[0]
    this.ngZone.run(()=>{});    
    console.log(this.usuario)
  }

  async signOut(){
    await supabase.auth.signOut();
  }

}

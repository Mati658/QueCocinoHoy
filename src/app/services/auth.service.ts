import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import supabase from '../supabaseClient'; // Importamos la instancia única
import { NgZone } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  supabaseService = inject(SupabaseService);
  ngZone = inject(NgZone);
  router = inject(Router)
  supabaseUrl : string = environment.URL;
  supabaseKey : string = environment.SUPABASE_KEY;
  usuario : any;
  usuarioDB : any;
  sesion : any;
  flagLogin : boolean = false;
  flagRecetaPerfil : boolean = false;

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
    await this.getState()
  }

  async getState(){
    this.usuario = (await supabase.auth.getUserIdentities()).data?.identities[0]
    this.ngZone.run(()=>{});    
    console.log(this.usuario)
    if (this.usuario){
      let userDB = await this.getUsuarioDB();
      if( userDB != false){
        this.usuarioDB = userDB[0]
      }
    }
  }

  async getUsuarioDB(){
    return await (this.supabaseService.getUsuario(this.usuario.email))
  }

  async signOut(){
    await supabase.auth.signOut();
    window.location.reload();
  }

}

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import supabase from '../supabaseClient'; // Importamos la instancia única

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  supabaseUrl : string = environment.URL;
  supabaseKey : string = environment.SUPABASE_KEY;

  constructor() { 
    this.pruebas()
  }

  async pruebas(){
    console.log(await supabase.auth.getSession())
    console.log(await supabase.auth.getUserIdentities())
  }

  async handleSignInWithGoogle(response:any) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    })
    console.log(data != undefined ? data : error)
  }

}

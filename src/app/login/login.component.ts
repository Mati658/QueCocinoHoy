import { AfterViewInit, Component, inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit {
  auth = inject(AuthService);
  supabase = inject(SupabaseService);

  ngAfterViewInit(): void {
    setTimeout(() => this.loadGoogleSignIn(), 500);
  }

  loadGoogleSignIn() {
    if (!window.google) {
      console.error('Google API no cargada.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: environment.GOOGLE_ID,
      callback: this.handleCredentialResponse.bind(this)
    });

    const googleButton = document.getElementById('google-signin-btn');
    if (googleButton) {
      window.google.accounts.id.renderButton(googleButton, { theme: 'outline', size: 'large' });
      // googleButton.addEventListener("click", () => {
      //   window.google.accounts.id.prompt();
      // });
    } else {
      console.error('No se encontró el elemento del botón de Google.');
    }
  }

  handleCredentialResponse(response: any) {
    console.log('Token recibido:', response.credential);
    if (!this.auth) {
      console.error("Error: this.auth no está definido");
      return;
    }
    this.auth.handleSignInWithGoogle(response).then(res=>{
      if (this.auth.usuario) {
        this.supabase.altaUsuario(this.auth.usuario);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    })
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { AuthService } from './services/auth.service';
import { PerfilComponent } from "./perfil/perfil.component";
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PerfilComponent, ClickOutsideDirective, HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'QueCocinoHoy';
  auth = inject(AuthService);
  flagPerfil : boolean = false;
  flagAnim : boolean = false;
  
  recibirFlag(flag : any, elemento:string){
    this.flagAnim = !flag
    setTimeout(async () => {
      switch (elemento) {
        case 'perfil':
          this.flagPerfil = !flag;          
          break;
      }
      this.flagAnim = true;
    }, 500);
  }
}

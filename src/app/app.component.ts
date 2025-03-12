import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { PerfilComponent } from "./perfil/perfil.component";
import { ClickOutsideDirective } from './directives/click-outside.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, PerfilComponent, ClickOutsideDirective],
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

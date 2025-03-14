import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent {
  auth = inject(AuthService);

  constructor(){
    // console.log(this.auth.usuario)
  }

  signOut(){
    this.auth.signOut();
  }
}

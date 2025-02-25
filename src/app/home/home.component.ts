import { Component, inject } from '@angular/core';
import { APIsService } from '../services/apis.service';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  recetaApi = inject(APIsService);
  supabase = inject(SupabaseService);

  constructor(){
    this.supabase.traerTodo().then(res=>{
      console.log(res);
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-receta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receta.component.html',
  styleUrl: './receta.component.scss'
})
export class RecetaComponent {
  supabase = inject(SupabaseService); 
  receta : any;
  ingredientes : any[] = [];
  imagen : string = "";
  
  @Input() set recetaRecibida(receta:any){
    this.receta = receta;
    this.imagen = receta.imagenes[0]
    console.log(this.imagen)
    this.supabase.getIngredientesDeReceta(receta.id).then((res:any)=>{
      this.ingredientes = res;
      console.log(this.ingredientes);
    })
    console.log(receta)
  };

  convertirJson(json:string){
    let res : any = false;
    if (json) 
      return JSON.parse(json);
    
    return res;
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-receta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receta.component.html',
  styleUrl: './receta.component.scss'
})
export class RecetaComponent {
  supabase = inject(SupabaseService); 
  receta : any;
  ingredientes : any[] = [];
  imagen : string = "";
  comentario : string = "";

  @Input() set recetaRecibida(receta:any){
    this.receta = receta;
    this.imagen = receta.imagenes[0]
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

  async likearReceta(){
    let recetaActualizada : any = await this.supabase.updateLike(this.receta.id, this.receta.likes);
    this.receta.likes = recetaActualizada[0].likes;
  }

  async subirComentario(){
    if (this.receta.comments == null) {
      this.receta.comments = [];
    }
    let recetaActualizada : any = await this.supabase.updateComentario(this.receta.id, this.comentario, this.receta.user_id, this.receta.comments);
    this.receta.comments = recetaActualizada[0].comments;
  }

  async comentar(event :  KeyboardEvent){
    if (event.key === 'Enter') {
      event.preventDefault(); // Evita el salto de línea
      if (this.comentario != ""){
        await this.subirComentario(); 
        this.comentario = "";
      }
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-receta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receta.component.html',
  styleUrl: './receta.component.scss'
})
export class RecetaComponent {
  supabase = inject(SupabaseService);   
  auth = inject(AuthService);
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
    this.auth.usuarioDB.likeados = this.auth.usuarioDB.likeados != null ? this.auth.usuarioDB.likeados : []
    let data : any = await this.supabase.updateLikesUsuario(this.receta.id, this.auth.usuarioDB.id, this.auth.usuarioDB.likeados)
    this.auth.usuarioDB.likeados = data[0].likeados;
    let recetaActualizada : any = await this.supabase.updateLike(this.receta.id, this.receta.likes+=1);
    this.receta.likes = recetaActualizada[0].likes;
  }

  async dislikeReceta(){
    let i = this.auth.usuarioDB.likeados.findIndex((x:any) => x === this.receta.id)
    this.auth.usuarioDB.likeados.splice(i,1)
    await this.supabase.updateLikesUsuario(this.receta.id, this.auth.usuarioDB.id, this.auth.usuarioDB.likeados, true)
    let recetaActualizada : any = await this.supabase.updateLike(this.receta.id, this.receta.likes-=1);
    this.receta.likes = recetaActualizada[0].likes;
  }

  verificarLike(){
    return this.auth.usuarioDB.likeados?.includes(this.receta.id)
  }

  async saveReceta(){
    this.auth.usuarioDB.guardados = this.auth.usuarioDB.guardados != null ? this.auth.usuarioDB.guardados : []
    let data : any = await this.supabase.updateSavesUsuario(this.receta.id, this.auth.usuarioDB.id, this.auth.usuarioDB.guardados)
    this.auth.usuarioDB.guardados = data[0].guardados;
  }

  async unsaveReceta(){
    let i = this.auth.usuarioDB.guardados.findIndex((x:any) => x === this.receta.id)
    this.auth.usuarioDB.guardados.splice(i,1)
    await this.supabase.updateSavesUsuario(this.receta.id, this.auth.usuarioDB.id, this.auth.usuarioDB.guardados, true)
  }

  verificarSave(){
    return this.auth.usuarioDB.guardados?.includes(this.receta.id)
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

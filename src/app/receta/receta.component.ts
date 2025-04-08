import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { GetTimePipe } from '../pipes/get-time.pipe';

@Component({
  selector: 'app-receta',
  standalone: true,
  imports: [CommonModule, FormsModule, GetTimePipe],
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
  recetaStars : any;
  flagVotado : boolean = false;
  starAnterior : any;

  @Input() set recetaRecibida(receta:any){
    this.receta = receta;
    this.imagen = receta.imagenes[0]
    this.supabase.getIngredientesDeReceta(receta.id).then((res:any)=>{
      this.ingredientes = res;
      console.log(this.ingredientes);
    })
    console.log(receta)
    this.verificarStars()
  };

  convertirJson(json:string){
    let res : any = false;
    if (json) 
      return JSON.parse(json);
    
    return res;
  }

  async likearReceta(){
    if (this.verificarUsuario()) { 
      this.auth.usuarioDB.likeados = this.auth.usuarioDB.likeados != null ? this.auth.usuarioDB.likeados : []
      let data : any = await this.supabase.updateLikesUsuario(this.receta.id, this.auth.usuarioDB.id, this.auth.usuarioDB.likeados)
      this.auth.usuarioDB.likeados = data[0].likeados;
      let recetaActualizada : any = await this.supabase.updateLike(this.receta.id, this.receta.likes+=1);
      this.receta.likes = recetaActualizada[0].likes;
    }
  }

  async dislikeReceta(){
    if (this.verificarUsuario()) { 
      let i = this.auth.usuarioDB.likeados.findIndex((x:any) => x === this.receta.id)
      this.auth.usuarioDB.likeados.splice(i,1)
      await this.supabase.updateLikesUsuario(this.receta.id, this.auth.usuarioDB.id, this.auth.usuarioDB.likeados, true)
      let recetaActualizada : any = await this.supabase.updateLike(this.receta.id, this.receta.likes-=1);
      this.receta.likes = recetaActualizada[0].likes;
    }
  }

  verificarLike(){
    if (!this.verificarUsuario()) {
      const buttonElement = document.getElementById(`heart`) as HTMLInputElement;
      if (buttonElement){
        buttonElement.checked = false;
      }
      return false
    }
    return this.auth.usuarioDB.likeados?.includes(this.receta.id)
  }

  async saveReceta(){
    if (this.verificarUsuario()) { 
      this.auth.usuarioDB.guardados = this.auth.usuarioDB.guardados != null ? this.auth.usuarioDB.guardados : []
      let data : any = await this.supabase.updateSavesUsuario(this.receta.id, this.auth.usuarioDB.id, this.auth.usuarioDB.guardados)
      this.auth.usuarioDB.guardados = data[0].guardados;
    }
  }

  async unsaveReceta(){
    if (this.verificarUsuario()) { 
      let i = this.auth.usuarioDB.guardados.findIndex((x:any) => x === this.receta.id)
      this.auth.usuarioDB.guardados.splice(i,1)
      await this.supabase.updateSavesUsuario(this.receta.id, this.auth.usuarioDB.id, this.auth.usuarioDB.guardados, true)
    }
  }

  verificarSave(){
    if (!this.verificarUsuario()) {
      const buttonElement = document.getElementById(`bookmark`) as HTMLInputElement;
      if (buttonElement){
        buttonElement.checked = false;
      }
      return false
    }
    return this.auth.usuarioDB.guardados?.includes(this.receta.id)
  }

  async subirComentario(){
    if (this.receta.comments == null) {
      this.receta.comments = [];
    }
    let recetaActualizada : any = await this.supabase.updateComentario(this.receta.id, this.comentario, this.auth.usuarioDB, this.receta.comments);
    this.receta.comments = recetaActualizada[0].comments;
  }

  async comentar(event :  KeyboardEvent){
    if (event.key === 'Enter') {
      event.preventDefault(); // Evita el salto de línea
      if (this.comentario != ""){
        if (this.verificarUsuario()) { 
          await this.subirComentario(); 
          this.comentario = "";
          return;
        }
        return;
      }
    }
  }

  verificarStars(){
    if (!this.verificarUsuario()) {
      return false
    }
    this.recetaStars = this.receta.stars;
    console.log(this.auth.usuarioDB.puntuados)
    for (let i = 0; i < this.auth.usuarioDB.puntuados?.length; i++) {
      const element = this.auth.usuarioDB.puntuados[i];
      if (element.id_receta == this.receta.id) {
        setTimeout(() => {
          const buttonElement = document.getElementById(`star-${this.recetaStars.stars}`) as HTMLInputElement;
          console.log(`star-${element.stars}`);
          this.recetaStars = element; 
          console.log(this.recetaStars)
          this.flagVotado = true;
          if (buttonElement){
            buttonElement.checked = true;
          }
          return true;
        }, 0);
      }
    }
    return false
  }

  async puntuarReceta(stars: number) {
    if (!this.verificarUsuario()) return false;
  
    this.auth.usuarioDB.puntuados = this.auth.usuarioDB.puntuados || [];
  
    let votos = this.receta.stars.votos;
    let puntosActuales = this.receta.stars.stars;
    let index = this.auth.usuarioDB.puntuados.findIndex((x: any) => x.id_receta === this.receta.id);
    let starAnterior = index !== -1 ? this.auth.usuarioDB.puntuados[index].stars : 0;
  
    if (index !== -1) {
      this.auth.usuarioDB.puntuados[index].stars = stars;
    } else {
      this.auth.usuarioDB.puntuados.push({ stars, id_receta: this.receta.id });
      votos++;
    }
  
    let diferenciaStars = stars - starAnterior;
    let puntosNuevos = puntosActuales + diferenciaStars;
  
    let data: any = await this.supabase.updateStarsUsuario(this.receta.id,stars,this.auth.usuarioDB.id,this.auth.usuarioDB.puntuados);
    this.auth.usuarioDB.puntuados = data[0].puntuados;
  
    let recetaActualizada: any = await this.supabase.updateStar(this.receta.id, puntosNuevos, votos);
    this.receta.stars = recetaActualizada[0].stars;
  
    console.log(`Nueva puntuación: ${this.receta.stars.stars}, Votos: ${votos}`);
    return true;
  }
  
  verificarUsuario(){
    if (this.auth.usuario) {
      return true
    }
    this.auth.flagLogin = true;
    return false;
  }
}

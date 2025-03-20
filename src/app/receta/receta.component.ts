import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input } from '@angular/core';
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
  recetaStars : any;

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
      this.auth.flagLogin = true;
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
      this.auth.flagLogin = true;
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
        this.auth.flagLogin = true;
        return;
      }
    }
  }

  verificarStars(){
    if (!this.verificarUsuario()) {
      this.auth.flagLogin = true;
      return false
    }
    this.recetaStars = this.receta.stars;
    console.log(this.auth.usuarioDB.puntuados[0])
    for (let i = 0; i < this.auth.usuarioDB.puntuados.length; i++) {
      const element = this.auth.usuarioDB.puntuados[i];
      if (element.id_receta == this.receta.id) {
        const buttonElement = document.getElementById(`star-${element.stars}`) as HTMLInputElement;
        console.log(`star-${element.stars}`);
        this.recetaStars = element; 
        if (buttonElement){
          buttonElement.checked = true;
        }
        return true;
      }
    }
    return false
  }

  async puntuarReceta(stars:number){
    if (this.verificarUsuario()) { 
      if (stars == this.receta.stars.stars) {
        return;
      }
      this.auth.usuarioDB.puntuados = this.auth.usuarioDB.puntuados != null ? this.auth.usuarioDB.puntuados : []

      
      if (this.recetaStars.id_receta != 0) {
        let i = this.auth.usuarioDB.puntuados.findIndex((x:any) => x.id_receta === this.recetaStars.id_receta)      
        this.auth.usuarioDB.puntuados[i] = {"stars":stars, "id_receta":this.receta.id}
      }
      let data : any = await this.supabase.updateStarsUsuario(this.receta.id, stars, this.auth.usuarioDB.id, this.auth.usuarioDB.puntuados, this.verificarStars())
      this.auth.usuarioDB.puntuados = data[0].puntuados;
      if (this.recetaStars.stars != 0) {
        
        if (stars >  this.receta.stars.stars) {
          console.log("stars >  this.receta.stars.stars")
          console.log(stars)
          console.log( this.receta.stars.stars)
          stars = stars -  this.receta.stars.stars;
          console.log(stars)
        }else if (stars <  this.receta.stars.stars) {
          console.log("stars <  this.receta.stars.stars")
          console.log(stars)
          console.log( this.receta.stars.stars)
          stars = -( this.receta.stars.stars - stars);
        }
      }

      console.log(stars)
      let puntos = this.receta.stars.stars += stars
      console.log(puntos)
      let recetaActualizada : any = await this.supabase.updateStar(this.receta.id, puntos, this.receta.stars.votos+=1);
      this.receta.stars = recetaActualizada[0].stars;
      console.log(this.receta.stars)
    }
  }

  verificarVoto(){
    for (let i = 0; i < this.auth.usuarioDB.puntuados.length; i++) {
      const element = this.auth.usuarioDB.puntuados[i];
      if (element.id_receta == this.receta.id) {
        this.recetaStars = element; 

        break;
      }
    }
    if (this.receta.id) {
      
    }
  }

  verificarUsuario(){
    if (this.auth.usuario) {
      return true
    }
    return false;
  }
}

import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import supabase from '../supabaseClient';
import { Receta } from '../receta';

@Injectable({
  providedIn: 'root'
})

export class SupabaseService {
  supabaseUrl : string = environment.SUPABASE_URL;
  supabaseKey : string = environment.SUPABASE_KEY;
  usuarioDB : any;
  constructor() { }
  /**
   * 
   * @param ordenarPor Atributo por el cual se quiera ordenar
   */
  async getTodasRecetas(ordenarPor:string = "id"){
    let data = (await supabase
      .from('recetas')
      .select('id, name, description, time, likes, stars, imagenes, comments, stars, user_id (name, imagen), created_at')
      ).data
    if (data != null)     
      return data;
    
    return false;
  }

  async getRecetaString(receta: string | number){
    let data = (await supabase
      .from('recetas')
      .select('id, name, description, time, likes, stars, imagenes, comments, stars, user_id (name, imagen), created_at')
      .ilike('name',`%${receta}%`)).data

    if (data != null)  
      return data;

    return false;
  }

  async getRecetaId(receta: number){
    let data = (await supabase
      .from('recetas')
      .select('id, name, description, time, likes, stars, imagenes, comments, stars, user_id (name, imagen), created_at')
      .eq('id',receta)).data

    if (data != null)  
      return data;

    return false;
  }

  async getTodosIngredientes(){
    let data = (await supabase
      .from('ingredientes')
      .select('*')).data
    
    if (data != null)     
      return data;
    
    return false;
  }

  async getIngrediente(ingrediente: string){
    let data = (await supabase
      .from('ingredientes')
      .select('id, name')
      .eq('name', ingrediente)).data

    if (data != null)  
      return data;

    return false;
  }

  async getImagen(receta:number){
    let data = (await supabase
      .from('imagenes')
      .select('url')
      .eq('receta_id', receta)).data

    if (data != null)  
      return data;

    return false;
  }

  async getListaIngredientes(ingredientes:string[]){
    let idIngredientes :number[] = [];

    for (const ingrediente of ingredientes) {
      const res = await this.getIngrediente(ingrediente);
      if (res != false) {
        console.log(res)
        idIngredientes.push(res[0].id);
      }
    }

    if (idIngredientes.length != 0)  
      return idIngredientes;

    return false;
  }

  async getRecetasByIngredientes(ingredientes:string[]){
    let idIngredientes :any = await this.getListaIngredientes(ingredientes);

    const { data, error } = await supabase
      .rpc('get_recipes_by_ingredients', {
        _ingredients: idIngredientes 
      });

    if (error) {
      console.error(error); 
      return false
    }

    return data;
  }

  async getIngredientesDeReceta(receta: number){
    let data = (await supabase
      .from('ing-rec')
      .select('cantidad, ingredient_id (name), recipe_id (name)')
      .eq('recipe_id', receta)).data
    
    if (data != null)     
      return data;
    
    return false;
  }

  async updateLike(receta:number, like:number){
    console.log(receta, like)
    let data = (await supabase
      .from('recetas')
      .update({likes: like})
      .eq('id', receta)
      .select()).data


    console.log(data);
    if (data != null)  
      return data;

    return false;
  }

  async updateStar(receta:number, starsTotales:number, votosTotales:number){
    console.log(receta)
    let data = (await supabase
      .from('recetas')
      .update({stars: {"stars":starsTotales, "votos":votosTotales}})
      .eq('id', receta)
      .select()).data


    console.log(data);
    if (data != null)  
      return data;

    return false;
  }

  async updateComentario(receta:number, comentario:string, user:any, comentariosOld:any[]){
    let data = (await supabase
      .from('recetas')
      .update({comments: [...comentariosOld,{user:user.name, imagen:user.imagen, comentario:comentario}]})
      .eq('id', receta)
      .select()).data


    if (data != null)  
      return data;

    return false;
  }

  async altaUsuario(usuario:any){
    let data = (await supabase
    .from('usuarios')
    .insert([
      { name: usuario.identity_data.full_name, mail: usuario.identity_data.email, imagen:usuario.identity_data.avatar_url},
    ])
    .select()).data

    console.log(data)
    if (data != null)  
      return true;

    return false;
  }

  async getUsuario(mail:string){
    let data = (await supabase
      .from('usuarios')
      .select('*')
      .eq('mail',mail)).data

    if (data != null)  
      return data;

    return false;
  }

  async updateLikesUsuario(receta_id:number, user_id:number, listaLikes:any[], dislike:boolean = false){
    let data : any;
    if(!dislike){
      data = (await supabase
        .from('usuarios')
        .update({likeados: [...listaLikes,receta_id]})
        .eq('id', user_id)
        .select()).data
    }else{
      data = (await supabase
        .from('usuarios')
        .update({likeados: listaLikes})
        .eq('id', user_id)
        .select()).data
    }
        
    console.log(data);
    if (data != null)  
      return data;
    return false;
  }

  async updateSavesUsuario(receta_id:number, user_id:number, listaSaves:any[], unsave:boolean = false){
    let data : any;
    if(!unsave){
      data = (await supabase
        .from('usuarios')
        .update({guardados: [...listaSaves,receta_id]})
        .eq('id', user_id)
        .select()).data
    }else{
      data = (await supabase
        .from('usuarios')
        .update({guardados: listaSaves})
        .eq('id', user_id)
        .select()).data
    }
        
    console.log(data);
    if (data != null)  
      return data;
    return false;
  }

  async updateStarsUsuario(receta_id:number, stars:number, user_id:number, listaStars:any[], reVotar:boolean = false){
    let data : any;
    if(!reVotar){
      data = (await supabase
      .from('usuarios')
      .update({puntuados: [...listaStars,{"stars":stars, "id_receta":receta_id}]})
      .eq('id', user_id)
      .select()).data
    }else{
      data = (await supabase
        .from('usuarios')
        .update({puntuados: listaStars})
        .eq('id', user_id)
        .select()).data
    }
      
    console.log(data);
    if (data != null)  
      return data;
    return false;
  }

  async updatePublisUsuario(receta_id:number, user_id:number, listaPublis:any[]){
    let data : any;
    data = (await supabase
      .from('usuarios')
      .update({publicados: [...listaPublis,receta_id]})
      .eq('id', user_id)
      .select()).data
    
        
    console.log(data);
    if (data != null)  
      return data;
    return false;
  }

  async subirReceta(receta:Receta){
    let recetaNueva : any = await this.altaReceta(receta);
    if (!recetaNueva) {
      return false;
    }
    for await (const item of Object.keys(receta.ingredientes)) {
      let res : any = await this.getIngrediente(item);
      if (res.length == 0) {
        await this.altaIngrediente(item, this.usuarioDB.id);
        res = await this.getIngrediente(item);
      }
      await this.altaRecIng(res[0].id, recetaNueva[0].id, receta.ingredientes[item])
    }
    return recetaNueva;
  }

  async altaReceta(receta:Receta){
    let data = (await supabase
    .from('recetas')
    .insert([
      { name: receta.titulo, description:receta.descripcion , time:receta.tiempo , imagenes:[receta.imagenURL], user_id:this.usuarioDB.id ,created_at:receta.fechaPublicada, updated_at: receta.fechaPublicada},
    ])
    .select()).data

    if (data != null)  
      return data;

    return false;
  }

  async altaIngrediente(nombre:string, user_id:number){
    let data = (await supabase
    .from('ingredientes')
    .insert([
      { name: nombre, user_id:user_id},
    ])
    .select()).data

    if (data != null)  
      return true;

    return false;
  }

  async altaRecIng(ingredient_id:number, recipe_id:number, cantidad:number){
    let data = (await supabase
    .from('ing-rec')
    .insert([
      { ingredient_id:ingredient_id , recipe_id:recipe_id , cantidad:cantidad},
    ])
    .select()).data

    if (data != null)  
      return true;

    return false;
  }

  async bajaReceta(receta_id:number){
    let data = (await supabase
      .from('recetas')
      .delete()
      .eq("id", receta_id))
  
      console.log(receta_id)
      console.log(data);
      if (data != null)  
        return data;
  
      return false;
  }

  async updateReceta(receta:Receta){
    console.log(receta)
    let fechaActualizada :any = new Date().toISOString();
    let data = (await supabase
    .from('recetas')
    .update([
      { name: receta.titulo, description:receta.descripcion , time:receta.tiempo , imagenes:[receta.imagenURL], user_id:this.usuarioDB.id , updated_at: fechaActualizada},
    ])
    .eq('id', receta.id)
    .select()).data

    console.log(data)

    if (data != null)  
      return data;

    return false;
  }

  async actualizarReceta(receta:Receta, ingredientesViejos:any){
    let recetaNueva : any = await this.updateReceta(receta);
    if (!recetaNueva) {
      return false;
    }

    console.log(ingredientesViejos)
    for await (const item of Object.keys(ingredientesViejos)) {
      console.log(item)
      if (!receta.ingredientes[item]) { 
        let res : any = await this.getIngrediente(item);
        await this.bajaIngrediente(res[0].id, recetaNueva[0].id)
      }
    }

    for await (const item of Object.keys(receta.ingredientes)) {
      let res : any = await this.getIngrediente(item);
      if (!ingredientesViejos[item]) { 
        if (res.length == 0) {
          await this.altaIngrediente(item, this.usuarioDB.id);
          res = await this.getIngrediente(item);
        }
        await this.altaRecIng(res[0].id, recetaNueva[0].id, receta.ingredientes[item])
      }
    }
    return recetaNueva;
  }

  async bajaIngrediente(ingredient_id:number, recipe_id:number){
    console.log(ingredient_id)
    console.log(recipe_id)
    let data = (await supabase
      .from('ing-rec')
      .delete()
      .eq("ingredient_id",ingredient_id)
      .eq("recipe_id",recipe_id)).data
  
      console.log(data)
      if (data != null)  
        return true;
  
      return false;
  }
  
}

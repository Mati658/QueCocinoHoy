import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js'
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  supabaseUrl : string = environment.URL;
  supabaseKey : string = environment.SUPABASE_KEY;
  supabase = createClient(this.supabaseUrl, this.supabaseKey);

  constructor() { }
  /**
   * 
   * @param ordenarPor Atributo por el cual se quiera ordenar
   */
  async getTodasRecetas(ordenarPor:string = "id", ascending:boolean = true){
    let data = (await this.supabase
      .from('recetas')
      .select('id, name, description, time, likes, stars, imagenes, comments, user_id (name, imagen)')
      .order(ordenarPor, {ascending: ascending})).data
    
    if (data != null)     
      return data;
    
    return false;
  }

  async getRecetaString(receta: string | number){
    let data = (await this.supabase
      .from('recetas')
      .select('id, name, description, time, likes, stars, imagenes, comments, user_id (name, imagen)')
      .ilike('name',`%${receta}%`)).data

    if (data != null)  
      return data;

    return false;
  }

  async getRecetaId(receta: number){
    let data = (await this.supabase
      .from('recetas')
      .select('id, name, description, time, likes, stars, imagenes, comments, user_id (name, imagen)')
      .eq('id',receta)).data

    if (data != null)  
      return data;

    return false;
  }

  async getTodosIngredientes(){
    let data = (await this.supabase
      .from('ingredientes')
      .select('*')).data
    
    if (data != null)     
      return data;
    
    return false;
  }

  async getIngrediente(ingrediente: string){
    let data = (await this.supabase
      .from('ingredientes')
      .select('id, name')
      .eq('name', ingrediente)).data

    if (data != null)  
      return data;

    return false;
  }

  async getImagen(receta:number){
    let data = (await this.supabase
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

    const { data, error } = await this.supabase
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
    let data = (await this.supabase
      .from('ing-rec')
      .select('cantidad, ingredient_id (name), recipe_id (name)')
      .eq('recipe_id', receta)).data
    
    if (data != null)     
      return data;
    
    return false;
  }

  async updateLike(receta:number, like:number){
    console.log(receta, like++)
    let data = (await this.supabase
      .from('recetas')
      .update({likes: like++})
      .eq('id', receta)
      .select()).data


    console.log(data);
    if (data != null)  
      return data;

    return false;
  }

  async updateComentario(receta:number, comentario:string, user:any, comentariosOld:any[]){
    let data = (await this.supabase
      .from('recetas')
      .update({comments: [...comentariosOld,{user:user.name, imagen:user.imagen, comentario:comentario}]})
      .eq('id', receta)
      .select()).data


    if (data != null)  
      return data;

    return false;
  }
}

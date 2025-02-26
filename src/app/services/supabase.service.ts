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
  
  async traerTodo(){
    let data = (await this.supabase
      .from('ing-rec')
      .select('cantidad, ingredient_id (name), recipe_id (name)')).data
    
    if (data != null)     
      return data;
    
    return false;
  }

  async getReceta(receta: string | number){
    let data = (await this.supabase
      .from('recetas')
      .select('id, name, description')
      .eq(typeof(receta) == 'number' ? 'id' : 'name', receta)).data

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

  async getListaIngredientes(ingredientes:string[]){
    let idIngredientes :number[] = [];

    for (const ingrediente of ingredientes) {
      const res = await this.getIngrediente(ingrediente);
      if (res !== false) {
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
}

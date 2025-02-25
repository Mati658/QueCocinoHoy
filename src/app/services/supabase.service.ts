import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js'
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  supabaseUrl : string = 'https://hhcrvyagvbeczhjaypdb.supabase.co';
  supabaseKey : string = environment.SUPABASE_KEY;
  supabase = createClient(this.supabaseUrl, this.supabaseKey);

  constructor() { 
    this.traerTodo();
    // console.log(this.supabaseKey)
  }
  
  async traerTodo(){
    let data = (await this.supabase.from('ing-rec').select('cantidad, ingredient_id (name), recipe_id (name)')).data
    if (data != null) {
      console.log(data[0])
      
    }
  }

  
}

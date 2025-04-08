import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import supabase from '../supabaseClient';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  supabaseSvc = inject(SupabaseService);
  constructor() { }

  async subirFoto(imagen:Blob){
    const { data, error } = await supabase.storage
      .from('images')
      .upload(`public/${Date.now()}.png`, imagen, {
        upsert: true,
        contentType: 'image/jpeg/jpg/png',
      })
    
    if (error) {
      return false;
    }

    return this.getFoto(data?.path);
  }

  getFoto(path:string|undefined){
    if (path) { 
      const { data } = supabase.storage
      .from('images')
      .getPublicUrl(path);
      
      console.log(data.publicUrl);
      return data.publicUrl;
    }
    return false;
  }

  async deleteFoto(path:string){
    const { data, error } = await supabase.storage
    .from('images')
    .remove([path])
  
    if (error) {
      return false;
    }
    return true;
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class APIsService {
  http = inject(HttpClient);
  api_url = "https://magicloops.dev/api/loop/319c141a-390e-4b31-b159-f00868c3b1a7/run";

  constructor() {}
  /**
   * @param categoria 'food', 'dessert', 'smoothie'
   * @param dieta 'vegan' or 'non-vegan'
   */
  ObtenerReceta(categoria: 'food' | 'dessert' | 'smoothie', dieta: 'vegan' | 'non-vegan', celiaco:boolean){
  // const url = ``;
  const peticion = this.http.post(this.api_url,{
    responseType: 'json',
    body: JSON.stringify({ "category": categoria, "diet": dieta, "celiac": celiaco })
  })

  return peticion;
  }

}

import { Component, inject } from '@angular/core';
import { APIsService } from '../services/apis.service';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  recetaApi = inject(APIsService);
  supabase = inject(SupabaseService);

  constructor(){
    this.filtrarRecetas(['papas', 'cebollas','ajo']);
    this.supabase.getIngredientesDeReceta(165).then((res:any)=>{
      console.log(res);
      res.forEach((element:any) => {
        console.log(element.ingredient_id.name)
      });
    });
    
    // this.supabase.traerTodo().then(res=>{
    //   console.log(res);
    // });
  }

  async filtrarRecetas(ingredientes:string[]){
    this.supabase.getRecetasByIngredientes(ingredientes).then(async res=>{
      let ing = res
      let recetas : any = []

      for (const element of ing) {
        let data : any = {};
        let receta : any = await this.supabase.getReceta(element.recipe_id);
        data.nombre = receta[0].name;
        data.description = receta[0].description;
        
        let ingredientes : any = await this.supabase.getIngredientesDeReceta(element.recipe_id);
          
        for (let i = 0; i < ingredientes.length; i++) {
          const element = ingredientes[i];
          if(!data.ingredientes)
            data.ingredientes = [{ing:element.ingredient_id.name, cant:element.cantidad}];
          else
            data.ingredientes = [...data.ingredientes,{ing:element.ingredient_id.name, cant:element.cantidad}]
        }
        recetas.push(data)
      }
      console.log(recetas)
    });
  }
}

import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit{
  supabase = inject(SupabaseService);
  recetas!: any
  recetasMostrar: any[] = [];
  recetasLimit = 3;
  @ViewChild('observer') observer!: ElementRef;

  constructor(){}

  async ngAfterViewInit() {
    this.recetas = await this.supabase.getTodasRecetas();
    this.cargarRecetas();
    this.setupIntersectionObserver();
  }
  cargarRecetas() {
    console.log(this.recetas)
    const nuevasRecetas = this.recetas.slice(this.recetasMostrar.length, this.recetasMostrar.length + this.recetasLimit);
    this.recetasMostrar = [...this.recetasMostrar, ...nuevasRecetas];
    console.log(this.recetasMostrar)
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        this.cargarRecetas();
      }
    });

    observer.observe(this.observer.nativeElement);
  }


  async filtrarRecetas(ingredientes:string[]){
    this.supabase.getRecetasByIngredientes(ingredientes).then(async res=>{
      let ing = res
      let recetas : any = []

      for (const element of ing) {
        let data : any = {};
        let receta : any = await this.supabase.getReceta(element.recipe_id);
        let ingredientes : any = await this.supabase.getIngredientesDeReceta(element.recipe_id);
        
        data.nombre = receta[0].name;
        data.description = receta[0].description;
        data.time = receta[0].time;
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

  getImagen(id_receta:number){
    // let imagen : string = "";
    // this.supabase.getImagen(id_receta).then((res:any)=>{
    //   imagen = (res[0].url);
    // })

    // if (imagen != "") {
    //   return imagen;
    // }

    //EL LINK MUY LARGO ROMPE LA PAGINA

    return false;

  }
}

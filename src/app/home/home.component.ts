import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { RecetaComponent } from '../receta/receta.component';
import { ClickOutsideDirective } from '../directives/click-outside.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RecetaComponent, ClickOutsideDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit{
  supabase = inject(SupabaseService);
  recetas!: any
  recetasMostrar: any[] = [];
  recetasLimit = 6;
  imagenPrueba! : string | boolean;
  @ViewChild('observer') observer!: ElementRef;
  recetaSeleccionada : any;
  flagReceta : boolean = false;
  flagAnim : boolean = false;
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

  SeleccionarReceta(receta:any){
    this.recetaSeleccionada = receta;
    this.flagReceta = true;

    const buttonElement = document.getElementById("fondo");
    if (buttonElement) 
      // buttonElement.style.overflowY = "hidden";
    
    console.log(receta)
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
        data.imagen = receta[0].imagenes;
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

  convertirJson(json:string){
    let a : any= {"img": ""};
    if (json) 
      return JSON.parse(json);
    
    return a;
  }

  recibirFlag(flag : any){
    this.flagAnim = !flag
    setTimeout(async () => {
      this.flagReceta = !flag;
    this.flagAnim = true;
    }, 500);
    console.log(flag)
  }

  
}

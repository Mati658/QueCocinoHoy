import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { RecetaComponent } from '../receta/receta.component';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RecetaComponent, ClickOutsideDirective, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit{
  supabase = inject(SupabaseService);
  recetas!: any
  recetasMostrar: any[] = [];
  recetaSeleccionada : any;
  recetasLimit = 6;
  busqueda : string = "";
  imagenPrueba! : string | boolean;
  flagReceta : boolean = false;
  flagAnim : boolean = false;
  @ViewChild('observer') observer!: ElementRef;
  
  
  constructor(){}

  async ngAfterViewInit() {
    this.recetas = await this.supabase.getTodasRecetas();
    this.cargarRecetas();
    this.setupIntersectionObserver();

    let a  = await this.supabase.getReceta("Ensalada polluda");
    console.log(a)
  }

  cargarRecetas() {
    console.log(this.recetas)
    const nuevasRecetas = this.recetas.slice(this.recetasMostrar.length, this.recetasMostrar.length + this.recetasLimit);
    this.recetasMostrar = [...this.recetasMostrar, ...nuevasRecetas];
    console.log(this.recetasMostrar)
  }

  async ordernarRecetas(atributo:string, ascending:boolean = true){
    this.recetas = await this.supabase.getTodasRecetas(atributo, ascending);
    this.recetasMostrar = [];
    this.cargarRecetas();
  }

  async ordernarRecetasRandom(){
    for (let i = this.recetas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); 
      [this.recetas[i], this.recetas[j]] = [this.recetas[j], this.recetas[i]]; 
    }
    this.recetasMostrar = [];
    this.cargarRecetas();
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
  }

  async likearReceta(receta:any){
    let recetaActualizada : any = await this.supabase.updateLike(receta.id, receta.likes);
    receta.likes = recetaActualizada[0].likes;
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

  mostrarIngredientes(){
    const buttonElement = document.getElementById("ingredientes");
    if (buttonElement)
      buttonElement.style.height = buttonElement.style.height != "50px" ? '50px' : 'auto';   
  }

  async buscar(event :  KeyboardEvent){
    if (event.key === 'Enter') {
      event.preventDefault(); // Evita el salto de línea
      this.recetas = await this.supabase.getReceta(this.busqueda);
      this.recetasMostrar = [];
      this.cargarRecetas();
      this.busqueda = "";
    }
  }

}

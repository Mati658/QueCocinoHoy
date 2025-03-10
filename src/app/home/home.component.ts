import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { RecetaComponent } from '../receta/receta.component';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../pipes/filter.pipe';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RecetaComponent, ClickOutsideDirective, FormsModule, FilterPipe, LoginComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit{
  supabase = inject(SupabaseService);
  auth = inject(AuthService);
  recetas: any
  recetasTotales : any;
  ingredientesTotales : any;
  recetasMostrar: any[] = [];
  ingredientes : string[] = [];
  recetaSeleccionada : any;
  recetasLimit = 6;
  busqueda : string = "";
  ingrediente : string = "";
  imagenPrueba! : string | boolean;
  flagAnim : boolean = false;
  flagLogin : boolean = false
  flagReceta : boolean = false;
  flagRecetaCard : boolean = false;
  flagIngrediente : boolean = true;
  versionActualEliminar : number = 0;
  versionActualAniadir : number = 0;
  @ViewChild('observer') observer!: ElementRef;
  
  
  constructor(){}

  async ngAfterViewInit() {
    this.recetas = await this.supabase.getTodasRecetas();
    this.recetasTotales = this.recetas
    this.ingredientesTotales = await this.supabase.getTodosIngredientes();
    console.log(this.ingredientesTotales)
    this.cargarRecetas();
    this.setupIntersectionObserver();
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
    await this.supabase.getRecetasByIngredientes(ingredientes).then(async res=>{
      console.log(res)
      if (res == false) {
        this.recetas = []
        return
      }
      let ing = res
      let recetas : any = []
      
      for (const element of ing) {
        let data : any = {};
        let receta : any = await this.supabase.getRecetaId(element.recipe_id);
        data = receta[0]

        //Obtener los ingredientes de cada receta
        // let ingredientes : any = await this.supabase.getIngredientesDeReceta(element.recipe_id);
        // for (let i = 0; i < ingredientes.length; i++) {
        //   const element = ingredientes[i];
        //   if(!data.ingredientes)
        //     data.ingredientes = [{ing:element.ingredient_id.name, cant:element.cantidad}];
        //   else
        //     data.ingredientes = [...data.ingredientes,{ing:element.ingredient_id.name, cant:element.cantidad}];
        // }


        recetas.push(data)
      }
      this.recetas = recetas;
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
    if (buttonElement){
      buttonElement.style.height = buttonElement.style.height != "40px" ? '40px' : 'auto';  
      this.flagIngrediente = !this.flagIngrediente;
    }

  }

  async buscar(receta : string = "", event? :  KeyboardEvent){
    console.log(receta);
    if (event?.key == 'Enter' || receta != "") {
      event?.preventDefault(); // Evita el salto de línea
      this.recetas = await this.supabase.getRecetaString(receta != "" ? receta : this.busqueda);
      this.recetasMostrar = [];
      this.cargarRecetas();
      this.busqueda = "";
      this.ingredientes = [];
    }
  }

  async aniadirIngrediente(ingrediente : string){
    this.versionActualAniadir++; 
    let version = this.versionActualAniadir;

    this.ingredientes.push(ingrediente); 

    this.ingrediente = "";
    await this.filtrarRecetas(this.ingredientes)

    if (version !== this.versionActualAniadir) return;

    console.log(this.recetas)
    this.recetasMostrar = [];
    this.cargarRecetas();

    
  }

  async eliminarIngrediente(ingrediente:string){
    this.versionActualEliminar++; 
    let version = this.versionActualEliminar;

    let i = this.ingredientes.findIndex((x) => x === ingrediente)
    this.ingredientes.splice(i,1)
  
    if (this.ingredientes.length == 0) {
      this.recetas = await this.supabase.getTodasRecetas();
      if (version !== this.versionActualEliminar) return;
      this.recetasMostrar = [];
      this.cargarRecetas();
      return 
    }
    await this.filtrarRecetas(this.ingredientes)
    if (version !== this.versionActualEliminar) return;
    console.log(this.recetas)
    this.recetasMostrar = [];
    this.cargarRecetas();
  }

}

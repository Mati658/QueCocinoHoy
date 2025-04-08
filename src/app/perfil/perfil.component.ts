import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { RecetaComponent } from '../receta/receta.component';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { PublicacionComponent } from '../publicacion/publicacion.component';
import Swal from 'sweetalert2';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RecetaComponent, ClickOutsideDirective, PublicacionComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements AfterViewInit {
  auth = inject(AuthService);
  supabase = inject(SupabaseService);
  storage = inject(StorageService);
  recetasTotales: any[] = [];
  recetasMostrar: any[] = [];
  recetasLimit = 6;
  recetaSeleccionada : any;
  flagReceta : boolean = false;
  flagAnim : boolean = false;
  flagPublicacion : boolean = false;
  @ViewChild('observer') observer!: ElementRef;


  constructor(){
    console.log(this.auth.usuarioDB)
  }
  async ngAfterViewInit() {
    this.getListaRecetas('publicados')  //!!!!!!!!!!!!!ACOMODAR PARA QUE SEAN LOS PUBLICADOS!!!!!!!!!!!!!!!!
    this.setupIntersectionObserver();
  }

  async getListaRecetas(atributo:string){
    this.recetasTotales = [];
    console.log(this.auth.usuarioDB)
    for await (const item of this.auth.usuarioDB[atributo] != null ? this.auth.usuarioDB[atributo] : []) {
      let receta : any= await this.supabase.getRecetaId(item)
      this.recetasTotales.push(...receta);
    }
    this.recetasMostrar = [];
    this.cargarRecetas();
  }

  async cargarRecetas() {
    console.log(this.recetasTotales);
    const nuevasRecetas = this.recetasTotales.slice(this.recetasMostrar.length, this.recetasMostrar.length + this.recetasLimit);
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
    this.auth.flagRecetaPerfil = true;
    this.recetaSeleccionada = receta;
    this.flagReceta = true;
  }

  getStars(stars:number, votos:number, id:string = '0'){
    if (votos == 0)
      return 0

    let star = Math.round(stars / votos); 
    const buttonElement = document.getElementById(id+(star)) as HTMLInputElement;
    if (buttonElement){
      buttonElement.checked = true;  
    }
    return star;
  }

  resetStars(id:string){
    for (let i = 0; i < 5; i++) {
      const buttonElement = document.getElementById(id+(i+1)) as HTMLInputElement;
      if (buttonElement)
        buttonElement.checked = false;  
    }
  }

  recibirFlag(flag : any, elemento : string){
    this.flagAnim = !flag
    setTimeout(async () => {

      switch (elemento) {
        case 'receta':
          this.flagReceta = !flag; 
          this.auth.flagRecetaPerfil = !flag    
          break;
        case 'publicacion':
          this.flagPublicacion = !flag;
          this.auth.flagRecetaPerfil = !flag    
          break;
      }

      
      this.flagAnim = true;
    }, 500);
  }

  eliminarReceta(receta:any){
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertirlo!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Eliminar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.storage.deleteFoto(receta.imagenes[0].split("images/")[1])
        await this.supabase.bajaReceta(receta.id)
        Swal.fire({
          title: "¡Eliminado!",
          text: "La receta fue eliminada.",
          icon: "success"
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  }

  editReceta(receta:any){
    this.recetaSeleccionada = receta;
    this.recibirFlag(false, 'publicacion');
  }

  signOut(){
    this.auth.signOut();
  }
}

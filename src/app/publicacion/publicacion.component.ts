import { AfterViewInit, Component, inject, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../pipes/filter.pipe';
import { FormsModule } from '@angular/forms';
import { Receta } from '../receta';
import Swal from 'sweetalert2';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [CommonModule, FilterPipe, FormsModule],
  templateUrl: './publicacion.component.html',
  styleUrl: './publicacion.component.scss'
})
export class PublicacionComponent implements AfterViewInit{
  auth = inject(AuthService);
  supabase = inject(SupabaseService);
  storage = inject(StorageService);
  imagenURL! : string;
  titulo : string = "";
  descripcion : string = "";
  time : number = 0;
  imagen! : any;
  ingredientes : string[] = [];
  ingredientesViejos : { [ingrediente: string]: number } = {};
  ingredientesReceta : string[] = [];
  ingrediente : string = "";
  ingredientesTotales : any;
  cantidades: { [ingrediente: string]: number } = {};
  receta! : Receta;
  recetaViejaId : number = 0
  recetRecibidaFlag : boolean = false;
  flagImagen : boolean = false;

  @Input() set recetaRecibida(receta:any){
    if(receta){
      this.recetRecibidaFlag = true;
      this.receta = receta;
      this.recetaViejaId = receta.id;
      this.titulo = receta.name;
      this.descripcion = receta.description;
      this.time = receta.time;
      console.log(receta);
      this.imagenURL = receta.imagenes[0];
      this.supabase.getIngredientesDeReceta(receta.id).then(async(res:any)=>{
        for await (const item of res) {
          this.ingredientes.push(item.ingredient_id.name);
          this.setCantidad(item.cantidad, item.ingredient_id.name);
        }
        this.ingredientesViejos = { ...this.cantidades };
        console.log(this.cantidades);
        console.log(this.ingredientesViejos)
      })
    }
  };

  async ngAfterViewInit() {
    this.ingredientesTotales = await this.supabase.getTodosIngredientes();
  }

  obtenerImagen($event : any){
    this.flagImagen = true;
    //---Para SUBIR la imagen---
    let file : any = $event.target.files[0];
    const imagen = new Blob([file],{
      type:file.type
    });

    this.imagen = imagen;

    //---Para MOSTRAR la imagen---
    const fileURL = $event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.imagenURL = reader.result as string;
    };

    reader.readAsDataURL(fileURL);
  }

  async aniadirIngrediente(ingrediente : string, event? :  KeyboardEvent){
    if ((event?.key == 'Enter' && ingrediente != "") || (event == undefined && ingrediente != "")) {
      this.ingredientes.push(ingrediente); 
      this.setCantidad(1, ingrediente)
      this.ingrediente = "";
    }
  }

  async eliminarIngrediente(ingrediente:string){
    let i = this.ingredientes.findIndex((x) => x === ingrediente)
    this.ingredientes.splice(i,1)
    this.deleteIngrediente(ingrediente)
  }

  setCantidad(valor :number, ingrediente:string){
    this.cantidades[ingrediente] = valor;
    console.log(this.cantidades); // Ver los valores actualizados
  }

  deleteIngrediente(ingrediente: string) {
    delete this.cantidades[ingrediente];
    console.log(this.cantidades); // Ver valores actualizados
  }

  async subirReceta(){
    if(!(this.titulo && this.time && this.imagenURL && this.descripcion && Object.keys(this.cantidades).length > 0)){
      return this.toastError('Complete todos los campos!');
    }

    const fechaCreacion = new Date().toISOString();
    let url : string | boolean = await this.storage.subirFoto(this.imagen);
    if (url != false) { 
      this.receta = new Receta(this.titulo , this.time, url, this.descripcion, this.cantidades, this.auth.usuario.identity_data.email, fechaCreacion)
      console.log(this.receta);
      let receta :any= await this.supabase.subirReceta(this.receta);
      if (!receta) {
        return this.toastError('Error al publicar la receta!');
      }
      await this.PublicarReceta(receta[0].id);
      Swal.fire({
        title: "¡Publicado!",
        text: "La receta fue publicada.",
        icon: "success"
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }
    return this.toastError('Error al publicar la receta!');
  }

  async updateReceta(){
    if(!(this.titulo && this.time && this.imagenURL && this.descripcion && Object.keys(this.cantidades).length > 0)){
      return this.toastError('Complete todos los campos!');
    }
    
    let url = this.flagImagen ? await this.storage.subirFoto(this.imagen) : this.imagenURL;
    if (url != false) { 
      this.receta = new Receta(this.titulo , this.time, url, this.descripcion, this.cantidades, this.auth.usuario.identity_data.email, this.receta.fechaPublicada, this.recetaViejaId)
      console.log(this.receta);
      console.log(this.ingredientesViejos)
      let receta :any= await this.supabase.actualizarReceta(this.receta, this.ingredientesViejos);
      if (receta.length == 0 || !receta) {
        return this.toastError('Error al publicar la receta!');
      }
      Swal.fire({
        title: "¡Receta actualizada!",
        text: "La receta fue actualizada.",
        icon: "success"
      });
      setTimeout(() => {
        // window.location.reload();
      }, 1000);
      return;
    }
    return this.toastError('Error al publicar la receta!');
  }

  async PublicarReceta(receta_id:number){
    if (this.verificarUsuario()) { 
      this.auth.usuarioDB.publicados = this.auth.usuarioDB.publicados != null ? this.auth.usuarioDB.publicados : []
      let data : any = await this.supabase.updatePublisUsuario(receta_id, this.auth.usuarioDB.id, this.auth.usuarioDB.publicados)
      this.auth.usuarioDB.publicados = data[0].publicados;
    }
  }

  toastError(mensaje:string){
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: "error",
      title: mensaje,
    });
  }

  verificarUsuario(){
    if (this.auth.usuario) {
      return true
    }
    return false;
  }
}

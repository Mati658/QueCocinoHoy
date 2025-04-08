export class Receta{
    id : number;
    titulo : string;
    tiempo : number;
    imagenURL : string;
    descripcion : string;
    ingredientes : { [ingrediente: string]: number };
    usuarioMail : string;
    fechaPublicada : Date;

    constructor(titulo:string, tiempo:number, imagenURL:string, descripcion:string, ingredientes: { [ingrediente:string]:number}, usuarioMail:string, fechaPublicada:any,id:number=0){
        this.id = id;
        this.titulo = titulo;
        this.tiempo = tiempo;
        this.imagenURL = imagenURL;
        this.descripcion = descripcion;
        this.ingredientes = ingredientes;
        this.usuarioMail = usuarioMail;
        this.fechaPublicada = fechaPublicada;
    }


}
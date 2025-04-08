import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getTime',
  standalone: true
})
export class GetTimePipe implements PipeTransform {
  transform(fecha: string): string {
    const fechaReceta = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaReceta.getTime(); // Diferencia en milisegundos
    
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    console.log(fecha)
    console.log(fechaReceta)
    console.log(ahora)
    console.log(diferencia)
    
    if (dias > 0) return `Hace ${dias} día(s)`;
    if (horas > 0) return `Hace ${horas} hora(s)`;
    if (minutos > 0) return `Hace ${minutos} minuto(s)`;
    return `Hace ${segundos} segundo(s)`;
  }
}

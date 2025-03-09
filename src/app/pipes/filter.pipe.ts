import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], filtrar: string): any[] {

    
    if (!items) return [];
    if (!filtrar) return items;
    
    const normalizeText = (text: string) => 
      text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); //para eliminar las tildes

    const terms1 = filtrar ? normalizeText(filtrar).split(' ') : [];

    return items.filter(item => {
      console.log(item)
      const normalizedItemName = normalizeText(item.name);
      return terms1.some(term => normalizedItemName.includes(term));
    });
  }
}

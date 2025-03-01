import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: '', loadComponent: () =>
            import("./home/home.component").then(
                (c) => c.HomeComponent
            )
    },
    {
        path: 'receta', loadComponent: () =>
            import("./receta/receta.component").then(
                (c) => c.RecetaComponent
            )
    },
];

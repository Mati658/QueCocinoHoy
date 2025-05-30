import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: '', loadComponent: () =>
            import("./home/home.component").then(
                (c) => c.HomeComponent
            )
    },
    {
        path: '**', loadComponent: () =>
            import("./error/error.component").then(
                (c) => c.ErrorComponent
            )
    }
];

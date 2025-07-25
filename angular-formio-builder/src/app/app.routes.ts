import { Routes } from '@angular/router';
import { FormBuilderComponent } from './form-builder/form-builder';
import { MainPageComponent } from './components/main-page/main-page';
import { FormViewerComponent } from './components/form-viewer/form-viewer';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'form-builder', component: FormBuilderComponent },
  { path: 'form-builder/:id', component: FormBuilderComponent },
  { path: 'form-viewer/:id', component: FormViewerComponent },
  { path: '**', redirectTo: '' }
];

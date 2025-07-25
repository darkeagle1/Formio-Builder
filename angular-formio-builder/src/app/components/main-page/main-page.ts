import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormApiService, FormItem } from '../../services/form-api.service';

@Component({
  selector: 'app-main-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './main-page.html',
  styleUrls: ['./main-page.scss']
})
export class MainPageComponent {
  forms: FormItem[] = [];
  showFormsList = false;
  showEditModal = false;
  selectedFormId = '';
  
  constructor(
    private router: Router,
    private formApiService: FormApiService
  ) {}

  // Crear - Navigate to form builder to create new form
  onCrear() {
    this.router.navigate(['/form-builder']);
  }

  // Listar - Fetch and display all forms using GET
  onListar() {
    this.formApiService.getAllForms().subscribe({
      next: (apiResponse) => {
        console.log('API returned forms:', apiResponse);
        console.log('Number of forms from API:', apiResponse.length);
        
        // La API ya devuelve la estructura correcta, no necesitamos transformar
        this.forms = apiResponse;
        console.log('Forms from API:', this.forms);
        
        this.showFormsList = true;
      },
      error: (error) => {
        console.error('Error fetching forms:', error);
        // For demo purposes, show mock data if API fails
        this.forms = [
          {
            id: '1',
            title: 'Formulario de Contacto',
            components: [],
            createdAt: '2024-01-15T00:00:00Z'
          },
          {
            id: '2',
            title: 'Formulario de Registro',
            components: [],
            createdAt: '2024-01-20T00:00:00Z'
          }
        ];
        this.showFormsList = true;
      }
    });
  }

  // Editar - Show edit modal to select a form to edit
  onEditar() {
    // First fetch the forms list
    this.formApiService.getAllForms().subscribe({
      next: (apiResponse) => {
        // La API ya devuelve la estructura correcta
        this.forms = apiResponse;
        this.showEditModal = true;
      },
      error: (error) => {
        console.error('Error fetching forms for editing:', error);
        // For demo purposes, show mock data if API fails
        this.forms = [
          {
            id: '1',
            title: 'Formulario de Contacto',
            components: [],
            createdAt: '2024-01-15T00:00:00Z'
          },
          {
            id: '2',
            title: 'Formulario de Registro',
            components: [],
            createdAt: '2024-01-20T00:00:00Z'
          }
        ];
        this.showEditModal = true;
      }
    });
  }

  // Navigate to form viewer
  viewForm(formId: string): void {
    this.router.navigate(['/form-viewer', formId]);
  }

  // Navigate to form builder for editing
  editForm(formId: string): void {
    this.closeEditModal();
    this.router.navigate(['/form-builder', formId]);
  }

  // Close forms list modal
  closeFormsList(): void {
    this.showFormsList = false;
  }

  // Close edit modal
  closeEditModal(): void {
    this.showEditModal = false;
  }

  // Delete form (bonus functionality)
  deleteForm(formId: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este formulario?')) {
      this.formApiService.deleteForm(formId).subscribe({
        next: () => {
          this.forms = this.forms.filter(form => form.id !== formId);
          console.log('Form deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting form:', error);
        }
      });
    }
  }
}

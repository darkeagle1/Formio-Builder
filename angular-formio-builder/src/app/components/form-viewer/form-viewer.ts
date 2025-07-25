import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormApiService, FormItem } from '../../services/form-api.service';
import { FormSchema, FormField } from '../../services/form-builder';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-form-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-viewer.html',
  styleUrls: ['./form-viewer.scss']
})
export class FormViewerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  formItem: FormItem | null = null;
  formSchema: FormSchema = { title: '', fields: [] };
  formData: any = {};
  showPreview = true;
  showJson = false;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formApiService: FormApiService
  ) {}

  // Generate mocked default value based on field type (same as FormBuilderService)
  private generateMockedDefaultValue(fieldType: string): any {
    switch (fieldType) {
      case 'textfield':
        return 'Texto de ejemplo';
      case 'textarea':
        return 'Este es un texto de área de ejemplo con múltiples líneas.';
      case 'number':
        return 42;
      case 'email':
        return 'usuario@ejemplo.com';
      case 'password':
        return 'password123';
      case 'date':
        return '2024-01-15';
      case 'checkbox':
        return true;
      case 'radio':
        return 'opcion1';
      case 'select':
        return 'valor1';
      case 'file':
        return 'archivo_ejemplo.pdf';
      default:
        return 'Valor por defecto';
    }
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const formId = params['id'];
        if (formId) {
          this.loadForm(formId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadForm(formId: string): void {
    console.log('Loading form with ID:', formId);
    this.isLoading = true;
    this.error = null;
    
    this.formApiService.getFormById(formId).subscribe({
      next: (apiResponse: any) => {
        console.log('Form loaded successfully:', apiResponse);
        
        // Transform API response to expected format
        // API returns: { id, title, components, createdAt }
        // Template expects: { formInfo: { id, title, createdAt }, schema: { fields } }
        
        // Transform components and add defaultValue if missing
        // Respetamos la estructura original de la API y solo agregamos defaultValue si no existe
        const transformedFields = (apiResponse.components || []).map((component: any) => {
          // Solo agregamos defaultValue si no existe, manteniendo la estructura original
          if (!component.defaultValue) {
            return {
              ...component,
              defaultValue: this.generateMockedDefaultValue(component.type)
            };
          }
          return component;
        });
        
        // Trabajar directamente con la estructura de la API
        this.formItem = apiResponse;
        
        // Convertir components a fields para el schema interno
        this.formSchema = {
          title: apiResponse.title,
          fields: this.convertComponentsToFields(transformedFields)
        };
        
        // Initialize empty form data - only capture when user actually interacts
        this.formData = {};
        
        console.log('=== FORM VIEWER DEBUG ===');
        console.log('API Response:', apiResponse);
        console.log('Transformed fields:', transformedFields);
        console.log('Form schema:', this.formSchema);
        console.log('Initial formData (should be empty):', this.formData);
        console.log('=========================');
        
        // this.initializeFormData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading form:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        
        this.error = `Error al cargar el formulario con ID: ${formId}. Status: ${error.status}`;
        this.isLoading = false;
      }
    });
  }

  private initializeFormData(): void {
    this.formData = {};
    this.formSchema.fields.forEach(field => {
      this.formData[field.key] = field.defaultValue || '';
    });
  }

  onFieldValueChange(fieldKey: string, value: any): void {
    // Usar key como identificador para actualizar los datos del formulario
    this.formData[fieldKey] = value;
  }

  toggleView(view: 'preview' | 'json'): void {
    this.showPreview = view === 'preview';
    this.showJson = view === 'json';
  }

  getFormDataJson(): string {
    // Devolver la misma estructura que usa la API
    const formData = {
      id: this.formItem?.id,
      title: this.formItem?.title,
      components: this.formItem?.components || [],
      createdAt: this.formItem?.createdAt,
      // Opcionalmente incluir los datos capturados
      capturedData: this.formData
    };
    return JSON.stringify(formData, null, 2);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  editForm(): void {
    if (this.formItem && this.formItem.id) {
      this.router.navigate(['/form-builder', this.formItem.id]);
    }
  }

  copyToClipboard(): void {
    const jsonData = this.getFormDataJson();
    navigator.clipboard.writeText(jsonData).then(() => {
      alert('JSON copiado al portapapeles');
    }).catch(err => {
      console.error('Error al copiar al portapapeles:', err);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = jsonData;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('JSON copiado al portapapeles');
    });
  }

  // Convert API components structure to internal fields structure
  private convertComponentsToFields(components: any[]): FormField[] {
    return components.map((component, index) => ({
      key: component.key, // Usar key como identificador principal
      id: component.key,  // Mantener id para compatibilidad
      type: component.type,
      label: component.label,
      placeholder: component.placeholder || '',
      required: component.validate?.required || false,
      position: index,
      // Extract captured values from the API response
      defaultValue: component.defaultValue || component.value || ''
    }));
  }
}

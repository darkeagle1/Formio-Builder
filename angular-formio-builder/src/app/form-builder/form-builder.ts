import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormBuilderService, FormField, FormSchema } from '../services/form-builder';
import { FormApiService } from '../services/form-api.service';
import { FieldPaletteComponent } from '../components/field-palette/field-palette';
import { FormPreviewComponent } from '../components/form-preview/form-preview';
import { FieldConfigComponent } from '../components/field-config/field-config';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-form-builder',
  imports: [
    CommonModule,
    CdkDropList,
    CdkDrag,
    FieldPaletteComponent,
    FormPreviewComponent,
    FieldConfigComponent
  ],
  templateUrl: './form-builder.html',
  styleUrls: ['./form-builder.scss']
})
export class FormBuilderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  formSchema: FormSchema = { title: 'Nuevo Formulario', fields: [] };
  selectedField: FormField | null = null;
  showPreview = false;
  showJson = false;
  generatedJson = '';
  editingFormId: string | null = null;
  isEditMode = false;
  formId: string | null = null;
  showSuccessModal = false;
  successMessage = '';

  constructor(
    private formBuilderService: FormBuilderService,
    private formApiService: FormApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if we have an ID parameter for editing
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const formId = params['id'];
        if (formId) {
          this.editingFormId = formId;
          this.isEditMode = true;
          this.loadFormForEditing(formId);
        } else {
          // Crear nuevo formulario - limpiar todo el estado
          this.clearFormBuilder();
        }
      });

    this.formBuilderService.formSchema$
      .pipe(takeUntil(this.destroy$))
      .subscribe(schema => {
        this.formSchema = schema;
      });

    this.formBuilderService.selectedField$
      .pipe(takeUntil(this.destroy$))
      .subscribe(field => {
        this.selectedField = field;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDrop(event: CdkDragDrop<FormField[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within the same container
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.formBuilderService.reorderFields(event.previousIndex, event.currentIndex);
    } else {
      // Adding new field from palette
      // Use the drag data instead of container data
      const fieldType = event.item.data;
      if (typeof fieldType === 'string') {
        this.formBuilderService.addField(fieldType);
      }
    }
  }

  onFieldSelect(field: FormField): void {
    this.formBuilderService.selectField(field);
  }

  onFieldDelete(fieldId: string): void {
    this.formBuilderService.removeField(fieldId);
    if (this.selectedField && this.selectedField.id === fieldId) {
      this.formBuilderService.selectField(null);
    }
  }

  onTitleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.formBuilderService.updateFormTitle(target.value);
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
    if (this.showPreview) {
      this.showJson = false;
    }
  }

  toggleJson(): void {
    this.showJson = !this.showJson;
    if (this.showJson) {
      this.showPreview = false;
      this.generateJson();
    }
  }

  generateJson(): void {
    const formioSchema = this.formBuilderService.generateFormioSchema();
    this.generatedJson = JSON.stringify(formioSchema, null, 2);
  }

  copyJsonToClipboard(): void {
    navigator.clipboard.writeText(this.generatedJson).then(() => {
      // Could add a toast notification here
      console.log('JSON copiado al portapapeles');
    });
  }

  clearForm(): void {
    if (confirm('¿Estás seguro de que quieres limpiar el formulario?')) {
      this.formBuilderService = new FormBuilderService();
      this.ngOnInit();
    }
  }

  trackByFieldId(index: number, field: FormField): string {
    return field.key; // Usar key en lugar de id para mantener consistencia
  }

  getFieldTypeLabel(fieldType: string): string {
    const labels: { [key: string]: string } = {
      'textfield': 'Texto',
      'textarea': 'Área de Texto',
      'number': 'Número',
      'datetime': 'Fecha',
      'select': 'Lista',
      'checkbox': 'Checkbox',
      'radio': 'Radio',
      'button': 'Botón'
    };
    return labels[fieldType] || 'Campo';
  }

  // Load existing form for editing
  loadFormForEditing(formId: string): void {
    this.formApiService.getFormById(formId).subscribe({
      next: (formItem) => {
        // Convertir components de la API a FormFields para el form builder
        const formSchema = {
          title: formItem.title,
          fields: formItem.components.map((component, index) => ({
            key: component.key,
            id: component.key, // Para compatibilidad
            type: component.type,
            label: component.label,
            placeholder: component.placeholder || '',
            required: component.validate?.required || false,
            position: index,
            defaultValue: this.formBuilderService.generateMockedDefaultValue(component.type)
          }))
        };
        
        // Load the form schema into the form builder service
        this.formBuilderService.loadFormSchema(formSchema);
        console.log('Form loaded for editing:', formItem.title);
      },
      error: (error) => {
        console.error('Error loading form for editing:', error);
        // Could show a toast notification or redirect back to main page
        this.router.navigate(['/']);
      }
    });
  }

  // Save form (create new or update existing)
  saveForm(): void {
    const currentSchema = this.formBuilderService.getFormSchema();
    
    // Validate that form has a title
    if (!currentSchema.title || currentSchema.title.trim() === '') {
      alert('Por favor, ingresa un título para el formulario');
      return;
    }
    
    // Validate that form has at least one field
    if (!currentSchema.fields || currentSchema.fields.length === 0) {
      alert('Por favor, agrega al menos un campo al formulario usando drag & drop');
      return;
    }
    
    // Prepare data in the format expected by the API
    // Transform fields to components format that the API expects
    const components = currentSchema.fields.map(field => ({
      key: field.key, // Usar key en lugar de id para mantener consistencia
      type: field.type,
      label: field.label,
      placeholder: field.placeholder || '',
      defaultValue: field.defaultValue || 'Valor por defecto',
      validate: {
        required: field.required || false
      }
    }));
    
    const formData = {
      title: currentSchema.title,
      components: components
    };
    
    console.log('Sending form data to API:', formData);
    
    if (this.isEditMode && this.editingFormId) {
      // Update existing form using PUT
      this.formApiService.updateForm(this.editingFormId, formData).subscribe({
        next: (response) => {
          console.log('Form updated successfully:', response);
          this.showSuccessMessage('¡Formulario actualizado exitosamente!');
        },
        error: (error) => {
          console.error('Error updating form:', error);
          alert('Error al actualizar el formulario. Revisa la consola para más detalles.');
        }
      });
    } else {
      // Create new form using POST to /api/forms/create
      this.formApiService.createForm(formData).subscribe({
        next: (response) => {
          console.log('Form created successfully:', response);
          this.showSuccessMessage('¡Formulario creado exitosamente!');
        },
        error: (error) => {
          console.error('Error creating form:', error);
          alert('Error al crear el formulario. Revisa la consola para más detalles.');
        }
      });
    }
  }

  // Clear form builder state for creating new form
  clearFormBuilder(): void {
    console.log('Clearing form builder for new form creation');
    
    // Reset all form builder state
    this.editingFormId = null;
    this.isEditMode = false;
    this.formId = null;
    this.selectedField = null;
    this.showPreview = false;
    this.showJson = false;
    this.generatedJson = '';
    this.showSuccessModal = false;
    this.successMessage = '';
    
    // Clear the form schema in the service
    this.formBuilderService.clearForm();
    
    console.log('Form builder cleared - ready for new form creation');
  }

  // Go back to main page
  goBack(): void {
    this.router.navigate(['/']);
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccessModal = true;
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.successMessage = '';
    // Navigate back to main page after closing modal
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 300);
  }
}

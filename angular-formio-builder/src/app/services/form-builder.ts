import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FormField {
  id?: string;
  key: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  validationMessage?: string;
  options?: Array<{ label: string; value: string }>;
  position?: number;
  defaultValue?: any;
  validate?: {
    required?: boolean;
  };
}

export interface FormSchema {
  id?: string;
  title: string;
  fields: FormField[];
}

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {
  private formSchemaSubject = new BehaviorSubject<FormSchema>({
    title: 'Nuevo Formulario',
    fields: []
  });

  private selectedFieldSubject = new BehaviorSubject<FormField | null>(null);
  
  // Almacenar los datos ingresados en la vista previa
  private formDataSubject = new BehaviorSubject<any>({});

  public formSchema$ = this.formSchemaSubject.asObservable();
  public selectedField$ = this.selectedFieldSubject.asObservable();
  public formData$ = this.formDataSubject.asObservable();

  constructor() { }

  // Generate unique ID for forms
  private generateFormId(): string {
    return 'form_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Generate mocked default value based on field type
  public generateMockedDefaultValue(fieldType: string): any {
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

  getFormSchema(): FormSchema {
    return this.formSchemaSubject.value;
  }

  updateFormTitle(title: string): void {
    const currentSchema = this.formSchemaSubject.value;
    this.formSchemaSubject.next({
      ...currentSchema,
      title
    });
  }

  addField(fieldType: string): void {
    console.log('Adding field of type:', fieldType);
    const currentSchema = this.formSchemaSubject.value;
    console.log('Current schema before adding field:', currentSchema);
    
    const fieldId = this.generateFieldId();
    const newField: FormField = {
      id: fieldId,
      key: fieldId, // Agregar la propiedad key requerida
      type: fieldType,
      label: this.getDefaultLabel(fieldType),
      placeholder: '',
      required: false,
      position: currentSchema.fields.length,
      defaultValue: this.generateMockedDefaultValue(fieldType)
    };
    
    console.log('New field created:', newField);

    const updatedSchema = {
      ...currentSchema,
      fields: [...currentSchema.fields, newField]
    };
    
    console.log('Updated schema:', updatedSchema);
    this.formSchemaSubject.next(updatedSchema);
  }

  updateField(fieldKey: string, updates: Partial<FormField>): void {
    const currentSchema = this.formSchemaSubject.value;
    const updatedFields = currentSchema.fields.map(field =>
      field.key === fieldKey ? { ...field, ...updates } : field
    );

    this.formSchemaSubject.next({
      ...currentSchema,
      fields: updatedFields
    });
  }

  removeField(fieldKey: string): void {
    const currentSchema = this.formSchemaSubject.value;
    const filteredFields = currentSchema.fields.filter(field => field.key !== fieldKey);

    this.formSchemaSubject.next({
      ...currentSchema,
      fields: filteredFields
    });
  }

  selectField(field: FormField | null): void {
    this.selectedFieldSubject.next(field);
  }

  getSelectedField(): FormField | null {
    return this.selectedFieldSubject.value;
  }

  reorderFields(previousIndex: number, currentIndex: number): void {
    const currentSchema = this.formSchemaSubject.value;
    const fields = [...currentSchema.fields];
    const [movedField] = fields.splice(previousIndex, 1);
    fields.splice(currentIndex, 0, movedField);

    // Update positions
    fields.forEach((field, index) => {
      field.position = index;
    });

    this.formSchemaSubject.next({
      ...currentSchema,
      fields
    });
  }

  generateFormioSchema(): any {
    const schema = this.formSchemaSubject.value;
    return {
      title: schema.title,
      components: schema.fields.map(field => this.convertToFormioComponent(field))
    };
  }

  private generateFieldId(): string {
    return 'field_' + Math.random().toString(36).substr(2, 9);
  }

  private getDefaultLabel(fieldType: string): string {
    const labels: { [key: string]: string } = {
      'textfield': 'Campo de Texto',
      'textarea': 'Área de Texto',
      'number': 'Número',
      'datetime': 'Fecha',
      'select': 'Lista Desplegable',
      'checkbox': 'Casilla de Verificación',
      'radio': 'Botones de Radio',
      'button': 'Botón'
    };
    return labels[fieldType] || 'Campo';
  }

  private convertToFormioComponent(field: FormField): any {
    const baseComponent: any = {
      key: field.id,
      type: field.type,
      label: field.label,
      placeholder: field.placeholder || '',
      defaultValue: field.defaultValue,
      validate: {
        required: field.required || false
      }
    };

    if (field.minLength) {
      baseComponent.validate.minLength = field.minLength;
    }

    if (field.maxLength) {
      baseComponent.validate.maxLength = field.maxLength;
    }

    if (field.validationMessage) {
      baseComponent.validate.customMessage = field.validationMessage;
    }

    if (field.options && (field.type === 'select' || field.type === 'radio')) {
      baseComponent.data = {
        values: field.options
      };
    }

    return baseComponent;
  }

  // Load an existing form schema (for editing)
  loadFormSchema(schema: FormSchema): void {
    // Asegurar que todos los campos tengan la propiedad key
    const normalizedSchema = {
      ...schema,
      fields: schema.fields.map(field => {
        // Si el campo no tiene key pero tiene id, usar id como key
        if (!field.key && field.id) {
          return {
            ...field,
            key: field.id
          };
        }
        // Si no tiene ni key ni id, generar un nuevo id y usarlo como key
        if (!field.key && !field.id) {
          const newId = this.generateFieldId();
          return {
            ...field,
            id: newId,
            key: newId
          };
        }
        return field;
      })
    };
    
    this.formSchemaSubject.next(normalizedSchema);
    // Clear selected field when loading new schema
    this.selectedFieldSubject.next(null);
  }

  // Update form data from preview
  updateFormData(formData: any): void {
    this.formDataSubject.next(formData);
  }

  // Get current form data
  getFormData(): any {
    return this.formDataSubject.value;
  }

  // Get current form schema (for saving) - uses real backend structure
  getCurrentSchema(): any {
    const currentSchema = this.formSchemaSubject.value;
    const currentFormData = this.formDataSubject.value;
    
    console.log('Getting current schema with form data:', currentFormData);
    
    // Return structure expected by real backend: { title, schema: { fields }, capturedData }
    const result = {
      title: currentSchema.title,
      schema: {
        title: currentSchema.title,
        fields: currentSchema.fields.map((field: FormField) => ({
          id: field.id,
          type: field.type,
          label: field.label,
          placeholder: field.placeholder || '',
          required: field.required || false,
          position: field.position,
          defaultValue: field.defaultValue || ''
        }))
      },
      capturedData: currentFormData || {}
    };
    
    console.log('Final schema with real backend structure:', result);
    return result;
  }

  // Clear all form data and schema (for creating new form)
  clearForm(): void {
    console.log('Clearing form builder service state');
    
    // Reset to initial empty state
    const emptySchema: FormSchema = {
      title: 'Nuevo Formulario',
      fields: []
    };
    
    this.formSchemaSubject.next(emptySchema);
    this.selectedFieldSubject.next(null);
    this.formDataSubject.next({});
    
    console.log('Form builder service cleared - ready for new form');
  }
}

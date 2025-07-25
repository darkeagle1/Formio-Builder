import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormBuilderService, FormField } from '../../services/form-builder';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-field-config',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './field-config.html',
  styleUrl: './field-config.scss'
})
export class FieldConfigComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  selectedField: FormField | null = null;
  configForm: FormGroup;
  fieldOptions: Array<{ label: string; value: string }> = [];

  constructor(
    private formBuilderService: FormBuilderService,
    private fb: FormBuilder
  ) {
    this.configForm = this.createConfigForm();
  }

  ngOnInit(): void {
    this.formBuilderService.selectedField$
      .pipe(takeUntil(this.destroy$))
      .subscribe(field => {
        this.selectedField = field;
        this.updateConfigForm(field);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createConfigForm(): FormGroup {
    return this.fb.group({
      label: [''],
      placeholder: [''],
      required: [false],
      minLength: [''],
      maxLength: [''],
      validationMessage: ['']
    });
  }

  private updateConfigForm(field: FormField | null): void {
    if (field) {
      this.configForm.patchValue({
        label: field.label || '',
        placeholder: field.placeholder || '',
        required: field.required || false,
        minLength: field.minLength || '',
        maxLength: field.maxLength || '',
        validationMessage: field.validationMessage || ''
      });
      
      // Load options for select/radio fields
      if (field.type === 'select' || field.type === 'radio') {
        this.fieldOptions = field.options || [];
      } else {
        this.fieldOptions = [];
      }
    } else {
      this.configForm.reset();
      this.fieldOptions = [];
    }
  }

  onConfigChange(): void {
    if (this.selectedField && this.configForm.valid) {
      const formValue = this.configForm.value;
      const updates: Partial<FormField> = {
        label: formValue.label,
        placeholder: formValue.placeholder,
        required: formValue.required,
        validationMessage: formValue.validationMessage
      };

      if (formValue.minLength) {
        updates.minLength = parseInt(formValue.minLength, 10);
      }

      if (formValue.maxLength) {
        updates.maxLength = parseInt(formValue.maxLength, 10);
      }

      if (this.selectedField.type === 'select' || this.selectedField.type === 'radio') {
        updates.options = this.fieldOptions;
      }

      this.formBuilderService.updateField(this.selectedField.key, updates);
    }
  }

  addOption(): void {
    this.fieldOptions.push({ label: 'Nueva Opción', value: 'nueva_opcion' });
    this.onConfigChange();
  }

  removeOption(index: number): void {
    this.fieldOptions.splice(index, 1);
    this.onConfigChange();
  }

  onOptionChange(): void {
    this.onConfigChange();
  }

  deleteField(): void {
    if (this.selectedField && confirm('¿Estás seguro de que quieres eliminar este campo?')) {
      this.formBuilderService.removeField(this.selectedField.key);
    }
  }

  closeConfig(): void {
    this.formBuilderService.selectField(null);
  }

  saveConfig(): void {
    if (this.selectedField) {
      if (this.configForm.valid) {
        this.onConfigChange();
        console.log('Configuración guardada exitosamente');
        // You could add a toast notification here in the future
        alert('Configuración guardada exitosamente');
      } else {
        console.warn('Formulario no válido, no se pueden guardar los cambios');
        alert('Por favor, revisa los campos. Hay errores en el formulario.');
      }
    } else {
      console.warn('No hay campo seleccionado');
      alert('No hay ningún campo seleccionado para guardar.');
    }
  }

  get showLengthValidation(): boolean {
    return this.selectedField?.type === 'textfield' || this.selectedField?.type === 'textarea';
  }

  get showOptions(): boolean {
    return this.selectedField?.type === 'select' || this.selectedField?.type === 'radio';
  }

  getFieldTypeLabel(fieldType: string): string {
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
}

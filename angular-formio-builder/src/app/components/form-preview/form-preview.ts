import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilderService, FormSchema, FormField } from '../../services/form-builder';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-form-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-preview.html',
  styleUrls: ['./form-preview.scss']
})
export class FormPreviewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  formSchema: FormSchema = { title: 'Nuevo Formulario', fields: [] };
  formData: any = {};
  isLoading = false;
  
  constructor(private formBuilderService: FormBuilderService) {}

  ngOnInit(): void {
    this.formBuilderService.formSchema$
      .pipe(takeUntil(this.destroy$))
      .subscribe(schema => {
        this.formSchema = schema;
        this.initializeFormData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFormData(): void {
    this.formData = {};
    this.formSchema.fields.forEach(field => {
      // Mantener valores existentes si ya existen
      if (!this.formData.hasOwnProperty(field.key)) {
        this.formData[field.key] = field.defaultValue || '';
      }
    });
  }

  // Método llamado cuando cambia un valor en la vista previa
  onFieldValueChange(fieldId: string, value: any): void {
    this.formData[fieldId] = value;
    // Notificar al FormBuilderService sobre el cambio de datos
    this.formBuilderService.updateFormData(this.formData);
    console.log('Form data updated:', this.formData);
  }

  onSubmit(): void {
    console.log('Form submitted:', this.formData);
    // Asegurar que los datos se guarden en el servicio
    this.formBuilderService.updateFormData(this.formData);
    alert('Formulario enviado! Los datos se han capturado para el guardado.');
  }

  onReset(): void {
    this.initializeFormData();
    // Limpiar también los datos en el servicio
    this.formBuilderService.updateFormData(this.formData);
  }

  // Método para verificar si formData tiene propiedades
  hasFormData(): boolean {
    return this.formData && Object.keys(this.formData).length > 0;
  }

  // Método para obtener las opciones de un campo select/radio/checkbox
  getFieldOptions(field: FormField): Array<{ label: string; value: string }> {
    return field.options || [];
  }
}

import { Component } from '@angular/core';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormBuilderService } from '../../services/form-builder';

interface FieldType {
  type: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-field-palette',
  standalone: true,
  imports: [CommonModule, CdkDrag, CdkDropList],
  templateUrl: './field-palette.html',
  styleUrls: ['./field-palette.scss']
})
export class FieldPaletteComponent {
  fieldTypes: FieldType[] = [
    {
      type: 'textfield',
      label: 'Campo de Texto',
      icon: '',
      description: 'Campo de texto simple'
    },
    {
      type: 'textarea',
      label: 'Área de Texto',
      icon: '',
      description: 'Campo de texto multilínea'
    },
    {
      type: 'number',
      label: 'Número',
      icon: '',
      description: 'Campo numérico'
    },
    {
      type: 'datetime',
      label: 'Fecha',
      icon: '',
      description: 'Selector de fecha'
    },
    {
      type: 'select',
      label: 'Lista Desplegable',
      icon: '',
      description: 'Lista de opciones desplegable'
    },
    {
      type: 'checkbox',
      label: 'Casilla de Verificación',
      icon: '',
      description: 'Casilla de verificación'
    },
    {
      type: 'radio',
      label: 'Botones de Radio',
      icon: '',
      description: 'Botones de selección única'
    },
    {
      type: 'button',
      label: 'Botón',
      icon: '',
      description: 'Botón de acción'
    }
  ];

  constructor(private formBuilderService: FormBuilderService) {}

  onFieldClick(fieldType: string): void {
    this.formBuilderService.addField(fieldType);
  }
}

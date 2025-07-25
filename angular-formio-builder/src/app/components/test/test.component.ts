import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; background: #f0f0f0; border: 2px solid #333; margin: 20px;">
      <h1>🎉 Test Component Working!</h1>
      <p>Si ves este mensaje, significa que Angular está funcionando correctamente.</p>
      <p>El problema está en el FormBuilderComponent específicamente.</p>
      <ul>
        <li>Router: ✅ Funcionando</li>
        <li>Componentes: ✅ Funcionando</li>
        <li>Templates: ✅ Funcionando</li>
      </ul>
    </div>
  `,
  styles: [`
    div {
      font-family: Arial, sans-serif;
    }
    h1 {
      color: #2e7d32;
      margin-bottom: 10px;
    }
    p {
      margin: 10px 0;
      font-size: 16px;
    }
    ul {
      margin: 15px 0;
      padding-left: 20px;
    }
    li {
      margin: 5px 0;
      font-weight: bold;
    }
  `]
})
export class TestComponent {
  constructor() {
    console.log('TestComponent loaded successfully!');
  }
}

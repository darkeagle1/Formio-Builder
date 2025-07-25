// Mock de dragula para evitar errores de SSR durante el desarrollo
// Este archivo simula la funcionalidad básica de dragula sin acceder al DOM

export const dragulaMock = {
  // Función principal de dragula
  default: function(containers?: any, options?: any) {
    console.log('Dragula mock initialized - development mode');
    
    // Simular el objeto drake que retorna dragula
    return {
      containers: containers || [],
      dragging: false,
      
      // Métodos principales de drake
      on: function(event: string, callback: Function) {
        console.log(`Dragula mock: event '${event}' registered`);
        return this;
      },
      
      off: function(event: string, callback?: Function) {
        console.log(`Dragula mock: event '${event}' unregistered`);
        return this;
      },
      
      cancel: function(revert?: boolean) {
        console.log('Dragula mock: cancel called');
        return this;
      },
      
      remove: function() {
        console.log('Dragula mock: remove called');
        return this;
      },
      
      destroy: function() {
        console.log('Dragula mock: destroy called');
        return this;
      },
      
      canMove: function(item: any) {
        return false; // En modo mock, no permitir movimiento
      },
      
      start: function(item: any) {
        console.log('Dragula mock: start called');
        return this;
      },
      
      end: function() {
        console.log('Dragula mock: end called');
        return this;
      }
    };
  }
};

// Exportar como módulo compatible
export default dragulaMock.default;

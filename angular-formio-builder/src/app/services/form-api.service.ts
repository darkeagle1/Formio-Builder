import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FormItem {
  id: string;
  title: string;
  components: Array<{
    key: string;
    type: string;
    label: string;
    placeholder?: string;
    validate?: {
      required?: boolean;
    };
  }>;
  createdAt: string;
}

export interface CreateFormRequest {
  title: string;
  components: any[];
}

export interface UpdateFormRequest {
  title: string;
  components: any[];
}

@Injectable({
  providedIn: 'root'
})
export class FormApiService {
  private baseUrl = 'http://159.203.103.8:5000/api/forms';

  constructor(private http: HttpClient) {}

  // GET /api/forms/list - Listar todos los formularios
  getAllForms(): Observable<FormItem[]> {
    return this.http.get<FormItem[]>(`http://159.203.103.8:5000/api/forms/list`);
  }

  // GET /api/forms/details/{id} - Obtener un formulario específico por ID
  getFormById(id: string): Observable<FormItem> {
    return this.http.get<FormItem>(`http://159.203.103.8:5000/api/forms/details/${id}`);
  }

  // POST /api/forms/create - Crear un nuevo formulario dinámico
  createForm(form: CreateFormRequest): Observable<FormItem> {
    return this.http.post<FormItem>(`${this.baseUrl}/create`, form);
  }

  // PUT /api/forms/update/{id} - Actualizar un formulario existente
  updateForm(id: string, form: UpdateFormRequest): Observable<FormItem> {
    return this.http.put<FormItem>(`http://159.203.103.8:5000/api/forms/update/${id}`, form);
  }

  // DELETE /api/forms/{id} - Eliminar un formulario
  deleteForm(id: string): Observable<void> {
    return this.http.delete<void>(`http://159.203.103.8:5000/api/forms/${id}`);
  }
}

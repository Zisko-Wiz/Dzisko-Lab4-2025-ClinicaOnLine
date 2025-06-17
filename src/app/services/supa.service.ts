import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SupaService
{
  supabase = createClient(environment.apiUrl, environment.publicAnonKey);

}

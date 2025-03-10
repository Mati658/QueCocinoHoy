import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

const supabase: SupabaseClient = createClient(environment.URL, environment.SUPABASE_KEY);

export default supabase;

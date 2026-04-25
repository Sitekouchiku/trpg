import { createClient } from '@supabase/supabase-js';

// あなたのプロジェクト専用の「URL」と「鍵」をここに書きます
const supabaseUrl = 'https://bhyqszurwmepsrjabsds.supabase.co';
const supabaseAnonKey = 'sb_publishable_Ik7UDRhDXHyml3Clgv9w1g_JL-7JsqS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
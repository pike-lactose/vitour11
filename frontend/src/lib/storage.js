import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const storageBucket = process.env.REACT_APP_SUPABASE_STORAGE_BUCKET || 'vitour';

export const isDirectUploadConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey);

const supabase = isDirectUploadConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function generateFilename(file) {
  const ext = file && file.name ? file.name.slice(file.name.lastIndexOf('.')) : '';
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
}

export async function uploadImage(file) {
  if (!supabase) {
    throw new Error('Direct upload is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
  }
  const path = generateFilename(file);
  const { error } = await supabase.storage.from(storageBucket).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: true
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function readJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    return { error: text || `Request failed with status ${res.status}` };
  }
}
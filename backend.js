'use strict';
// Verbindung zum gemeinsamen Online-Speicher (Supabase). Leer = Gemeinschafts-Funktionen sind aus,
// die App läuft dann genau wie vorher. Der Schlüssel hier ist der öffentliche „publishable/anon key“ –
// er darf im Code stehen. Den geheimen „service_role“-Schlüssel niemals hier eintragen!
const BACKEND = {
  url: '',   // z. B. 'https://abcdefgh.supabase.co'
  key: '',   // z. B. 'sb_publishable_…' oder 'eyJ…'
};

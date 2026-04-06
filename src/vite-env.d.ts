/// <reference types="vite/client" />

// ============================================================
// TIPOS DE VARIABLES DE ENTORNO
// ============================================================
// Define los tipos de las variables de entorno disponibles
// en import.meta.env para obtener autocompletado e IntelliSense.
// ============================================================

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SITE_URL: string;
  // Agrega más variables VITE_* aquí según las necesites
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

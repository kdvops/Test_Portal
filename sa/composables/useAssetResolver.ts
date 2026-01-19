// Composable para resolver rutas de assets en Nuxt 3
// Los assets se copian a public/assets/ mediante scripts/copy-assets.mjs
// Este resolver simplemente devuelve las rutas públicas

// Función principal para resolver assets
export function resolveAssetPath(src: string): string {
  if (!src) return ''
  
  // URLs externas
  if (src.startsWith('http') || src.startsWith('//')) {
    return src
  }
  
  // Extraer ruta relativa
  let relativePath = ''
  if (src.startsWith('/assets/')) {
    // Ya es una ruta pública, devolver tal cual
    return src
  } else if (src.startsWith('~/assets/')) {
    relativePath = src.replace('~/assets/', '')
    // Convertir a ruta pública
    return `/assets/${relativePath}`
  } else {
    // No es un asset, devolver tal cual
    return src.startsWith('/') ? src : `/${src}`
  }
}

// Composable exportable
export const useAssetResolver = () => {
  return {
    resolveAssetPath
  }
}

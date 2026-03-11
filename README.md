# 🌞 EnfescalSol

**Escalas de Valoración de Enfermería — Sistema Sanitario Público Andaluz**  
*Hospital Universitario Costa del Sol · Atención Primaria*

---

## Descripción

EnfescalSol es una Progressive Web App (PWA) para dispositivos móviles Android e iOS que permite realizar y registrar las principales escalas de valoración de enfermería utilizadas en el SSPA.

### Escalas incluidas
| Escala | Objetivo |
|--------|----------|
| Índice de Barthel | Actividades básicas de la vida diaria |
| Escala de Braden | Riesgo de úlceras por presión |
| Escala de Norton | Riesgo de úlceras por presión (alternativa) |
| Escala de Goldberg | Cribado de ansiedad y depresión |
| Escala de Zarit | Sobrecarga del cuidador |
| Escala de Morse | Riesgo de caídas |
| Mini Nutritional Assessment (MNA) | Valoración nutricional en mayores |
| Test de Pfeiffer | Deterioro cognitivo |

### Funcionalidades
- ✅ Registro de pacientes con **nombre + NHC** + datos demográficos
- ✅ Aplicación de todas las escalas con items interactivos
- ✅ Interpretación automática por rangos clínicos validados
- ✅ Gráfico de araña (radar) con las 2 últimas valoraciones
- ✅ Historial de valoraciones por paciente y escala
- ✅ **Exportación a Word (.docx)** — compatible con Microsoft Word
- ✅ **Exportación a OpenDocument (.odt)** — compatible con LibreOffice/OpenOffice
- ✅ **Impresión / PDF** desde el navegador
- ✅ Funciona **sin conexión** (PWA con Service Worker)
- ✅ Instalable en pantalla de inicio (Android e iOS)
- ✅ Datos almacenados localmente en el dispositivo (localStorage)

---

## Estructura del proyecto

```
enfescalsol/
├── public/
│   ├── index.html          ← Entrada PWA con CDN scripts
│   ├── manifest.json       ← Manifiesto PWA
│   ├── sw.js               ← Service Worker (cache offline)
│   └── icons/              ← Iconos PWA (72-512px)
├── src/
│   ├── main.jsx            ← Entrada React
│   ├── EnfescalSol.jsx     ← Componente principal (app completa)
│   └── exportar.js         ← Módulo de exportación (referencia)
├── netlify.toml            ← Configuración Netlify
├── vite.config.js          ← Build con Vite + PWA plugin
└── package.json
```

---

## Despliegue en Netlify

### Opción A: Despliegue directo desde GitHub (recomendado)

1. **Subir el proyecto a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "EnfescalSol v1.0"
   git remote add origin https://github.com/TU_USUARIO/enfescalsol.git
   git push -u origin main
   ```

2. **En Netlify (netlify.com):**
   - New site → Import from Git → GitHub
   - Seleccionar el repositorio `enfescalsol`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - ✅ Deploy site

3. **Configurar dominio personalizado** (opcional):
   - En Netlify: Site settings → Domain management
   - Añadir dominio: `enfescalsol.hucs.es` (coordinado con TI del hospital)

### Opción B: Despliegue manual (Netlify Drop)

1. Ejecutar localmente:
   ```bash
   npm install
   npm run build
   ```
2. Ir a **app.netlify.com/drop**
3. Arrastrar la carpeta `dist/` generada

---

## Instalación para desarrollo local

### Requisitos
- Node.js 18 o superior
- npm 9+

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Servidor de desarrollo (http://localhost:3000)
npm run dev

# 3. Build de producción
npm run build

# 4. Previsualizar build
npm run preview
```

---

## Iconos PWA (necesario antes del primer despliegue)

Los iconos deben generarse y colocarse en `public/icons/`. Tamaños necesarios:

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| icon-72.png | 72×72 | Android legacy |
| icon-96.png | 96×96 | Android / favicon |
| icon-128.png | 128×128 | Chrome Web Store |
| icon-192.png | 192×192 | Android home screen |
| icon-512.png | 512×512 | Splash screen |

**Generación rápida** desde un PNG base (requiere `sharp` o herramienta online como [realfavicongenerator.net](https://realfavicongenerator.net)):
```bash
npx sharp-cli --input logo.png --output public/icons/icon-192.png resize 192 192
```

O usar https://pwa-asset-generator.dev/ con el logo del hospital.

---

## Exportación de informes

### Word (.docx)
- Requiere la librería **docx.js** cargada via CDN en `index.html`
- CDN: `https://unpkg.com/docx@9.5.3/build/index.umd.js`
- Genera informe A4 con: portada, tabla resumen, detalle por escala, pie de firma
- Compatible con **Microsoft Word 2010+**, Google Docs, LibreOffice Writer

### OpenDocument (.odt)
- Requiere **JSZip** cargado via CDN en `index.html`
- CDN: `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`
- Genera ODT nativo con estilos, cabecera y pie de página
- Compatible con **LibreOffice Writer**, OpenOffice, Google Docs, Word 2013+

### Impresión / PDF
- Usa el diálogo de impresión nativo del navegador
- En móvil: seleccionar "Guardar como PDF" en la impresora
- Los botones y navegación se ocultan automáticamente al imprimir

---

## Consideraciones de privacidad y seguridad

- Los datos se almacenan **únicamente en el dispositivo** (localStorage)
- No se envía ningún dato a servidores externos
- Sin registro de usuarios, sin cuentas, sin analíticas
- Recomendado para uso en dispositivo personal del profesional sanitario
- **No incluir datos identificativos en capturas de pantalla** para comunicaciones internas
- Para entornos con mayor seguridad considerar cifrado del localStorage o integración con el HIS del hospital

---

## Tecnologías utilizadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18 | UI y estado |
| Recharts | 2 | Gráficos de araña |
| docx.js | 9.5 | Generación de Word |
| JSZip | 3.10 | Generación de ODT |
| Vite | 5 | Build y dev server |
| vite-plugin-pwa | 0.20 | Service Worker |
| Netlify | — | Hosting |

---

## Escalas — Referencias clínicas

- **Barthel**: Mahoney FI, Barthel DW. *Functional Evaluation: The Barthel Index*. Maryland State Med J. 1965
- **Braden**: Bergstrom N, et al. *The Braden Scale for Predicting Pressure Sore Risk*. Nurs Res. 1987
- **Norton**: Norton D. *An Investigation of Geriatric Nursing Problems in Hospital*. 1962
- **Goldberg**: Goldberg D, Bridges K. *Screening for psychiatric illness in general practice*. J R Coll Gen Pract. 1987
- **Zarit**: Zarit SH, et al. *Relatives of the impaired elderly: correlates of feelings of burden*. Gerontologist. 1980
- **Morse**: Morse JM. *Preventing Patient Falls*. Thousand Oaks: Sage Publications. 1997
- **MNA**: Guigoz Y, et al. *Mini Nutritional Assessment*. Facts Res Gerontol. 1994
- **Pfeiffer**: Pfeiffer E. *A short portable mental status questionnaire*. J Am Geriatr Soc. 1975

---

*EnfescalSol v1.0 — Hospital Universitario Costa del Sol · Servicio de Radiodiagnóstico*

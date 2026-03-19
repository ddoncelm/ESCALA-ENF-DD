import { useState, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

// ─── CLAVE DE ACCESO (cambiar desde GitHub) ───────────────────────────────────
const ACCESS_PASSWORD = "molinero26";

// ─── PALETA CORPORATIVA JUNTA DE ANDALUCÍA ───────────────────────────────────
const C = {
  primary:     "#009639",   // Verde institucional Junta de Andalucía
  primaryDark: "#007A2E",
  secondary:   "#00B050",
  accent:      "#E8B400",   // Amarillo corporativo
  accentLight: "#FFD740",
  bg:          "#F2F7F3",
  surface:     "#FFFFFF",
  surfaceAlt:  "#E8F5EC",
  text:        "#1A2E1F",
  textMuted:   "#557060",
  success:     "#2DC653",
  warning:     "#F4A261",
  danger:      "#E63946",
  border:      "#C0DCC8",
  headerBg:    "#007A2E",
};

// ─── ESCALAS CLÍNICAS ────────────────────────────────────────────────────────
const ESCALAS = {
  barthel: {
    id:"barthel", nombre:"Índice de Barthel", icono:"♿", color:"#007A2E",
    descripcion:"Actividades básicas de la vida diaria",
    items:[
      {id:"comida",label:"Comer",opciones:[{valor:0,texto:"Incapaz"},{valor:5,texto:"Necesita ayuda"},{valor:10,texto:"Independiente"}]},
      {id:"bano",label:"Baño",opciones:[{valor:0,texto:"Dependiente"},{valor:5,texto:"Independiente"}]},
      {id:"aseo",label:"Aseo personal",opciones:[{valor:0,texto:"Necesita ayuda"},{valor:5,texto:"Independiente"}]},
      {id:"vestido",label:"Vestirse",opciones:[{valor:0,texto:"Dependiente"},{valor:5,texto:"Necesita ayuda"},{valor:10,texto:"Independiente"}]},
      {id:"deposicion",label:"Deposición",opciones:[{valor:0,texto:"Incontinente"},{valor:5,texto:"Accidente ocasional"},{valor:10,texto:"Continente"}]},
      {id:"miccion",label:"Micción",opciones:[{valor:0,texto:"Incontinente"},{valor:5,texto:"Accidente ocasional"},{valor:10,texto:"Continente"}]},
      {id:"retrete",label:"Uso del retrete",opciones:[{valor:0,texto:"Dependiente"},{valor:5,texto:"Necesita ayuda"},{valor:10,texto:"Independiente"}]},
      {id:"traslado",label:"Traslado sillón-cama",opciones:[{valor:0,texto:"Incapaz"},{valor:5,texto:"Gran ayuda"},{valor:10,texto:"Mínima ayuda"},{valor:15,texto:"Independiente"}]},
      {id:"deambulacion",label:"Deambulación",opciones:[{valor:0,texto:"Inmóvil"},{valor:5,texto:"Independiente silla"},{valor:10,texto:"Camina con ayuda"},{valor:15,texto:"Independiente"}]},
      {id:"escaleras",label:"Subir escaleras",opciones:[{valor:0,texto:"Incapaz"},{valor:5,texto:"Necesita ayuda"},{valor:10,texto:"Independiente"}]},
    ],
    maxPuntos:100,
    interpretacion:(t)=>{
      if(t===100) return {nivel:"Independiente",color:C.success};
      if(t>=61)   return {nivel:"Dependencia leve",color:C.success};
      if(t>=41)   return {nivel:"Dependencia moderada",color:C.warning};
      if(t>=21)   return {nivel:"Dependencia severa",color:C.accent};
      return {nivel:"Dependencia total",color:C.danger};
    }
  },
  braden:{
    id:"braden",nombre:"Escala de Braden",icono:"🛏",color:"#C0392B",
    descripcion:"Riesgo de úlceras por presión",
    items:[
      {id:"percepcion",label:"Percepción sensorial",opciones:[{valor:1,texto:"Completamente limitada"},{valor:2,texto:"Muy limitada"},{valor:3,texto:"Ligeramente limitada"},{valor:4,texto:"Sin deterioro"}]},
      {id:"humedad",label:"Exposición a humedad",opciones:[{valor:1,texto:"Constantemente húmeda"},{valor:2,texto:"A menudo húmeda"},{valor:3,texto:"Ocasionalmente húmeda"},{valor:4,texto:"Raramente húmeda"}]},
      {id:"actividad",label:"Actividad",opciones:[{valor:1,texto:"En cama"},{valor:2,texto:"En silla"},{valor:3,texto:"Camina ocasionalmente"},{valor:4,texto:"Camina frecuentemente"}]},
      {id:"movilidad",label:"Movilidad",opciones:[{valor:1,texto:"Completamente inmóvil"},{valor:2,texto:"Muy limitada"},{valor:3,texto:"Ligeramente limitada"},{valor:4,texto:"Sin limitaciones"}]},
      {id:"nutricion",label:"Nutrición",opciones:[{valor:1,texto:"Muy pobre"},{valor:2,texto:"Probablemente inadecuada"},{valor:3,texto:"Adecuada"},{valor:4,texto:"Excelente"}]},
      {id:"friccion",label:"Fricción y rozamiento",opciones:[{valor:1,texto:"Problema"},{valor:2,texto:"Problema potencial"},{valor:3,texto:"Sin problema aparente"}]},
    ],
    maxPuntos:23,
    interpretacion:(t)=>{
      if(t<=9)  return {nivel:"Riesgo muy alto",color:C.danger};
      if(t<=12) return {nivel:"Riesgo alto",color:C.danger};
      if(t<=14) return {nivel:"Riesgo moderado",color:C.warning};
      if(t<=18) return {nivel:"Riesgo bajo",color:C.warning};
      return {nivel:"Sin riesgo",color:C.success};
    }
  },
  norton:{
    id:"norton",nombre:"Escala de Norton",icono:"🩹",color:"#8E44AD",
    descripcion:"Riesgo de úlceras por presión (alternativa)",
    items:[
      {id:"estadofisico",label:"Estado físico general",opciones:[{valor:1,texto:"Muy malo"},{valor:2,texto:"Regular"},{valor:3,texto:"Aceptable"},{valor:4,texto:"Bueno"}]},
      {id:"estadomental",label:"Estado mental",opciones:[{valor:1,texto:"Estuporoso"},{valor:2,texto:"Confuso"},{valor:3,texto:"Apático"},{valor:4,texto:"Alerta"}]},
      {id:"actividad2",label:"Actividad",opciones:[{valor:1,texto:"Encamado"},{valor:2,texto:"En silla"},{valor:3,texto:"Camina con ayuda"},{valor:4,texto:"Ambulante"}]},
      {id:"movilidad2",label:"Movilidad",opciones:[{valor:1,texto:"Inmóvil"},{valor:2,texto:"Muy limitada"},{valor:3,texto:"Ligeramente limitada"},{valor:4,texto:"Total"}]},
      {id:"incontinencia",label:"Incontinencia",opciones:[{valor:1,texto:"Urinaria y fecal"},{valor:2,texto:"Habitualmente urinaria"},{valor:3,texto:"Ocasional"},{valor:4,texto:"Ninguna"}]},
    ],
    maxPuntos:20,
    interpretacion:(t)=>{
      if(t<=12) return {nivel:"Riesgo muy alto",color:C.danger};
      if(t<=14) return {nivel:"Riesgo alto",color:C.danger};
      if(t<=16) return {nivel:"Riesgo medio",color:C.warning};
      return {nivel:"Riesgo bajo / Sin riesgo",color:C.success};
    }
  },
  goldberg:{
    id:"goldberg",nombre:"Escala de Goldberg",icono:"🧠",color:"#1565C0",
    descripcion:"Cribado de ansiedad y depresión",
    items:[
      {id:"a1",label:"¿Se ha sentido muy excitado/a, nervioso/a o en tensión?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"a2",label:"¿Ha estado muy preocupado/a por algo?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"a3",label:"¿Se ha sentido muy irritable?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"a4",label:"¿Ha tenido dificultad para relajarse?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"a5",label:"¿Ha dormido mal, ha tenido dificultades para dormir?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"a6",label:"¿Ha tenido dolores de cabeza o nuca?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"a7",label:"¿Ha tenido temblores, hormigueos, mareos, sudores o diarrea?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"a8",label:"¿Ha estado preocupado/a por su salud?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"d1",label:"¿Se ha sentido con poca energía?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"d2",label:"¿Ha perdido interés por las cosas?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"d3",label:"¿Ha perdido la confianza en sí mismo/a?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"d4",label:"¿Se ha sentido desesperado/a, sin esperanzas?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"d5",label:"¿Ha tenido dificultades para concentrarse?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"d6",label:"¿Ha perdido peso por falta de apetito?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"d7",label:"¿Se ha despertado demasiado temprano?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"d8",label:"¿Se ha sentido enlentecido/a?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      {id:"d9",label:"¿Cree que ha tendido a encontrarse peor por las mañanas?",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
    ],
    maxPuntos:17,
    interpretacion:(t)=>({nivel:"Ver subescalas",color:C.primary})
  },
  zarit:{
    id:"zarit",nombre:"Escala de Zarit",icono:"👥",color:"#2D6A4F",
    descripcion:"Sobrecarga del cuidador",
    items:[
      {id:"z1",label:"¿Siente que su familiar pide más ayuda de la que necesita?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z2",label:"¿No tiene suficiente tiempo para Ud. por cuidar a su familiar?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z3",label:"¿Se siente agobiado entre cuidar a su familiar y otras responsabilidades?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z4",label:"¿Siente vergüenza por la conducta de su familiar?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z5",label:"¿Se siente enfadado cuando está cerca de su familiar?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z6",label:"¿Cree que la situación afecta su relación con amigos y familiares?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z7",label:"¿Tiene miedo de lo que le pueda ocurrir a su familiar?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z8",label:"¿Cree que su familiar depende de Ud.?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z9",label:"¿Se siente tenso/a cuando está cerca de su familiar?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z10",label:"¿Siente que su salud se ha resentido por cuidar a su familiar?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z11",label:"¿Siente que no tiene la intimidad que desearía?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z12",label:"¿Cree que su vida social se ha resentido?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z13",label:"¿Se siente incómodo/a para invitar amigos a causa de su familiar?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z14",label:"¿Su familiar espera que Ud. sea la única persona con quien contar?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z15",label:"¿No dispone de dinero suficiente para cuidar a su familiar?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z16",label:"¿Siente que será incapaz de cuidar a su familiar mucho más tiempo?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z17",label:"¿Siente que ha perdido el control de su vida?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z18",label:"¿Desearía poder encargar el cuidado de su familiar a otra persona?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z19",label:"¿Se siente inseguro/a sobre qué hacer con su familiar?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z20",label:"¿Siente que debería hacer más de lo que hace?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z21",label:"¿Cree que podría cuidar mejor a su familiar?",opciones:[{valor:0,texto:"Nunca"},{valor:1,texto:"Rara vez"},{valor:2,texto:"Algunas veces"},{valor:3,texto:"Bastantes veces"},{valor:4,texto:"Casi siempre"}]},
      {id:"z22",label:"Globalmente, ¿cómo se siente de agobiado/a?",opciones:[{valor:0,texto:"Nada"},{valor:1,texto:"Un poco"},{valor:2,texto:"Bastante"},{valor:3,texto:"Mucho"},{valor:4,texto:"Muchísimo"}]},
    ],
    maxPuntos:88,
    interpretacion:(t)=>{
      if(t<47)  return {nivel:"No sobrecarga",color:C.success};
      if(t<=55) return {nivel:"Sobrecarga leve",color:C.warning};
      return {nivel:"Sobrecarga intensa",color:C.danger};
    }
  },
  morse:{
    id:"morse",nombre:"Escala de Morse",icono:"⚠️",color:"#E67E22",
    descripcion:"Riesgo de caídas",
    items:[
      {id:"caidas",label:"Historia de caídas en los últimos 3 meses",opciones:[{valor:0,texto:"No"},{valor:25,texto:"Sí"}]},
      {id:"diag",label:"Más de un diagnóstico médico",opciones:[{valor:0,texto:"No"},{valor:15,texto:"Sí"}]},
      {id:"ayuda",label:"Ayuda para la deambulación",opciones:[{valor:0,texto:"Ninguna/reposo/silla de ruedas"},{valor:15,texto:"Muletas/bastón/andador"},{valor:30,texto:"Se apoya en muebles"}]},
      {id:"terapia",label:"Terapia intravenosa / heparina",opciones:[{valor:0,texto:"No"},{valor:20,texto:"Sí"}]},
      {id:"marcha",label:"Estado de la marcha",opciones:[{valor:0,texto:"Normal/reposo/inmovilizado"},{valor:10,texto:"Débil"},{valor:20,texto:"Deteriorada"}]},
      {id:"mental",label:"Estado mental",opciones:[{valor:0,texto:"Orientado"},{valor:15,texto:"Sobrestima capacidad/olvida limitaciones"}]},
    ],
    maxPuntos:125,
    interpretacion:(t)=>{
      if(t<25)  return {nivel:"Riesgo bajo",color:C.success};
      if(t<=44) return {nivel:"Riesgo moderado",color:C.warning};
      return {nivel:"Riesgo alto",color:C.danger};
    }
  },
  mna:{
    id:"mna",nombre:"Mini Nutritional Assessment",icono:"🥗",color:"#00796B",
    descripcion:"Valoración nutricional en mayores",
    items:[
      {id:"imc",label:"Índice de Masa Corporal (IMC)",opciones:[{valor:0,texto:"IMC < 19"},{valor:1,texto:"19 ≤ IMC < 21"},{valor:2,texto:"21 ≤ IMC < 23"},{valor:3,texto:"IMC ≥ 23"}]},
      {id:"pantorrilla",label:"Circunferencia pantorrilla (cm)",opciones:[{valor:0,texto:"< 31 cm"},{valor:3,texto:"≥ 31 cm"}]},
      {id:"peso",label:"Pérdida de peso en últimas semanas",opciones:[{valor:0,texto:"Pérdida > 3 kg"},{valor:1,texto:"No sabe"},{valor:2,texto:"Pérdida 1-3 kg"},{valor:3,texto:"Sin pérdida"}]},
      {id:"movilidad",label:"Movilidad",opciones:[{valor:0,texto:"De la cama al sillón"},{valor:1,texto:"Autonomía en el interior"},{valor:2,texto:"Sale al exterior"}]},
      {id:"enfermedad",label:"Enfermedad aguda o estrés psicológico en últimas 3 semanas",opciones:[{valor:0,texto:"Sí"},{valor:2,texto:"No"}]},
      {id:"neuropsico",label:"Problemas neuropsicológicos",opciones:[{valor:0,texto:"Demencia o depresión grave"},{valor:1,texto:"Demencia leve"},{valor:2,texto:"Sin problemas"}]},
      {id:"apetito",label:"Disminución del apetito en últimas 3 semanas",opciones:[{valor:0,texto:"Pérdida severa"},{valor:1,texto:"Pérdida moderada"},{valor:2,texto:"Sin pérdida"}]},
    ],
    maxPuntos:14,
    interpretacion:(t)=>{
      if(t>=12) return {nivel:"Estado nutricional normal",color:C.success};
      if(t>=8)  return {nivel:"Riesgo de malnutrición",color:C.warning};
      return {nivel:"Malnutrición",color:C.danger};
    }
  },
  pfeiffer:{
    id:"pfeiffer",nombre:"Test de Pfeiffer",icono:"🧩",color:"#6A1B9A",
    descripcion:"Deterioro cognitivo",
    items:[
      {id:"fecha",label:"¿Qué fecha es hoy?",opciones:[{valor:0,texto:"Error"},{valor:1,texto:"Correcto"}]},
      {id:"diasem",label:"¿Qué día de la semana es?",opciones:[{valor:0,texto:"Error"},{valor:1,texto:"Correcto"}]},
      {id:"lugar",label:"¿Dónde estamos ahora?",opciones:[{valor:0,texto:"Error"},{valor:1,texto:"Correcto"}]},
      {id:"tel",label:"¿Cuál es su número de teléfono?",opciones:[{valor:0,texto:"Error"},{valor:1,texto:"Correcto"}]},
      {id:"edad",label:"¿Cuántos años tiene?",opciones:[{valor:0,texto:"Error"},{valor:1,texto:"Correcto"}]},
      {id:"nac",label:"¿Cuándo nació?",opciones:[{valor:0,texto:"Error"},{valor:1,texto:"Correcto"}]},
      {id:"pres",label:"¿Quién es el presidente del gobierno?",opciones:[{valor:0,texto:"Error"},{valor:1,texto:"Correcto"}]},
      {id:"presant",label:"¿Quién fue el presidente anterior?",opciones:[{valor:0,texto:"Error"},{valor:1,texto:"Correcto"}]},
      {id:"madre",label:"¿Cómo se llamaba su madre?",opciones:[{valor:0,texto:"Error"},{valor:1,texto:"Correcto"}]},
      {id:"resta",label:"Reste de 3 en 3 desde 20",opciones:[{valor:0,texto:"Error"},{valor:1,texto:"Correcto"}]},
    ],
    maxPuntos:10,
    interpretacion:(t)=>{
      const e=10-t;
      if(e<=2) return {nivel:"Sin deterioro cognitivo",color:C.success};
      if(e<=4) return {nivel:"Deterioro leve",color:C.warning};
      if(e<=7) return {nivel:"Deterioro moderado",color:C.accent};
      return {nivel:"Deterioro severo",color:C.danger};
    }
  },
};

// ─── PIE DIABÉTICO: 3 subformularios ─────────────────────────────────────────
// Tratado como escala especial con tipo "piediabetico"
const PIE_DIABETICO = {
  id:"piediabetico", nombre:"Pie Diabético", icono:"🦶", color:"#B71C1C",
  descripcion:"Exploración, autocuidado y educación terapéutica",
  esPieDiabetico: true,
  subformularios:[
    {
      id:"exploracion", nombre:"Exploración y Riesgo", icono:"🔬",
      descripcion:"Formulario 1/3 · Estratificación del pie de riesgo",
      items:[
        // Antecedentes (cada uno Si=1/No=0 — para el radar normalizamos sobre total)
        {id:"ulcera_prev",label:"Úlcera previa en pie",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"amputacion",label:"Amputación previa de miembro inferior",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"neuropatia",label:"Neuropatía diagnosticada",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"eap",label:"Enfermedad arterial periférica (EAP)",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"irc",label:"Insuficiencia renal crónica",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"retinopatia",label:"Retinopatía diabética",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        // Neuropatía
        {id:"parestesias",label:"Parestesias o disestesias en pies",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"dolor_neuro",label:"Dolor neuropático (quemazón, pinchazo nocturno)",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"monofilamento",label:"Monofilamento S-W 10g (peor pie)",opciones:[{valor:0,texto:"Alterado"},{valor:1,texto:"Normal"}]},
        {id:"diapason",label:"Diapasón 128 Hz (peor pie)",opciones:[{valor:0,texto:"Alterado"},{valor:1,texto:"Normal"}]},
        // EAP
        {id:"claudicacion",label:"Claudicación intermitente al caminar",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"pulso_tibial",label:"Pulso tibial posterior (peor pie)",opciones:[{valor:0,texto:"Ausente"},{valor:1,texto:"Débil"},{valor:2,texto:"Presente"}]},
        {id:"pulso_pedio",label:"Pulso pedio (peor pie)",opciones:[{valor:0,texto:"Ausente"},{valor:1,texto:"Débil"},{valor:2,texto:"Presente"}]},
        // Hábitos
        {id:"inspeccion",label:"Inspecciona los pies diariamente",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"calzado",label:"Usa calzado adecuado cerrado",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        // Exploración física
        {id:"callosidades",label:"Callosidades / hiperqueratosis",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"deformidad",label:"Deformidad: dedos en garra / hallux valgus",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"lesion",label:"Lesión o úlcera activa",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
      ],
      maxPuntos:20,
      interpretacion:(t)=>{
        if(t<=6)  return {nivel:"Riesgo ALTO — revisión 1-3 meses",color:C.danger};
        if(t<=13) return {nivel:"Riesgo MODERADO — revisión semestral",color:C.warning};
        return {nivel:"Riesgo BAJO — revisión anual",color:C.success};
      }
    },
    {
      id:"dfsq",nombre:"DFSQ-UMA Autocuidado",icono:"📋",
      descripcion:"Formulario 2/3 · Conocimientos sobre autocuidados del pie",
      items:[
        // Autocuidado personal (1-7)
        {id:"q1",label:"Inspecciono mis pies diariamente buscando heridas, ampollas o cambios",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q2",label:"Lavo mis pies diariamente con agua tibia y jabón suave",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q3",label:"Seco bien mis pies tras el lavado, especialmente entre los dedos",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q4",label:"Aplico crema hidratante (evitando espacio entre dedos)",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q5",label:"Corto o limo las uñas de forma recta, sin apurar las esquinas",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q6",label:"Consulto al profesional ante cualquier herida o lesión en los pies",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q7",label:"Evito caminar descalzo, incluso en casa",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        // Cuidado podológico (8-11)
        {id:"q8",label:"Acudo periódicamente al podólogo o servicio de cuidado de los pies",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q9",label:"Permito que el equipo sanitario me explore los pies en cada visita",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q10",label:"Trato los callos solo con productos recomendados por el profesional",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q11",label:"Evito calcetines con gomas o costuras que compriman los pies",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        // Calzado y medias (12-16)
        {id:"q12",label:"Uso calzado cerrado, transpirable y con puntera ancha",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q13",label:"Reviso el interior del calzado antes de ponerlo",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q14",label:"Estreno el calzado nuevo de forma progresiva",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q15",label:"Uso calcetines de materiales naturales sin costuras",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
        {id:"q16",label:"Cambio los calcetines a diario",opciones:[{valor:1,texto:"Nunca"},{valor:2,texto:"Raramente"},{valor:3,texto:"A veces"},{valor:4,texto:"A menudo"},{valor:5,texto:"Siempre"}]},
      ],
      maxPuntos:80,
      interpretacion:(t)=>{
        if(t>=61) return {nivel:"Nivel ALTO de autocuidado",color:C.success};
        if(t>=36) return {nivel:"Nivel MODERADO — reforzar áreas déficit",color:C.warning};
        return {nivel:"Nivel BAJO — intervenir todas las áreas",color:C.danger};
      }
    },
    {
      id:"educacion",nombre:"Educación Terapéutica",icono:"📚",
      descripcion:"Formulario 3/3 · Registro de sesión educativa",
      items:[
        // Tipo de ET
        {id:"tipo_ind",label:"Tipo ET: Individual (consulta presencial)",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"tipo_gru",label:"Tipo ET: Grupal (sesión grupal en CS)",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"tipo_fam",label:"Familiar / cuidador incluido",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        // Contenidos
        {id:"c_insp",label:"Contenido: Inspección diaria y zonas de riesgo",opciones:[{valor:0,texto:"No trabajado"},{valor:1,texto:"Trabajado"}]},
        {id:"c_hig",label:"Contenido: Higiene y secado correcto",opciones:[{valor:0,texto:"No trabajado"},{valor:1,texto:"Trabajado"}]},
        {id:"c_hidrat",label:"Contenido: Hidratación y corte de uñas",opciones:[{valor:0,texto:"No trabajado"},{valor:1,texto:"Trabajado"}]},
        {id:"c_calzado",label:"Contenido: Calzado adecuado y calcetines",opciones:[{valor:0,texto:"No trabajado"},{valor:1,texto:"Trabajado"}]},
        {id:"c_lesiones",label:"Contenido: Actuación ante lesiones",opciones:[{valor:0,texto:"No trabajado"},{valor:1,texto:"Trabajado"}]},
        {id:"c_actividad",label:"Contenido: Actividad física y hábitos",opciones:[{valor:0,texto:"No trabajado"},{valor:1,texto:"Trabajado"}]},
        // Resultados NOC
        {id:"noc_riesgo",label:"NOC 1902: Control del riesgo",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"noc_diabetes",label:"NOC 1619: Autocontrol diabetes",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        {id:"noc_conoc",label:"NOC 1820: Conocimiento control diabetes",opciones:[{valor:0,texto:"No"},{valor:1,texto:"Sí"}]},
        // Evaluación
        {id:"comprension",label:"Nivel de comprensión del paciente",opciones:[{valor:1,texto:"Bajo"},{valor:2,texto:"Medio"},{valor:3,texto:"Alto"}]},
        {id:"motivacion",label:"Grado de motivación del paciente",opciones:[{valor:1,texto:"Bajo"},{valor:2,texto:"Medio"},{valor:3,texto:"Alto"}]},
      ],
      maxPuntos:15,
      interpretacion:(t)=>{
        if(t>=12) return {nivel:"Sesión completa y efectiva",color:C.success};
        if(t>=7)  return {nivel:"Sesión parcial — reforzar",color:C.warning};
        return {nivel:"Sesión inicial — continuar",color:C.danger};
      }
    }
  ]
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const calcTotal=(escalaId,respuestas)=>{
  const esc=ESCALAS[escalaId]; if(!esc) return 0;
  return esc.items.reduce((s,item)=>s+(respuestas[item.id]??0),0);
};
const calcTotalSub=(sub,respuestas)=>sub.items.reduce((s,item)=>s+(respuestas[item.id]??0),0);
const formatDate=(iso)=>{if(!iso)return""; const d=new Date(iso); return d.toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"});};
const todayISO=()=>new Date().toISOString().split("T")[0];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function EnfescalSol(){
  // Login
  const [authed,setAuthed]=useState(()=>sessionStorage.getItem("enfescalsol_auth")==="1");
  const [pwInput,setPwInput]=useState("");
  const [pwError,setPwError]=useState(false);

  // App state
  const [view,setView]=useState("home");
  const [patients,setPatients]=useState(()=>{try{return JSON.parse(localStorage.getItem("enfescalsol_patients")||"[]");}catch{return[];}});
  const [selectedPatient,setSelectedPatient]=useState(null);
  const [selectedEscala,setSelectedEscala]=useState(null);
  const [currentValoration,setCurrentValoration]=useState({});
  const [showNewPatient,setShowNewPatient]=useState(false);
  const [newPatient,setNewPatient]=useState({nombre:"",nhc:"",nacimiento:"",sexo:"",centro:""});
  const [toast,setToast]=useState(null);
  const [confirmDelete,setConfirmDelete]=useState(null);
  // Pie diabético
  const [pieSub,setPieSub]=useState(null); // null | "exploracion"|"dfsq"|"educacion"
  const [pieRespuestas,setPieRespuestas]=useState({});

  useEffect(()=>{try{localStorage.setItem("enfescalsol_patients",JSON.stringify(patients));}catch{};},[patients]);

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),2800);};

  const handleLogin=()=>{
    if(pwInput===ACCESS_PASSWORD){sessionStorage.setItem("enfescalsol_auth","1");setAuthed(true);setPwError(false);}
    else{setPwError(true);setPwInput("");}
  };

  const addPatient=()=>{
    if(!newPatient.nombre.trim()||!newPatient.nhc.trim()){showToast("Nombre y NHC son obligatorios","error");return;}
    const p={...newPatient,id:Date.now().toString(),valoraciones:{},pieDiabetico:[]};
    setPatients(prev=>[p,...prev]);
    setNewPatient({nombre:"",nhc:"",nacimiento:"",sexo:"",centro:""});
    setShowNewPatient(false);showToast("Paciente añadido");
  };

  const saveValoration=()=>{
    const total=calcTotal(selectedEscala,currentValoration);
    const entry={fecha:todayISO(),respuestas:{...currentValoration},total};
    setPatients(prev=>prev.map(p=>{
      if(p.id!==selectedPatient.id)return p;
      const vals=p.valoraciones[selectedEscala]||[];
      return{...p,valoraciones:{...p.valoraciones,[selectedEscala]:[entry,...vals]}};
    }));
    setSelectedPatient(prev=>({...prev,valoraciones:{...prev.valoraciones,[selectedEscala]:[entry,...(prev.valoraciones[selectedEscala]||[])]}}));
    setCurrentValoration({});setView("patient");showToast("Valoración guardada ✓");
  };

  const savePieValoration=(subId,respuestas,sub)=>{
    const total=calcTotalSub(sub,respuestas);
    const entry={fecha:todayISO(),respuestas:{...respuestas},total,subId};
    setPatients(prev=>prev.map(p=>{
      if(p.id!==selectedPatient.id)return p;
      const prev2=(p.pieDiabetico||[]);
      // Añadir al historial de ese subformulario
      const prevSub=prev2.filter(e=>e.subId===subId);
      const otherSubs=prev2.filter(e=>e.subId!==subId);
      return{...p,pieDiabetico:[entry,...prevSub,...otherSubs]};
    }));
    setSelectedPatient(prev=>({
      ...prev,
      pieDiabetico:[entry,...(prev.pieDiabetico||[]).filter(e=>e.subId!==subId),...(prev.pieDiabetico||[]).filter(e=>e.subId===subId)]
    }));
    setPieSub(null);setPieRespuestas({});showToast("Valoración pie guardada ✓");
  };

  // ─── LOGIN SCREEN ─────────────────────────────────────────────────────────
  const renderLogin=()=>(
    <div style={{minHeight:"100vh",background:`linear-gradient(145deg,${C.primary} 0%,${C.primaryDark} 50%,#004D1A 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem 1.5rem"}}>
      <div style={{fontSize:"3rem",marginBottom:"0.5rem"}}>🌿</div>
      <h1 style={{fontSize:"2rem",fontWeight:"800",color:"white",margin:"0 0 0.3rem",fontFamily:"Georgia,serif"}}>
        Enfe<span style={{color:C.accentLight}}>scal</span>Sol
      </h1>
      <p style={{color:"rgba(255,255,255,0.7)",fontSize:"0.78rem",letterSpacing:"1.5px",textTransform:"uppercase",margin:"0 0 2.5rem"}}>Sistema Sanitario Público de Andalucía</p>
      <div style={{background:"white",borderRadius:"20px",padding:"1.8rem",width:"100%",maxWidth:"340px",boxShadow:"0 8px 40px rgba(0,0,0,0.3)"}}>
        <h2 style={{margin:"0 0 1.2rem",fontSize:"1rem",color:C.text,textAlign:"center"}}>🔐 Acceso restringido</h2>
        <label style={{fontSize:"0.78rem",color:C.textMuted,display:"block",marginBottom:"0.4rem"}}>Clave de acceso</label>
        <input
          type="password" value={pwInput}
          onChange={e=>{setPwInput(e.target.value);setPwError(false);}}
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          placeholder="Introduce la clave..."
          style={{width:"100%",boxSizing:"border-box",padding:"0.8rem",borderRadius:"10px",border:`2px solid ${pwError?C.danger:C.border}`,fontSize:"1rem",outline:"none",marginBottom:"0.4rem"}}
        />
        {pwError&&<p style={{color:C.danger,fontSize:"0.78rem",margin:"0 0 0.8rem"}}>⚠️ Clave incorrecta</p>}
        <button onClick={handleLogin}
          style={{width:"100%",padding:"0.9rem",borderRadius:"12px",border:"none",background:C.primary,color:"white",fontWeight:"700",fontSize:"1rem",cursor:"pointer",marginTop:"0.5rem"}}>
          Entrar →
        </button>
      </div>
      <p style={{color:"rgba(255,255,255,0.4)",fontSize:"0.7rem",marginTop:"2rem",textAlign:"center"}}>
        doncelproject · HUCS · Atención Primaria
      </p>
    </div>
  );

  // ─── HOME ─────────────────────────────────────────────────────────────────
  const renderHome=()=>(
    <div style={{minHeight:"100vh",background:`linear-gradient(145deg,${C.primary} 0%,${C.primaryDark} 45%,#004D1A 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem 1.5rem",color:"white"}}>
      <div style={{textAlign:"center",marginBottom:"2rem"}}>
        <div style={{fontSize:"3.2rem",marginBottom:"0.4rem"}}>🌿</div>
        <h1 style={{fontSize:"2.2rem",fontWeight:"800",letterSpacing:"-1px",margin:0,fontFamily:"Georgia,serif"}}>
          Enfe<span style={{color:C.accentLight}}>scal</span>Sol
        </h1>
        <p style={{margin:"0.3rem 0 0",fontSize:"0.78rem",opacity:0.8,letterSpacing:"2px",textTransform:"uppercase"}}>Escalas de Valoración Enfermera</p>
        <p style={{margin:"0.2rem 0 0",fontSize:"0.7rem",opacity:0.6}}>Sistema Sanitario Público de Andalucía · Atención Primaria</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.8rem",width:"100%",maxWidth:"380px",marginBottom:"1rem"}}>
        {Object.values(ESCALAS).map(esc=>(
          <div key={esc.id} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",borderRadius:"14px",padding:"0.9rem",border:"1px solid rgba(255,255,255,0.2)",textAlign:"center"}}>
            <div style={{fontSize:"1.4rem"}}>{esc.icono}</div>
            <div style={{fontSize:"0.68rem",fontWeight:"600",marginTop:"0.3rem",opacity:0.9,lineHeight:1.3}}>{esc.nombre}</div>
          </div>
        ))}
        {/* Pie Diabético */}
        <div style={{background:"rgba(183,28,28,0.3)",backdropFilter:"blur(10px)",borderRadius:"14px",padding:"0.9rem",border:"1px solid rgba(255,255,255,0.25)",textAlign:"center",gridColumn:"span 2"}}>
          <div style={{fontSize:"1.4rem"}}>🦶</div>
          <div style={{fontSize:"0.72rem",fontWeight:"700",marginTop:"0.3rem",opacity:0.95}}>Valoración Pie Diabético</div>
          <div style={{fontSize:"0.6rem",opacity:0.7,marginTop:"0.15rem"}}>Exploración · DFSQ-UMA · Educación Terapéutica</div>
        </div>
      </div>
      <button onClick={()=>setView("patients")}
        style={{background:C.accent,color:"#1A2E1F",border:"none",borderRadius:"50px",padding:"1rem 2.5rem",fontSize:"1rem",fontWeight:"800",cursor:"pointer",boxShadow:`0 4px 20px rgba(232,180,0,0.5)`,marginBottom:"2.5rem"}}>
        Acceder →
      </button>

      {/* Footer DoncelProject */}
      <div style={{textAlign:"center",borderTop:"1px solid rgba(255,255,255,0.15)",paddingTop:"1.5rem",width:"100%",maxWidth:"380px"}}>
        {/* Logo DoncelProject SVG inline (isologotipo DP) */}
        <div style={{marginBottom:"0.6rem"}}>
          <svg width="48" height="48" viewBox="0 0 100 100" style={{filter:"drop-shadow(0 2px 8px rgba(0,150,255,0.4))"}}>
            <defs>
              <linearGradient id="dpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00B4FF"/>
                <stop offset="100%" stopColor="#0055CC"/>
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="22" fill="url(#dpGrad)"/>
            {/* D */}
            <path d="M18 25 L18 75 L38 75 Q58 75 58 50 Q58 25 38 25 Z M28 35 L36 35 Q48 35 48 50 Q48 65 36 65 L28 65 Z" fill="white"/>
            {/* P con slash */}
            <path d="M62 25 L62 75 L72 75 L72 55 L80 55 Q95 55 95 40 Q95 25 80 25 Z M72 35 L79 35 Q85 35 85 40 Q85 46 79 46 L72 46 Z" fill="white"/>
            <line x1="85" y1="70" x2="70" y2="55" stroke="rgba(255,255,255,0.5)" strokeWidth="3"/>
          </svg>
        </div>
        <div style={{fontSize:"0.82rem",fontWeight:"700",color:"white",letterSpacing:"1px"}}>
          doncel<span style={{color:"#60C8FF"}}>project</span>
        </div>
        <p style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)",margin:"0.3rem 0 0.8rem"}}>
          Herramientas digitales para la salud
        </p>
        <a href="mailto:doncel.project@gmail.com"
          style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:"50px",padding:"0.5rem 1.2rem",color:"white",textDecoration:"none",fontSize:"0.75rem",fontWeight:"600"}}>
          ✉️ doncel.project@gmail.com
        </a>
        <p style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)",margin:"0.8rem 0 0"}}>
          EnfescalSol v1.0 · DIRAYAbierto 2024 · SSPA
        </p>
      </div>
    </div>
  );

  // ─── PATIENTS LIST ────────────────────────────────────────────────────────
  const renderPatients=()=>(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:`linear-gradient(90deg,${C.primary},${C.secondary})`,padding:"1.2rem 1rem 1rem",color:"white"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>setView("home")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:"8px",padding:"0.4rem 0.8rem",cursor:"pointer",fontSize:"0.85rem"}}>← Inicio</button>
          <h2 style={{margin:0,fontSize:"1.1rem",fontWeight:"700"}}>Mis Pacientes</h2>
          <button onClick={()=>setShowNewPatient(true)} style={{background:C.accent,border:"none",color:C.text,borderRadius:"8px",padding:"0.4rem 0.9rem",cursor:"pointer",fontSize:"1.2rem",fontWeight:"700"}}>+</button>
        </div>
      </div>

      {showNewPatient&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
          <div style={{background:"white",borderRadius:"20px 20px 0 0",padding:"1.5rem",width:"100%",boxSizing:"border-box"}}>
            <h3 style={{margin:"0 0 1rem",color:C.text}}>Nuevo Paciente</h3>
            {[{key:"nombre",label:"Nombre y apellidos *",type:"text"},{key:"nhc",label:"Nº Historia Clínica (NHC) *",type:"text"},{key:"nacimiento",label:"Fecha de nacimiento",type:"date"},{key:"centro",label:"Centro de salud",type:"text"}].map(f=>(
              <div key={f.key} style={{marginBottom:"0.7rem"}}>
                <label style={{fontSize:"0.78rem",color:C.textMuted,display:"block",marginBottom:"0.2rem"}}>{f.label}</label>
                <input type={f.type} value={newPatient[f.key]} onChange={e=>setNewPatient(p=>({...p,[f.key]:e.target.value}))}
                  style={{width:"100%",boxSizing:"border-box",padding:"0.7rem",borderRadius:"10px",border:`1px solid ${C.border}`,fontSize:"0.95rem"}}/>
              </div>
            ))}
            <div style={{marginBottom:"0.7rem"}}>
              <label style={{fontSize:"0.78rem",color:C.textMuted,display:"block",marginBottom:"0.2rem"}}>Sexo</label>
              <div style={{display:"flex",gap:"0.5rem"}}>
                {["Masculino","Femenino","Otro"].map(s=>(
                  <button key={s} onClick={()=>setNewPatient(p=>({...p,sexo:s}))}
                    style={{flex:1,padding:"0.6rem",borderRadius:"8px",border:`2px solid ${newPatient.sexo===s?C.primary:C.border}`,background:newPatient.sexo===s?C.surfaceAlt:"white",cursor:"pointer",fontSize:"0.8rem",color:C.text}}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:"0.7rem",marginTop:"1rem"}}>
              <button onClick={()=>setShowNewPatient(false)} style={{flex:1,padding:"0.8rem",borderRadius:"10px",border:`1px solid ${C.border}`,background:"white",cursor:"pointer",color:C.textMuted}}>Cancelar</button>
              <button onClick={addPatient} style={{flex:2,padding:"0.8rem",borderRadius:"10px",border:"none",background:C.primary,color:"white",cursor:"pointer",fontWeight:"700"}}>Añadir Paciente</button>
            </div>
          </div>
        </div>
      )}

      <div style={{padding:"1rem"}}>
        {patients.length===0?(
          <div style={{textAlign:"center",padding:"4rem 1rem",color:C.textMuted}}>
            <div style={{fontSize:"3rem",marginBottom:"1rem"}}>👤</div>
            <p style={{fontSize:"1rem",margin:0}}>No hay pacientes registrados</p>
            <p style={{fontSize:"0.85rem",marginTop:"0.5rem"}}>Pulsa + para añadir el primero</p>
          </div>
        ):patients.map(p=>{
          const nVals=Object.values(p.valoraciones||{}).reduce((s,arr)=>s+arr.length,0)+(p.pieDiabetico||[]).length;
          return(
            <div key={p.id} onClick={()=>{setSelectedPatient(p);setView("patient");}}
              style={{background:"white",borderRadius:"14px",padding:"1rem 1.2rem",marginBottom:"0.8rem",boxShadow:"0 2px 8px rgba(0,100,0,0.08)",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:"1rem",cursor:"pointer"}}>
              <div style={{width:"44px",height:"44px",borderRadius:"50%",background:`linear-gradient(135deg,${C.primary},${C.secondary})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"700",fontSize:"1.1rem",flexShrink:0}}>
                {p.nombre.charAt(0).toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:"700",color:C.text,fontSize:"0.95rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.nombre}</div>
                <div style={{fontSize:"0.75rem",color:C.textMuted}}>NHC: {p.nhc}{p.nacimiento&&` · ${new Date().getFullYear()-new Date(p.nacimiento).getFullYear()} años`}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:"1.1rem",fontWeight:"700",color:C.primary}}>{nVals}</div>
                <div style={{fontSize:"0.65rem",color:C.textMuted}}>valorac.</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── PATIENT DETAIL ───────────────────────────────────────────────────────
  const renderPatient=()=>{
    if(!selectedPatient)return null;
    const p=patients.find(x=>x.id===selectedPatient.id)||selectedPatient;
    const edad=p.nacimiento?new Date().getFullYear()-new Date(p.nacimiento).getFullYear():null;

    return(
      <div style={{minHeight:"100vh",background:C.bg}}>
        <div style={{background:`linear-gradient(90deg,${C.primary},${C.secondary})`,padding:"1.2rem 1rem 1.5rem",color:"white"}}>
          <button onClick={()=>setView("patients")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:"8px",padding:"0.4rem 0.8rem",cursor:"pointer",fontSize:"0.85rem",marginBottom:"0.8rem"}}>← Pacientes</button>
          <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
            <div style={{width:"52px",height:"52px",borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",fontWeight:"700",border:"2px solid rgba(255,255,255,0.5)"}}>
              {p.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{margin:0,fontSize:"1.15rem",fontWeight:"800"}}>{p.nombre}</h2>
              <p style={{margin:"0.2rem 0 0",fontSize:"0.8rem",opacity:0.85}}>NHC: <strong>{p.nhc}</strong>{edad&&` · ${edad} años`}{p.centro&&` · ${p.centro}`}</p>
            </div>
          </div>
        </div>

        <div style={{padding:"1rem"}}>
          {/* ── ESCALAS SIN VALORAR ── */}
          <h3 style={{margin:"0 0 0.7rem",fontSize:"0.72rem",color:C.textMuted,textTransform:"uppercase",letterSpacing:"1px"}}>Escalas de Valoración</h3>
          {Object.values(ESCALAS).some(esc=>(p.valoraciones[esc.id]||[]).length===0)&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"1rem"}}>
              {Object.values(ESCALAS).filter(esc=>(p.valoraciones[esc.id]||[]).length===0).map(esc=>(
                <div key={esc.id} onClick={()=>{setSelectedEscala(esc.id);setCurrentValoration({});setView("escala");}}
                  style={{background:"white",borderRadius:"12px",padding:"0.8rem",boxShadow:"0 1px 6px rgba(0,100,0,0.06)",border:`1px solid ${C.border}`,cursor:"pointer",borderTop:`3px solid ${esc.color}`,display:"flex",alignItems:"center",gap:"0.6rem"}}>
                  <span style={{fontSize:"1.2rem"}}>{esc.icono}</span>
                  <div>
                    <div style={{fontSize:"0.7rem",fontWeight:"700",color:C.text,lineHeight:1.3}}>{esc.nombre}</div>
                    <div style={{fontSize:"0.6rem",color:C.textMuted,marginTop:"0.1rem"}}>Sin valorar · Pulsa para iniciar</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ESCALAS CON VALORACIONES (radar por ítems) ── */}
          {Object.values(ESCALAS).filter(esc=>(p.valoraciones[esc.id]||[]).length>0).map(esc=>{
            const vList=p.valoraciones[esc.id]||[];
            const last=vList[0]; const prev=vList[1];
            const interp=esc.interpretacion(last.total);
            const radarItems=esc.items.map(item=>{
              const maxItem=Math.max(...item.opciones.map(o=>o.valor));
              const label=item.label.split(" ").slice(0,2).join(" ");
              return{label,actual:maxItem>0?Math.round(((last.respuestas[item.id]??0)/maxItem)*100):0,anterior:prev&&maxItem>0?Math.round(((prev.respuestas[item.id]??0)/maxItem)*100):null};
            });
            return(
              <div key={esc.id} style={{background:"white",borderRadius:"14px",marginBottom:"1rem",boxShadow:"0 2px 10px rgba(0,100,0,0.08)",border:`1px solid ${C.border}`,overflow:"hidden"}}>
                <div style={{background:`${esc.color}15`,borderBottom:`1px solid ${esc.color}30`,padding:"0.8rem 1rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                    <span style={{fontSize:"1.2rem"}}>{esc.icono}</span>
                    <div>
                      <div style={{fontSize:"0.82rem",fontWeight:"800",color:C.text}}>{esc.nombre}</div>
                      <div style={{fontSize:"0.62rem",color:C.textMuted}}>{esc.descripcion}</div>
                    </div>
                  </div>
                  <button onClick={()=>{setSelectedEscala(esc.id);setCurrentValoration({});setView("escala");}}
                    style={{background:esc.color,border:"none",color:"white",borderRadius:"8px",padding:"0.35rem 0.7rem",fontSize:"0.72rem",fontWeight:"700",cursor:"pointer",flexShrink:0}}>+ Nueva</button>
                </div>
                <div style={{padding:"0.8rem 1rem"}}>
                  <div style={{display:"flex",gap:"0.6rem",marginBottom:"0.7rem"}}>
                    <div style={{flex:1,background:`${esc.color}12`,borderRadius:"10px",padding:"0.6rem 0.8rem",borderLeft:`3px solid ${esc.color}`}}>
                      <div style={{fontSize:"0.6rem",color:C.textMuted}}>ÚLTIMA · {formatDate(last.fecha)}</div>
                      <div style={{fontSize:"1.5rem",fontWeight:"800",color:esc.color,lineHeight:1}}>{last.total}</div>
                      <div style={{fontSize:"0.62rem",color:interp.color,fontWeight:"700",marginTop:"0.2rem"}}>{interp.nivel}</div>
                    </div>
                    {prev&&(
                      <div style={{flex:1,background:"#F5F5F5",borderRadius:"10px",padding:"0.6rem 0.8rem",borderLeft:`3px solid ${C.border}`}}>
                        <div style={{fontSize:"0.6rem",color:C.textMuted}}>ANTERIOR · {formatDate(prev.fecha)}</div>
                        <div style={{fontSize:"1.5rem",fontWeight:"800",color:C.textMuted,lineHeight:1}}>{prev.total}</div>
                        <div style={{fontSize:"0.62rem",color:esc.interpretacion(prev.total).color,fontWeight:"700",marginTop:"0.2rem"}}>{esc.interpretacion(prev.total).nivel}</div>
                      </div>
                    )}
                  </div>
                  {prev&&<div style={{display:"flex",gap:"0.8rem",justifyContent:"center",marginBottom:"0.3rem"}}>
                    <span style={{fontSize:"0.62rem",color:C.textMuted,display:"flex",alignItems:"center",gap:"0.3rem"}}><span style={{display:"inline-block",width:10,height:3,background:esc.color,borderRadius:2}}/>Última</span>
                    <span style={{fontSize:"0.62rem",color:C.textMuted,display:"flex",alignItems:"center",gap:"0.3rem"}}><span style={{display:"inline-block",width:10,height:2,background:C.accentLight,borderRadius:2}}/>Anterior</span>
                  </div>}
                  <ResponsiveContainer width="100%" height={190}>
                    <RadarChart data={radarItems} margin={{top:8,right:18,bottom:8,left:18}}>
                      <PolarGrid stroke={`${esc.color}30`}/>
                      <PolarAngleAxis dataKey="label" tick={{fill:C.textMuted,fontSize:9,fontWeight:500}} tickLine={false}/>
                      <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} tickCount={3}/>
                      <Radar name="Última" dataKey="actual" stroke={esc.color} fill={esc.color} fillOpacity={0.3} strokeWidth={2} dot={{fill:esc.color,r:2}}/>
                      {prev&&<Radar name="Anterior" dataKey="anterior" stroke={C.accentLight} fill={C.accentLight} fillOpacity={0.15} strokeWidth={1.5} strokeDasharray="4 3" dot={{fill:C.accentLight,r:2}}/>}
                      <Tooltip formatter={(v,n)=>[`${v}%`,n]} contentStyle={{fontSize:"0.75rem",borderRadius:"8px",border:`1px solid ${C.border}`}}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}

          {/* ── PIE DIABÉTICO ── */}
          <h3 style={{margin:"1rem 0 0.7rem",fontSize:"0.72rem",color:C.textMuted,textTransform:"uppercase",letterSpacing:"1px"}}>🦶 Valoración Pie Diabético</h3>
          <div style={{background:"white",borderRadius:"14px",marginBottom:"1rem",boxShadow:"0 2px 10px rgba(183,28,28,0.08)",border:"1px solid #FFCDD2",overflow:"hidden"}}>
            <div style={{background:"#B71C1C15",borderBottom:"1px solid #FFCDD2",padding:"0.8rem 1rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                <span style={{fontSize:"1.3rem"}}>🦶</span>
                <div>
                  <div style={{fontSize:"0.85rem",fontWeight:"800",color:C.text}}>Pie Diabético</div>
                  <div style={{fontSize:"0.62rem",color:C.textMuted}}>3 formularios · Exploración · DFSQ-UMA · ET</div>
                </div>
              </div>
            </div>
            <div style={{padding:"0.8rem 1rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.5rem"}}>
                {PIE_DIABETICO.subformularios.map(sub=>{
                  const hist=(p.pieDiabetico||[]).filter(e=>e.subId===sub.id);
                  const last=hist[0]; const prev2=hist[1];
                  const interp=last?sub.interpretacion(last.total):null;
                  return(
                    <div key={sub.id} onClick={()=>{setPieSub(sub.id);setPieRespuestas({});setView("piediabetico");}}
                      style={{background:last?"#FFF8F8":"#FAFAFA",borderRadius:"10px",padding:"0.7rem 0.5rem",textAlign:"center",cursor:"pointer",border:`2px solid ${last?"#FFCDD2":C.border}`,borderTop:`3px solid #B71C1C`}}>
                      <div style={{fontSize:"1.2rem"}}>{sub.icono}</div>
                      <div style={{fontSize:"0.6rem",fontWeight:"700",color:C.text,lineHeight:1.3,margin:"0.2rem 0"}}>{sub.nombre}</div>
                      {last?(
                        <>
                          <div style={{fontSize:"1rem",fontWeight:"800",color:"#B71C1C"}}>{last.total}</div>
                          <div style={{fontSize:"0.55rem",color:interp.color,fontWeight:"700"}}>{interp.nivel.split("—")[0]}</div>
                          <div style={{fontSize:"0.55rem",color:C.textMuted}}>{formatDate(last.fecha)}</div>
                        </>
                      ):<div style={{fontSize:"0.6rem",color:C.textMuted,marginTop:"0.3rem"}}>Sin valorar</div>}
                    </div>
                  );
                })}
              </div>

              {/* Radar de araña pie diabético (si hay al menos un subformulario valorado) */}
              {PIE_DIABETICO.subformularios.some(sub=>(p.pieDiabetico||[]).filter(e=>e.subId===sub.id).length>0)&&(()=>{
                const radarPie=PIE_DIABETICO.subformularios.map(sub=>{
                  const hist=(p.pieDiabetico||[]).filter(e=>e.subId===sub.id);
                  const last=hist[0]; const prev2=hist[1];
                  const pct=last?Math.round((last.total/sub.maxPuntos)*100):0;
                  const pct2=prev2?Math.round((prev2.total/sub.maxPuntos)*100):null;
                  return{label:sub.nombre.split(" ")[0],actual:pct,anterior:pct2};
                });
                const hayPrev=radarPie.some(r=>r.anterior!==null);
                return(
                  <div style={{marginTop:"0.8rem"}}>
                    {hayPrev&&<div style={{display:"flex",gap:"0.8rem",justifyContent:"center",marginBottom:"0.3rem"}}>
                      <span style={{fontSize:"0.62rem",color:C.textMuted,display:"flex",alignItems:"center",gap:"0.3rem"}}><span style={{display:"inline-block",width:10,height:3,background:"#B71C1C",borderRadius:2}}/>Última</span>
                      <span style={{fontSize:"0.62rem",color:C.textMuted,display:"flex",alignItems:"center",gap:"0.3rem"}}><span style={{display:"inline-block",width:10,height:2,background:C.accentLight,borderRadius:2}}/>Anterior</span>
                    </div>}
                    <ResponsiveContainer width="100%" height={180}>
                      <RadarChart data={radarPie} margin={{top:8,right:18,bottom:8,left:18}}>
                        <PolarGrid stroke="#FFCDD2"/>
                        <PolarAngleAxis dataKey="label" tick={{fill:C.textMuted,fontSize:9}} tickLine={false}/>
                        <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                        <Radar name="Última" dataKey="actual" stroke="#B71C1C" fill="#B71C1C" fillOpacity={0.3} strokeWidth={2} dot={{fill:"#B71C1C",r:3}}/>
                        {hayPrev&&<Radar name="Anterior" dataKey="anterior" stroke={C.accentLight} fill={C.accentLight} fillOpacity={0.15} strokeWidth={1.5} strokeDasharray="4 3"/>}
                        <Tooltip formatter={(v,n)=>[`${v}%`,n]} contentStyle={{fontSize:"0.75rem",borderRadius:"8px"}}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ── PANEL EXPORTACIÓN ── */}
          <div style={{background:"white",borderRadius:"14px",padding:"1rem",marginTop:"0.5rem",boxShadow:"0 2px 8px rgba(0,100,0,0.07)"}}>
            <p style={{margin:"0 0 0.7rem",fontSize:"0.72rem",fontWeight:"700",color:C.textMuted,textTransform:"uppercase",letterSpacing:"1px"}}>Exportar informe</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem"}}>
              <button onClick={()=>exportarDOCX(p,ESCALAS)}
                style={{padding:"0.75rem 0.5rem",borderRadius:"10px",border:"2px solid #2B579A",background:"#EBF0FA",cursor:"pointer",color:"#2B579A",fontWeight:"700",fontSize:"0.82rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem"}}>
                <span style={{fontSize:"1.3rem"}}>📄</span><span>Word (.docx)</span>
              </button>
              <button onClick={()=>exportarODT(p,ESCALAS)}
                style={{padding:"0.75rem 0.5rem",borderRadius:"10px",border:"2px solid #2D7E31",background:"#EAF5EA",cursor:"pointer",color:"#2D7E31",fontWeight:"700",fontSize:"0.82rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem"}}>
                <span style={{fontSize:"1.3rem"}}>📋</span><span>LibreOffice (.odt)</span>
              </button>
              <button onClick={()=>{setTimeout(()=>window.print(),200);}}
                style={{padding:"0.75rem 0.5rem",borderRadius:"10px",border:`2px solid ${C.primary}`,background:C.surfaceAlt,cursor:"pointer",color:C.primary,fontWeight:"700",fontSize:"0.82rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem"}}>
                <span style={{fontSize:"1.3rem"}}>🖨️</span><span>Imprimir / PDF</span>
              </button>
              <button onClick={()=>setConfirmDelete(p.id)}
                style={{padding:"0.75rem 0.5rem",borderRadius:"10px",border:`2px solid ${C.danger}`,background:"#FEF0F0",cursor:"pointer",color:C.danger,fontWeight:"700",fontSize:"0.82rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem"}}>
                <span style={{fontSize:"1.3rem"}}>🗑️</span><span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>

        {confirmDelete&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
            <div style={{background:"white",borderRadius:"16px",padding:"1.5rem",maxWidth:"320px",width:"100%"}}>
              <h3 style={{margin:"0 0 0.5rem",color:C.text}}>¿Eliminar paciente?</h3>
              <p style={{fontSize:"0.85rem",color:C.textMuted,margin:"0 0 1.2rem"}}>Esta acción no se puede deshacer.</p>
              <div style={{display:"flex",gap:"0.7rem"}}>
                <button onClick={()=>setConfirmDelete(null)} style={{flex:1,padding:"0.8rem",borderRadius:"10px",border:`1px solid ${C.border}`,background:"white",cursor:"pointer"}}>Cancelar</button>
                <button onClick={()=>{setPatients(prev=>prev.filter(x=>x.id!==p.id));setConfirmDelete(null);setView("patients");showToast("Eliminado","info");}}
                  style={{flex:1,padding:"0.8rem",borderRadius:"10px",border:"none",background:C.danger,color:"white",cursor:"pointer",fontWeight:"700"}}>Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── ESCALA INDIVIDUAL ────────────────────────────────────────────────────
  const renderEscala=()=>{
    const esc=ESCALAS[selectedEscala];
    if(!esc||!selectedPatient)return null;
    const p=patients.find(x=>x.id===selectedPatient.id)||selectedPatient;
    const total=calcTotal(selectedEscala,currentValoration);
    const completado=esc.items.every(item=>currentValoration[item.id]!==undefined);
    const interp=completado?esc.interpretacion(total):null;
    const vList=p.valoraciones[selectedEscala]||[];

    return(
      <div style={{minHeight:"100vh",background:C.bg,paddingBottom:"6rem"}}>
        <div style={{background:`linear-gradient(90deg,${esc.color},${C.secondary})`,padding:"1.2rem 1rem 1rem",color:"white"}}>
          <button onClick={()=>setView("patient")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:"8px",padding:"0.4rem 0.8rem",cursor:"pointer",fontSize:"0.85rem",marginBottom:"0.5rem"}}>← {p.nombre.split(" ")[0]}</button>
          <div style={{display:"flex",alignItems:"center",gap:"0.7rem"}}>
            <span style={{fontSize:"1.5rem"}}>{esc.icono}</span>
            <div><h2 style={{margin:0,fontSize:"1rem",fontWeight:"800"}}>{esc.nombre}</h2><p style={{margin:"0.1rem 0 0",fontSize:"0.75rem",opacity:0.85}}>{esc.descripcion}</p></div>
          </div>
        </div>

        {vList.length>=1&&(
          <div style={{margin:"1rem 1rem 0",background:"white",borderRadius:"14px",padding:"1rem",boxShadow:"0 2px 8px rgba(0,100,0,0.07)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.5rem"}}>
              <h4 style={{margin:0,fontSize:"0.82rem",color:C.text}}>📊 Perfil por ítems {vList.length>1?`— ${vList.length} valoraciones`:""}</h4>
              {vList.length>1&&<div style={{display:"flex",gap:"0.6rem"}}>
                <span style={{fontSize:"0.62rem",color:C.textMuted,display:"flex",alignItems:"center",gap:"0.25rem"}}><span style={{display:"inline-block",width:10,height:3,background:esc.color,borderRadius:2}}/>Última</span>
                <span style={{fontSize:"0.62rem",color:C.textMuted,display:"flex",alignItems:"center",gap:"0.25rem"}}><span style={{display:"inline-block",width:10,height:2,background:C.accentLight,borderRadius:2}}/>Anterior</span>
              </div>}
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={esc.items.map(item=>{
                const maxItem=Math.max(...item.opciones.map(o=>o.valor));
                const label=item.label.split(" ").slice(0,2).join(" ");
                return{label,actual:maxItem>0?Math.round(((vList[0].respuestas[item.id]??0)/maxItem)*100):0,anterior:vList[1]&&maxItem>0?Math.round(((vList[1].respuestas[item.id]??0)/maxItem)*100):null};
              })} margin={{top:10,right:20,bottom:10,left:20}}>
                <PolarGrid stroke={`${esc.color}35`}/>
                <PolarAngleAxis dataKey="label" tick={{fill:C.textMuted,fontSize:9,fontWeight:500}} tickLine={false}/>
                <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} tickCount={3}/>
                <Radar name="Última" dataKey="actual" stroke={esc.color} fill={esc.color} fillOpacity={0.3} strokeWidth={2} dot={{fill:esc.color,r:3}}/>
                {vList.length>1&&<Radar name="Anterior" dataKey="anterior" stroke={C.accentLight} fill={C.accentLight} fillOpacity={0.15} strokeWidth={1.5} strokeDasharray="4 3" dot={{fill:C.accentLight,r:2}}/>}
                <Tooltip formatter={(v,n)=>[`${v}% del máx.`,n]} contentStyle={{fontSize:"0.75rem",borderRadius:"8px",border:`1px solid ${C.border}`}}/>
              </RadarChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:"0.5rem",overflowX:"auto",paddingBottom:"0.3rem"}}>
              {vList.slice(0,5).map((v,i)=>{const ip=esc.interpretacion(v.total);return(
                <div key={i} style={{flexShrink:0,borderRadius:"9px",padding:"0.45rem 0.7rem",textAlign:"center",minWidth:"70px",background:i===0?`${esc.color}15`:"#F5F7FA",borderLeft:`3px solid ${i===0?esc.color:ip.color}`}}>
                  <div style={{fontSize:"1rem",fontWeight:"800",color:i===0?esc.color:C.textMuted}}>{v.total}</div>
                  <div style={{fontSize:"0.55rem",color:ip.color,fontWeight:"600"}}>{ip.nivel.split(" ").slice(-1)[0]}</div>
                  <div style={{fontSize:"0.55rem",color:C.textMuted}}>{formatDate(v.fecha)}</div>
                </div>
              );})}
            </div>
          </div>
        )}

        <div style={{padding:"1rem"}}>
          {esc.items.map((item,idx)=>{
            const sel=currentValoration[item.id]!==undefined;
            return(
              <div key={item.id} style={{background:"white",borderRadius:"12px",padding:"0.9rem 1rem",marginBottom:"0.6rem",boxShadow:"0 1px 6px rgba(0,100,0,0.05)"}}>
                <p style={{margin:"0 0 0.6rem",fontSize:"0.85rem",fontWeight:"600",color:C.text,lineHeight:1.4}}>
                  <span style={{color:esc.color,marginRight:"0.4rem",fontWeight:"700"}}>{idx+1}.</span>{item.label}
                </p>
                <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                  {item.opciones.map(op=>{
                    const s=currentValoration[item.id]===op.valor;
                    return(
                      <button key={op.valor} onClick={()=>setCurrentValoration(prev=>({...prev,[item.id]:op.valor}))}
                        style={{padding:"0.55rem 0.8rem",borderRadius:"8px",border:`2px solid ${s?esc.color:C.border}`,background:s?`${esc.color}18`:"white",cursor:"pointer",textAlign:"left",fontSize:"0.82rem",color:s?esc.color:C.text,fontWeight:s?"700":"400",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span>{op.texto}</span>
                        <span style={{fontSize:"0.8rem",color:s?esc.color:C.textMuted,fontWeight:"700"}}>{op.valor} pt</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:`1px solid ${C.border}`,padding:"0.8rem 1rem",display:"flex",alignItems:"center",gap:"1rem",boxShadow:"0 -4px 16px rgba(0,0,0,0.08)"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:"0.7rem",color:C.textMuted}}>Puntuación total</div>
            <div style={{fontSize:"1.4rem",fontWeight:"800",color:completado?esc.color:C.textMuted}}>{total} / {esc.maxPuntos}</div>
            {interp&&<div style={{fontSize:"0.72rem",color:interp.color,fontWeight:"700"}}>{interp.nivel}</div>}
          </div>
          <button onClick={saveValoration} disabled={!completado}
            style={{padding:"0.8rem 1.5rem",borderRadius:"12px",border:"none",background:completado?esc.color:"#CCC",color:"white",cursor:completado?"pointer":"not-allowed",fontWeight:"700",fontSize:"0.9rem"}}>
            Guardar
          </button>
        </div>
      </div>
    );
  };

  // ─── PIE DIABÉTICO: SUBFORMULARIO ─────────────────────────────────────────
  const renderPieDiabetico=()=>{
    if(!pieSub||!selectedPatient)return null;
    const sub=PIE_DIABETICO.subformularios.find(s=>s.id===pieSub);
    if(!sub)return null;
    const p=patients.find(x=>x.id===selectedPatient.id)||selectedPatient;
    const total=calcTotalSub(sub,pieRespuestas);
    const completado=sub.items.every(item=>pieRespuestas[item.id]!==undefined);
    const interp=completado?sub.interpretacion(total):null;
    const hist=(p.pieDiabetico||[]).filter(e=>e.subId===sub.id);

    return(
      <div style={{minHeight:"100vh",background:C.bg,paddingBottom:"6rem"}}>
        <div style={{background:"linear-gradient(90deg,#B71C1C,#E53935)",padding:"1.2rem 1rem 1rem",color:"white"}}>
          <button onClick={()=>{setPieSub(null);setPieRespuestas({});setView("patient");}}
            style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:"8px",padding:"0.4rem 0.8rem",cursor:"pointer",fontSize:"0.85rem",marginBottom:"0.5rem"}}>
            ← {p.nombre.split(" ")[0]}
          </button>
          <div style={{display:"flex",alignItems:"center",gap:"0.7rem"}}>
            <span style={{fontSize:"1.5rem"}}>🦶 {sub.icono}</span>
            <div>
              <h2 style={{margin:0,fontSize:"1rem",fontWeight:"800"}}>{sub.nombre}</h2>
              <p style={{margin:"0.1rem 0 0",fontSize:"0.72rem",opacity:0.85}}>{sub.descripcion}</p>
            </div>
          </div>
        </div>

        {/* Historial y radar de este subformulario */}
        {hist.length>=1&&(
          <div style={{margin:"1rem 1rem 0",background:"white",borderRadius:"14px",padding:"1rem",boxShadow:"0 2px 8px rgba(183,28,28,0.08)"}}>
            <h4 style={{margin:"0 0 0.5rem",fontSize:"0.82rem",color:C.text}}>📊 Evolución — {hist.length} registro{hist.length>1?"s":""}</h4>
            <ResponsiveContainer width="100%" height={190}>
              <RadarChart data={sub.items.map(item=>{
                const maxItem=Math.max(...item.opciones.map(o=>o.valor));
                const label=item.label.split(" ").slice(0,2).join(" ");
                return{label,actual:maxItem>0?Math.round(((hist[0].respuestas[item.id]??0)/maxItem)*100):0,anterior:hist[1]&&maxItem>0?Math.round(((hist[1].respuestas[item.id]??0)/maxItem)*100):null};
              })} margin={{top:8,right:18,bottom:8,left:18}}>
                <PolarGrid stroke="#FFCDD2"/>
                <PolarAngleAxis dataKey="label" tick={{fill:C.textMuted,fontSize:9}} tickLine={false}/>
                <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                <Radar name="Última" dataKey="actual" stroke="#B71C1C" fill="#B71C1C" fillOpacity={0.3} strokeWidth={2} dot={{fill:"#B71C1C",r:3}}/>
                {hist.length>1&&<Radar name="Anterior" dataKey="anterior" stroke={C.accentLight} fill={C.accentLight} fillOpacity={0.15} strokeWidth={1.5} strokeDasharray="4 3"/>}
                <Tooltip formatter={(v,n)=>[`${v}%`,n]} contentStyle={{fontSize:"0.75rem",borderRadius:"8px"}}/>
              </RadarChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:"0.4rem",overflowX:"auto"}}>
              {hist.slice(0,4).map((v,i)=>{const ip=sub.interpretacion(v.total);return(
                <div key={i} style={{flexShrink:0,borderRadius:"8px",padding:"0.4rem 0.6rem",textAlign:"center",minWidth:"64px",background:i===0?"#FFF0F0":"#F5F5F5",borderLeft:`3px solid ${i===0?"#B71C1C":ip.color}`}}>
                  <div style={{fontSize:"0.95rem",fontWeight:"800",color:i===0?"#B71C1C":C.textMuted}}>{v.total}</div>
                  <div style={{fontSize:"0.55rem",color:C.textMuted}}>{formatDate(v.fecha)}</div>
                </div>
              );})}
            </div>
          </div>
        )}

        <div style={{padding:"1rem"}}>
          {sub.items.map((item,idx)=>(
            <div key={item.id} style={{background:"white",borderRadius:"12px",padding:"0.9rem 1rem",marginBottom:"0.6rem",boxShadow:"0 1px 6px rgba(183,28,28,0.05)"}}>
              <p style={{margin:"0 0 0.6rem",fontSize:"0.85rem",fontWeight:"600",color:C.text,lineHeight:1.4}}>
                <span style={{color:"#B71C1C",marginRight:"0.4rem",fontWeight:"700"}}>{idx+1}.</span>{item.label}
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                {item.opciones.map(op=>{
                  const s=pieRespuestas[item.id]===op.valor;
                  return(
                    <button key={op.valor} onClick={()=>setPieRespuestas(prev=>({...prev,[item.id]:op.valor}))}
                      style={{padding:"0.55rem 0.8rem",borderRadius:"8px",border:`2px solid ${s?"#B71C1C":C.border}`,background:s?"#B71C1C18":"white",cursor:"pointer",textAlign:"left",fontSize:"0.82rem",color:s?"#B71C1C":C.text,fontWeight:s?"700":"400",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span>{op.texto}</span>
                      <span style={{fontSize:"0.8rem",color:s?"#B71C1C":C.textMuted,fontWeight:"700"}}>{op.valor} pt</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:`1px solid ${C.border}`,padding:"0.8rem 1rem",display:"flex",alignItems:"center",gap:"1rem",boxShadow:"0 -4px 16px rgba(0,0,0,0.08)"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:"0.7rem",color:C.textMuted}}>Puntuación</div>
            <div style={{fontSize:"1.4rem",fontWeight:"800",color:completado?"#B71C1C":C.textMuted}}>{total} / {sub.maxPuntos}</div>
            {interp&&<div style={{fontSize:"0.72rem",color:interp.color,fontWeight:"700"}}>{interp.nivel}</div>}
          </div>
          <button onClick={()=>savePieValoration(sub.id,pieRespuestas,sub)} disabled={!completado}
            style={{padding:"0.8rem 1.5rem",borderRadius:"12px",border:"none",background:completado?"#B71C1C":"#CCC",color:"white",cursor:completado?"pointer":"not-allowed",fontWeight:"700",fontSize:"0.9rem"}}>
            Guardar
          </button>
        </div>
      </div>
    );
  };

  // ─── EXPORTACIÓN DOCX (compacta — misma lógica que antes) ─────────────────
  const exportarDOCX=async(patient,escalasData)=>{
    if(!window.docx){showToast("Cargando Word...","info");return;}
    showToast("Generando Word...","info");
    try{
      const{Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,Header,Footer,AlignmentType,HeadingLevel,BorderStyle,WidthType,ShadingType,VerticalAlign,PageNumber,PageBreak}=window.docx;
      const hoy=new Date().toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"});
      const bt={style:BorderStyle.SINGLE,size:4,color:"CCDDEE"};
      const bT={top:bt,bottom:bt,left:bt,right:bt,insideH:bt,insideV:bt};
      const cm={top:80,bottom:80,left:120,right:120};const TW=9026;
      const txt=(t,o={})=>new TextRun({text:String(t??""),font:"Calibri",size:o.size||20,bold:o.bold||false,color:o.color||"1A2B3C",italics:o.italic||false});
      const par=(ch,o={})=>new Paragraph({alignment:o.align||AlignmentType.LEFT,spacing:{before:o.sb||0,after:o.sa||80},children:Array.isArray(ch)?ch:[ch]});
      const h1=(t)=>new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:280,after:120},children:[new TextRun({text:t,font:"Calibri",bold:true,size:28,color:"007A2E"})]});
      const h2=(t)=>new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:200,after:80},children:[new TextRun({text:t,font:"Calibri",bold:true,size:24,color:"2D6A4F"})]});
      const cl=(ch,o={})=>new TableCell({borders:bT,margins:cm,width:o.w?{size:o.w,type:WidthType.DXA}:undefined,shading:o.s?{fill:o.s,type:ShadingType.CLEAR}:undefined,verticalAlign:VerticalAlign.CENTER,children:Array.isArray(ch)?ch:[par(ch)]});
      const rw=(cells)=>new TableRow({children:cells});
      const edad=patient.nacimiento?new Date().getFullYear()-new Date(patient.nacimiento).getFullYear():null;
      const children=[
        par([txt("🌿 EnfescalSol — Informe de Valoraciones de Enfermería",{size:28,bold:true,color:"007A2E"})],{align:AlignmentType.CENTER,sa:160}),
        par([txt("Sistema Sanitario Público de Andalucía · Atención Primaria",{size:18,italic:true,color:"5A7A8A"})],{align:AlignmentType.CENTER,sa:200}),
        h1("Datos del Paciente"),
        new Table({width:{size:TW,type:WidthType.DXA},columnWidths:[2500,3763,2763],rows:[
          rw([cl([par([txt("Nombre:",{bold:true,color:"007A2E"})])],{s:"E8F5EC",w:2500}),cl([par([txt(patient.nombre,{bold:true,size:22})])],{w:3763}),cl([par([txt(`Informe: ${hoy}`,{size:18})])],{w:2763})]),
          rw([cl([par([txt("NHC:",{bold:true,color:"007A2E"})])],{s:"E8F5EC",w:2500}),cl([par([txt(patient.nhc,{bold:true})])],{w:3763}),cl([par([txt(edad?`Edad: ${edad} años`:"",{size:18})])],{w:2763})]),
          rw([cl([par([txt("Centro:",{bold:true,color:"007A2E"})])],{s:"E8F5EC",w:2500}),cl([par([txt(patient.centro||"—")])],{w:3763}),cl([par([txt(`Sexo: ${patient.sexo||"—"}`,{size:18})])],{w:2763})]),
        ]}),
        par([],{sa:200}),
        h1("Resumen de Valoraciones"),
        new Table({width:{size:TW,type:WidthType.DXA},columnWidths:[3000,1500,2526,2000],rows:[
          rw([cl([par([txt("Escala",{bold:true,color:"FFFFFF"})])],{s:"007A2E",w:3000}),cl([par([txt("Puntos",{bold:true,color:"FFFFFF"})],{align:AlignmentType.CENTER})],{s:"007A2E",w:1500}),cl([par([txt("Interpretación",{bold:true,color:"FFFFFF"})])],{s:"007A2E",w:2526}),cl([par([txt("Fecha",{bold:true,color:"FFFFFF"})])],{s:"007A2E",w:2000})]),
          ...Object.values(escalasData).map((esc,i)=>{
            const vl=patient.valoraciones?.[esc.id]||[];const last=vl[0];
            const interp=last?esc.interpretacion(last.total):null;const cf=i%2===0?"F2F7F3":"FFFFFF";
            return rw([cl([par([txt(`${esc.icono} ${esc.nombre}`,{bold:!!last})])],{s:cf,w:3000}),cl([par([txt(last?String(last.total):"—",{bold:!!last,size:22,color:last?esc.color.replace("#",""):"999999"})],{align:AlignmentType.CENTER})],{s:cf,w:1500}),cl([par([txt(interp?.nivel||"—",{color:interp?interp.color.replace("#",""):"999999",bold:!!last})])],{s:cf,w:2526}),cl([par([txt(last?new Date(last.fecha).toLocaleDateString("es-ES"):"—",{size:18,color:"5A7A8A"})])],{s:cf,w:2000})]);
          }),
          // Pie diabético en el resumen
          ...PIE_DIABETICO.subformularios.map((sub,i)=>{
            const hist=(patient.pieDiabetico||[]).filter(e=>e.subId===sub.id);const last=hist[0];
            const interp=last?sub.interpretacion(last.total):null;const cf=i%2===0?"FFF8F8":"FFFFFF";
            return rw([cl([par([txt(`🦶 ${sub.nombre}`,{bold:!!last})])],{s:cf,w:3000}),cl([par([txt(last?String(last.total):"—",{bold:!!last,size:22,color:last?"B71C1C":"999999"})],{align:AlignmentType.CENTER})],{s:cf,w:1500}),cl([par([txt(interp?.nivel||"—",{color:interp?interp.color.replace("#",""):"999999",bold:!!last})])],{s:cf,w:2526}),cl([par([txt(last?new Date(last.fecha).toLocaleDateString("es-ES"):"—",{size:18,color:"5A7A8A"})])],{s:cf,w:2000})]);
          }),
        ]}),
        new Paragraph({children:[new PageBreak()]}),
      ];
      // Detalle escalas
      for(const esc of Object.values(escalasData)){
        const vl=patient.valoraciones?.[esc.id]||[];if(!vl.length)continue;
        children.push(h1(`${esc.icono} ${esc.nombre}`));children.push(par([txt(esc.descripcion,{italic:true,color:"5A7A8A"})]));
        for(const[idx,val]of vl.slice(0,3).entries()){
          const interp=esc.interpretacion(val.total);const fd=new Date(val.fecha).toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"});
          children.push(h2(`Valoración ${idx+1} — ${fd}`));
          children.push(new Table({width:{size:TW,type:WidthType.DXA},columnWidths:[5026,2000,2000],rows:[
            rw([cl([par([txt("Ítem",{bold:true,color:"FFFFFF"})])],{s:"2D6A4F",w:5026}),cl([par([txt("Respuesta",{bold:true,color:"FFFFFF"})],{align:AlignmentType.CENTER})],{s:"2D6A4F",w:2000}),cl([par([txt("Pts.",{bold:true,color:"FFFFFF"})],{align:AlignmentType.CENTER})],{s:"2D6A4F",w:2000})]),
            ...esc.items.map((item,ii)=>{const rv=val.respuestas[item.id];const op=item.opciones.find(o=>o.valor===rv);const cf=ii%2===0?"F2F7F3":"FFFFFF";return rw([cl([par([txt(item.label,{size:19})])],{s:cf,w:5026}),cl([par([txt(op?.texto||"—",{size:18,italic:true})],{align:AlignmentType.CENTER})],{s:cf,w:2000}),cl([par([txt(String(rv??"—"),{bold:true,size:20})],{align:AlignmentType.CENTER})],{s:cf,w:2000})]);
            }),
            rw([cl([par([txt(`TOTAL: ${val.total} / ${esc.maxPuntos}  |  ${interp.nivel}`,{bold:true,size:20,color:"007A2E"})])],{s:"D4EFDF",w:9026})]),
          ]}));children.push(par([],{sa:200}));
        }
      }
      // Detalle pie diabético
      for(const sub of PIE_DIABETICO.subformularios){
        const hist=(patient.pieDiabetico||[]).filter(e=>e.subId===sub.id);if(!hist.length)continue;
        children.push(h1(`🦶 ${sub.nombre}`));children.push(par([txt(sub.descripcion,{italic:true,color:"5A7A8A"})]));
        for(const[idx,val]of hist.slice(0,3).entries()){
          const interp=sub.interpretacion(val.total);const fd=new Date(val.fecha).toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"});
          children.push(h2(`Valoración ${idx+1} — ${fd}`));
          children.push(new Table({width:{size:TW,type:WidthType.DXA},columnWidths:[5026,2000,2000],rows:[
            rw([cl([par([txt("Ítem",{bold:true,color:"FFFFFF"})])],{s:"7F1010",w:5026}),cl([par([txt("Respuesta",{bold:true,color:"FFFFFF"})],{align:AlignmentType.CENTER})],{s:"7F1010",w:2000}),cl([par([txt("Pts.",{bold:true,color:"FFFFFF"})],{align:AlignmentType.CENTER})],{s:"7F1010",w:2000})]),
            ...sub.items.map((item,ii)=>{const rv=val.respuestas[item.id];const op=item.opciones.find(o=>o.valor===rv);const cf=ii%2===0?"FFF8F8":"FFFFFF";return rw([cl([par([txt(item.label,{size:19})])],{s:cf,w:5026}),cl([par([txt(op?.texto||"—",{size:18,italic:true})],{align:AlignmentType.CENTER})],{s:cf,w:2000}),cl([par([txt(String(rv??"—"),{bold:true,size:20})],{align:AlignmentType.CENTER})],{s:cf,w:2000})]);
            }),
            rw([cl([par([txt(`TOTAL: ${val.total} / ${sub.maxPuntos}  |  ${interp.nivel}`,{bold:true,size:20,color:"B71C1C"})])],{s:"FFEBEE",w:9026})]),
          ]}));children.push(par([],{sa:200}));
        }
      }
      children.push(par([],{sa:400}));children.push(par([txt("Valoración realizada por: _____________________________",{color:"5A7A8A"})]));children.push(par([txt("Firma y sello:",{color:"5A7A8A"})],{sa:200}));children.push(par([txt(`EnfescalSol · SSPA · ${hoy}`,{size:16,color:"AAAAAA",italic:true})],{align:AlignmentType.CENTER}));
      const doc=new Document({creator:"EnfescalSol",title:`Informe - ${patient.nombre}`,
        styles:{default:{document:{run:{font:"Calibri",size:20}}},
          paragraphStyles:[{id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:28,bold:true,font:"Calibri",color:"007A2E"},paragraph:{spacing:{before:300,after:120},outlineLevel:0}},{id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:24,bold:true,font:"Calibri",color:"2D6A4F"},paragraph:{spacing:{before:200,after:80},outlineLevel:1}}]},
        sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1440,right:1134,bottom:1440,left:1134}}},
          headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,spacing:{after:120},children:[new TextRun({text:`EnfescalSol · SSPA  |  ${patient.nombre}  ·  NHC: ${patient.nhc}`,font:"Calibri",size:18,color:"5A7A8A"})]})]}),},
          footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:80},children:[new TextRun({text:"Sistema Sanitario Público de Andalucía · Atención Primaria  |  Pág. ",font:"Calibri",size:16,color:"999999"}),new TextRun({children:[PageNumber.CURRENT],font:"Calibri",size:16,color:"999999"})]})]}),},
          children}]});
      const blob=await Packer.toBlob(doc);const url=URL.createObjectURL(blob);const a=document.createElement("a");
      a.href=url;a.download=`EnfescalSol_${patient.nombre.replace(/\s+/g,"_")}_NHC${patient.nhc}.docx`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
      showToast("Word generado ✓");
    }catch(e){console.error(e);showToast("Error al generar Word","error");}
  };

  // ─── EXPORTACIÓN ODT ──────────────────────────────────────────────────────
  const exportarODT=async(patient,escalasData)=>{
    if(!window.JSZip){showToast("Cargando JSZip...","info");return;}
    showToast("Generando ODT...","info");
    try{
      const hoy=new Date().toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"});
      const edad=patient.nacimiento?new Date().getFullYear()-new Date(patient.nacimiento).getFullYear():null;
      const x=s=>(s??"").toString().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      let c=`<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.3"><office:automatic-styles><style:style style:name="H" style:family="table-cell"><style:table-cell-properties fo:background-color="#007A2E" fo:padding="0.15cm"/></style:style><style:style style:name="HR" style:family="table-cell"><style:table-cell-properties fo:background-color="#7F1010" fo:padding="0.15cm"/></style:style><style:style style:name="A" style:family="table-cell"><style:table-cell-properties fo:background-color="#E8F5EC" fo:padding="0.15cm"/></style:style><style:style style:name="N" style:family="table-cell"><style:table-cell-properties fo:background-color="#FFFFFF" fo:padding="0.15cm"/></style:style><style:style style:name="T" style:family="table-cell"><style:table-cell-properties fo:background-color="#D4EFDF" fo:padding="0.15cm"/></style:style><style:style style:name="TR" style:family="table-cell"><style:table-cell-properties fo:background-color="#FFEBEE" fo:padding="0.15cm"/></style:style><style:style style:name="pH1" style:family="paragraph"><style:paragraph-properties fo:margin-top="0.5cm" fo:margin-bottom="0.2cm" fo:border-bottom="0.05cm solid #007A2E" fo:padding-bottom="0.1cm"/><style:text-properties fo:font-size="14pt" fo:font-weight="bold" fo:color="#007A2E" fo:font-family="Calibri"/></style:style><style:style style:name="pH2" style:family="paragraph"><style:paragraph-properties fo:margin-top="0.3cm" fo:margin-bottom="0.1cm"/><style:text-properties fo:font-size="12pt" fo:font-weight="bold" fo:color="#2D6A4F" fo:font-family="Calibri"/></style:style><style:style style:name="pN" style:family="paragraph"><style:paragraph-properties fo:margin-bottom="0.15cm"/><style:text-properties fo:font-size="11pt" fo:font-family="Calibri"/></style:style><style:style style:name="pW" style:family="paragraph"><style:text-properties fo:color="#FFFFFF" fo:font-weight="bold" fo:font-family="Calibri" fo:font-size="11pt"/></style:style></office:automatic-styles><office:body><office:text>
<text:p text:style-name="pH1">EnfescalSol — Informe de Valoraciones · SSPA</text:p>
<text:p text:style-name="pH1">Datos del Paciente</text:p>
<table:table><table:table-column table:number-columns-repeated="2"/>
<table:table-row><table:table-cell table:style-name="A"><text:p>Nombre: ${x(patient.nombre)}</text:p></table:table-cell><table:table-cell table:style-name="N"><text:p>NHC: ${x(patient.nhc)}</text:p></table:table-cell></table:table-row>
<table:table-row><table:table-cell table:style-name="A"><text:p>Centro: ${x(patient.centro||"—")}</text:p></table:table-cell><table:table-cell table:style-name="N"><text:p>Edad: ${edad?`${edad} años`:"—"} | Sexo: ${x(patient.sexo||"—")}</text:p></table:table-cell></table:table-row>
<table:table-row><table:table-cell table:style-name="A"><text:p>Fecha:</text:p></table:table-cell><table:table-cell table:style-name="N"><text:p>${hoy}</text:p></table:table-cell></table:table-row>
</table:table>
<text:p text:style-name="pH1">Resumen</text:p>
<table:table><table:table-column table:number-columns-repeated="4"/>
<table:table-row><table:table-cell table:style-name="H"><text:p text:style-name="pW">Escala</text:p></table:table-cell><table:table-cell table:style-name="H"><text:p text:style-name="pW">Pts.</text:p></table:table-cell><table:table-cell table:style-name="H"><text:p text:style-name="pW">Interpretación</text:p></table:table-cell><table:table-cell table:style-name="H"><text:p text:style-name="pW">Fecha</text:p></table:table-cell></table:table-row>\n`;
      Object.values(escalasData).forEach((esc2,i)=>{const vl=patient.valoraciones?.[esc2.id]||[];const last=vl[0];const interp=last?esc2.interpretacion(last.total):null;const cs=i%2===0?"A":"N";c+=`<table:table-row><table:table-cell table:style-name="${cs}"><text:p>${x(esc2.icono)} ${x(esc2.nombre)}</text:p></table:table-cell><table:table-cell table:style-name="${cs}"><text:p>${last?last.total:"—"}</text:p></table:table-cell><table:table-cell table:style-name="${cs}"><text:p>${x(interp?.nivel||"—")}</text:p></table:table-cell><table:table-cell table:style-name="${cs}"><text:p>${last?new Date(last.fecha).toLocaleDateString("es-ES"):"—"}</text:p></table:table-cell></table:table-row>\n`;});
      PIE_DIABETICO.subformularios.forEach((sub,i)=>{const hist=(patient.pieDiabetico||[]).filter(e=>e.subId===sub.id);const last=hist[0];const interp=last?sub.interpretacion(last.total):null;const cs="N";c+=`<table:table-row><table:table-cell table:style-name="${cs}"><text:p>🦶 ${x(sub.nombre)}</text:p></table:table-cell><table:table-cell table:style-name="${cs}"><text:p>${last?last.total:"—"}</text:p></table:table-cell><table:table-cell table:style-name="${cs}"><text:p>${x(interp?.nivel||"—")}</text:p></table:table-cell><table:table-cell table:style-name="${cs}"><text:p>${last?new Date(last.fecha).toLocaleDateString("es-ES"):"—"}</text:p></table:table-cell></table:table-row>\n`;});
      c+=`</table:table>\n`;
      for(const esc2 of Object.values(escalasData)){const vl=patient.valoraciones?.[esc2.id]||[];if(!vl.length)continue;c+=`<text:p text:style-name="pH1">${x(esc2.icono)} ${x(esc2.nombre)}</text:p>\n`;for(const[idx,val]of vl.slice(0,3).entries()){const interp=esc2.interpretacion(val.total);const fd=new Date(val.fecha).toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"});c+=`<text:p text:style-name="pH2">Valoración ${idx+1} — ${fd}</text:p>\n<table:table><table:table-column table:number-columns-repeated="3"/><table:table-row><table:table-cell table:style-name="H"><text:p text:style-name="pW">Ítem</text:p></table:table-cell><table:table-cell table:style-name="H"><text:p text:style-name="pW">Respuesta</text:p></table:table-cell><table:table-cell table:style-name="H"><text:p text:style-name="pW">Pts.</text:p></table:table-cell></table:table-row>\n`;esc2.items.forEach((item,ii)=>{const rv=val.respuestas[item.id];const op=item.opciones.find(o=>o.valor===rv);const cs=ii%2===0?"A":"N";c+=`<table:table-row><table:table-cell table:style-name="${cs}"><text:p>${x(item.label)}</text:p></table:table-cell><table:table-cell table:style-name="${cs}"><text:p>${x(op?.texto||"—")}</text:p></table:table-cell><table:table-cell table:style-name="${cs}"><text:p>${rv??"-"}</text:p></table:table-cell></table:table-row>\n`;});c+=`<table:table-row><table:table-cell table:style-name="T" table:number-columns-spanned="3"><text:p>TOTAL: ${val.total} / ${esc2.maxPuntos} | ${x(interp.nivel)}</text:p></table:table-cell></table:table-row></table:table>\n<text:p text:style-name="pN"> </text:p>\n`;}}
      for(const sub of PIE_DIABETICO.subformularios){const hist=(patient.pieDiabetico||[]).filter(e=>e.subId===sub.id);if(!hist.length)continue;c+=`<text:p text:style-name="pH1">🦶 ${x(sub.nombre)}</text:p>\n`;for(const[idx,val]of hist.slice(0,3).entries()){const interp=sub.interpretacion(val.total);const fd=new Date(val.fecha).toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"});c+=`<text:p text:style-name="pH2">Valoración ${idx+1} — ${fd}</text:p>\n<table:table><table:table-column table:number-columns-repeated="3"/><table:table-row><table:table-cell table:style-name="HR"><text:p text:style-name="pW">Ítem</text:p></table:table-cell><table:table-cell table:style-name="HR"><text:p text:style-name="pW">Respuesta</text:p></table:table-cell><table:table-cell table:style-name="HR"><text:p text:style-name="pW">Pts.</text:p></table:table-cell></table:table-row>\n`;sub.items.forEach((item,ii)=>{const rv=val.respuestas[item.id];const op=item.opciones.find(o=>o.valor===rv);const cs=ii%2===0?"N":"A";c+=`<table:table-row><table:table-cell table:style-name="${cs}"><text:p>${x(item.label)}</text:p></table:table-cell><table:table-cell table:style-name="${cs}"><text:p>${x(op?.texto||"—")}</text:p></table:table-cell><table:table-cell table:style-name="${cs}"><text:p>${rv??"-"}</text:p></table:table-cell></table:table-row>\n`;});c+=`<table:table-row><table:table-cell table:style-name="TR" table:number-columns-spanned="3"><text:p>TOTAL: ${val.total} / ${sub.maxPuntos} | ${x(interp.nivel)}</text:p></table:table-cell></table:table-row></table:table>\n<text:p text:style-name="pN"> </text:p>\n`;}}
      c+=`<text:p text:style-name="pN"> </text:p><text:p text:style-name="pN">Valoración realizada por: _________________________</text:p><text:p text:style-name="pN">Firma y sello:</text:p><text:p text:style-name="pN"> </text:p><text:p text:style-name="pN">EnfescalSol · Sistema Sanitario Público de Andalucía · ${hoy}</text:p></office:text></office:body></office:document-content>`;
      const mf=`<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text" manifest:version="1.3"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/></manifest:manifest>`;
      const st=`<?xml version="1.0" encoding="UTF-8"?><office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.3"><office:styles><style:default-style style:family="paragraph"><style:text-properties fo:font-family="Calibri" fo:font-size="11pt"/></style:default-style></office:styles><office:automatic-styles><style:page-layout style:name="pm1"><style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm" fo:margin-top="2cm" fo:margin-bottom="2cm" fo:margin-left="2cm" fo:margin-right="2cm"/></style:page-layout></office:automatic-styles><office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm1"><style:header><text:p>EnfescalSol · SSPA | ${x(patient.nombre)} | NHC: ${x(patient.nhc)}</text:p></style:header><style:footer><text:p>Sistema Sanitario Público de Andalucía · Atención Primaria</text:p></style:footer></style:master-page></office:master-styles></office:document-styles>`;
      const mt=`<?xml version="1.0" encoding="UTF-8"?><office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" office:version="1.3"><office:meta><dc:title>Informe EnfescalSol - ${x(patient.nombre)}</dc:title><meta:creation-date>${new Date().toISOString()}</meta:creation-date><meta:generator>EnfescalSol 1.0</meta:generator></office:meta></office:document-meta>`;
      const zip=new window.JSZip();zip.file("mimetype","application/vnd.oasis.opendocument.text",{compression:"STORE"});zip.folder("META-INF").file("manifest.xml",mf);zip.file("content.xml",c);zip.file("styles.xml",st);zip.file("meta.xml",mt);
      const blob=await zip.generateAsync({type:"blob",mimeType:"application/vnd.oasis.opendocument.text",compression:"DEFLATE"});
      const url=URL.createObjectURL(blob);const a=document.createElement("a");
      a.href=url;a.download=`EnfescalSol_${patient.nombre.replace(/\s+/g,"_")}_NHC${patient.nhc}.odt`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
      showToast("ODT generado ✓");
    }catch(e){console.error(e);showToast("Error al generar ODT","error");}
  };

  // ─── TOAST ────────────────────────────────────────────────────────────────
  const renderToast=()=>toast&&(
    <div style={{position:"fixed",top:"1rem",left:"50%",transform:"translateX(-50%)",background:toast.type==="error"?C.danger:toast.type==="info"?C.primary:C.success,color:"white",borderRadius:"10px",padding:"0.7rem 1.5rem",fontSize:"0.9rem",fontWeight:"600",zIndex:200,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",whiteSpace:"nowrap"}}>
      {toast.msg}
    </div>
  );

  // ─── RENDER ───────────────────────────────────────────────────────────────
  if(!authed)return renderLogin();

  return(
    <div style={{maxWidth:"430px",margin:"0 auto",position:"relative"}}>
      <style>{`
        @media print{.no-print{display:none!important}body{font-size:12px}}
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        button{-webkit-appearance:none}
      `}</style>
      {renderToast()}
      {view==="home"&&renderHome()}
      {view==="patients"&&renderPatients()}
      {view==="patient"&&renderPatient()}
      {view==="escala"&&renderEscala()}
      {view==="piediabetico"&&renderPieDiabetico()}
    </div>
  );
}

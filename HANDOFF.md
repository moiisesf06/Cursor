# Handoff: Plataforma educativa local (inglés + matemáticas)

## Estado del proyecto
- **Fase:** planificación / discovery (aún **no** hay código de la app).
- **Repo:** casi vacío (`README.md` placeholder). No hay implementación.
- **Idioma de comunicación con el usuario:** **español** (regla del usuario).
- **Objetivo del siguiente agente:** cerrar defaults pendientes (si el usuario no responde), entregar plan final de pantallas + arquitectura, y **empezar a construir la Versión 1** de una web local para Windows, accesible desde tablets en la misma red.

---

## Resumen del producto
Web **local en casa** (localhost / LAN) para 2 hijos, con:
- selección de perfil por nombre + avatar,
- tareas diarias por edad,
- ejemplo/tutorial → práctica → prueba calificada (1–100),
- audio (TTS) con bocina junto a instrucciones,
- sonidos de acierto/error,
- animaciones y refuerzo visual,
- calendario de 30 días,
- recordatorios a las 10:00, 13:00 y 16:00 si la tarea del día no está hecha,
- panel de adulto con PIN (ver progreso, calificaciones, marcar/corregir tareas).

**No es app nativa.** Decisión confirmada: **web local** (mejor para PC + tablets en la misma red, Windows, sin internet al inicio).

---

## Usuarios

### Niño (~5 años)
- Diseño **infantil**, colorido, animaciones, mascota/personaje.
- **1 bloque mixto diario** (inglés + matemáticas juntos).
- Matemáticas:
  - “sopa de números”: tocar el número correcto (1–10),
  - audio del número en **inglés y español**,
  - sumas y restas **fáciles** para el concepto.
- Inglés inicial: colores, animales, vocabulario básico, etc.
- Instrucciones con **bocina** para escuchar (importante: aún no lee bien).
- Sonidos de acierto/error.

### Niña (~10 años; antes se mencionó 11; usar **10 / 4.º grado**)
- Diseño **más formal / académico**, con tema propio + mascota/personaje.
- **2 tareas diarias:**
  1. Matemáticas de **4.º grado**,
  2. Inglés (verbos, tiempos, vocabulario, comprensión, etc.).
- Misma estructura: ejemplo → prueba → nota 1–100.
- Bocina para instrucciones + sonidos acierto/error.

### Adulto (padre/madre)
- Acceso con **PIN**.
- Ver calificaciones y progreso.
- Poder **marcar / corregir** tareas manualmente.
- Ver días completados / pendientes y alertas del día.

---

## Decisiones confirmadas por el usuario

| Tema | Decisión |
|------|----------|
| Cantidad de hijos | 2 |
| Edades | ~5 y ~10 |
| Perfiles | Cada uno escribe su nombre y elige avatar |
| Avatares | Quiere variedad “Disney / Marvel / anime” |
| Notas | Escala **1–100** |
| Niño 5 | Bloque mixto diario |
| Niña 10 | 2 tareas/día (mate + inglés) |
| Mate niño 5 | Sopa de números 1–10 + audio ES/EN + sumas/restas fáciles |
| Mate niña 10 | Nivel 4.º grado |
| Contenido | Fijo por ahora, **30 días**, ampliable después |
| Corrección | Automática al terminar; primero ejemplo, luego prueba |
| Audio | Botón bocina junto a instrucciones (no auto-play obligatorio) |
| Sonidos | Sí, acierto/error |
| Temas | Sí, distintos por perfil + personajes/mascotas |
| Dispositivos | PC Windows (host) + tablets de los niños en misma LAN |
| Alcance red | Solo casa por ahora; internet después |
| Adulto | PIN + marcar/corregir = **sí** |
| Recordatorios | 10:00, 13:00, 16:00 si no hizo la tarea del día |

---

## Restricción legal importante: avatares
El usuario pidió personajes de **Disney / Marvel / anime**.

**No usar** assets, nombres ni imágenes oficiales con derechos de autor.

**Implementar** packs de avatares **originales** con el mismo “vibe”:
- héroes / superpoderes,
- princesas / magia,
- animales aventureros,
- robots / estilo anime.

Explicar al usuario (ya se le dijo) que así es legal y se siente igual de divertido.

---

## Recordatorios en tablet (recomendación técnica)
A las **10:00, 13:00 y 16:00** revisar si la tarea del día está completa; si no, alertar.

Limitación: una web no puede despertar la tablet de forma fiable si la pestaña está cerrada.

### Versión 1 (recomendada)
1. Web abierta o instalada como **PWA** (“Añadir a pantalla de inicio”).
2. Scheduler en cliente (y/o chequeo al abrir).
3. Si pendiente:
   - alerta visual grande,
   - sonido de recordatorio,
   - intentar **Notification API** si hay permiso.
4. Si ya completó el día → **no alertar**.

### Fase 2 (si hace falta más fiabilidad)
Servicio en la PC Windows + notificaciones push / mecanismo más robusto.

---

## Preguntas abiertas (pendientes del usuario)
Si el usuario no responde, usar los **defaults recomendados** entre paréntesis:

1. Nombres iniciales o vacíos → **defaults:** campos vacíos; placeholder “Escribe tu nombre”.
2. PIN adulto por defecto → **default:** `1234` (cambiable en panel).
3. Instrucciones de la niña → **default:** español; contenido de inglés en inglés cuando corresponda.
4. Reintentos en preguntas → **default:** pueden reintentar en práctica; en **prueba calificada** cuenta el primer intento (o un intento final por pregunta). Clarificar en UI.
5. Día completado → **default:** sí, solo al terminar **todo** lo del día (niño: bloque mixto; niña: mate + inglés).
6. Mascota → **default:** elegible junto con avatar (o mascota sugerida por tema).
7. Nombre del proyecto → **default:** `Aula en Casa`.

---

## Arquitectura recomendada (V1)

### Stack sugerido
- **Next.js (App Router) + TypeScript + React**
- Estilos: CSS modules o Tailwind (evitar look genérico “AI purple”; seguir reglas de diseño del usuario, adaptadas a infantil/académico por perfil)
- Persistencia local: **SQLite** (mejor vía API server local) o JSON file store inicial
- Auth adulto: PIN hasheado en servidor local
- TTS: **Web Speech API** (`speechSynthesis`) en español (y inglés para números del niño)
- Audio UI: bocina + SFX acierto/error
- Deploy local: `next start` o script fácil en Windows; acceso LAN por IP (`http://<IP-PC>:3000`)

### Datos mínimos a modelar
- `Profile` (id, name, avatarId, theme, ageGroup: `kid5` | `kid10`, mascotId, createdAt)
- `AdultSettings` (pinHash, reminderHours: [10,13,16])
- `DayPlan` / `Lesson` (dayNumber 1–30, profileType, subject(s), activities)
- `Attempt` / `Score` (profileId, dayNumber, activityId, score 1–100, completedAt)
- `DailyCompletion` (profileId, date, completed: boolean, scores summary)

### Flujos UX principales
1. Home → elegir / crear perfil (nombre + avatar) o entrar como adulto.
2. Dashboard niño → tarea(s) del día + calendario 30 días + progreso.
3. Activity → intro/ejemplo → práctica → prueba → resultado (1–100) + refuerzo.
4. Adult panel (PIN) → progreso, notas, pendientes, marcar/corregir.
5. Reminder engine → checks 10/13/16.

### Contenido inicial (30 días)
Generar contenido **fijo embebido** (JSON/TS), no CMS aún.

**kid5 (1 bloque mixto/día):**
- números 1–10 (sopa / tocar número) con TTS ES+EN,
- colores, animales, vocabulario básico,
- sumas/restas muy simples,
- mucha interacción táctil.

**kid10 (2 tareas/día):**
- Math 4th grade: operaciones, problemas, fracciones iniciales, etc.
- English: verbs, tenses, vocabulary, short comprehension.

Cada actividad debe incluir:
- texto de instrucción,
- clave TTS,
- ejemplos,
- ítems de práctica,
- ítems de prueba,
- rúbrica de score 1–100.

---

## Requisitos de diseño (del usuario + reglas del repo)
- Tablet-first, touch-friendly (botones grandes).
- Tema infantil para kid5; más formal para kid10.
- Animaciones (2–3 intencionales mínimo en superficies visuales).
- Sonidos de feedback.
- No usar avatares con copyright.
- Evitar layouts genéricos tipo dashboard en home de niños: composición clara, una tarea principal del día.
- Interfaz en **español**.

---

## Alcance Versión 1 (construir esto)
- [ ] Setup proyecto web local
- [ ] Home + creación/selección de perfiles (nombre + avatares originales)
- [ ] Temas distintos kid5 / kid10 + mascota
- [ ] Contenido fijo 30 días (ambos perfiles)
- [ ] Flujo ejemplo → práctica → prueba → score 1–100
- [ ] Bocina TTS
- [ ] SFX acierto/error
- [ ] Calendario / marcado día a día
- [ ] Panel adulto con PIN + ver progreso + marcar/corregir
- [ ] Recordatorios 10/13/16 (alerta in-app + sonido; PWA/notifications best-effort)
- [ ] Instrucciones para correr en Windows y abrir desde tablets por LAN

## Fuera de V1 (después)
- Publicar en internet
- Editor de contenido para padres
- Más meses de material
- Notificaciones push 100% fiables en background
- Assets con IP de terceros

---

## Próximos pasos concretos para el nuevo agente
1. Confirmar con el usuario los 7 defaults **o aplicar defaults** si pide avanzar.
2. Entregar plan final corto de pantallas + arquitectura (en español).
3. Crear branch `cursor/<descriptive-name>-c695` e implementar V1.
4. Commit/push frecuentes; crear/actualizar PR según instrucciones cloud.
5. Dejar README de uso en casa: cómo iniciar en Windows, cómo conectar tablets, PIN, recordatorios.

### Comando sugerido de arranque (cuando implemente)
En la PC Windows (idea):
```bash
npm install
npm run dev -- --hostname 0.0.0.0 --port 3000
```
Luego en tablets: `http://<IP-local-de-la-PC>:3000`

---

## Contexto de conversación (qué ya se le dijo al usuario)
- Se recomendó **web local** vs app.
- Se explicó limitación de alertas en tablet y se propuso PWA + alerta in-app.
- Se rechazó uso de personajes oficiales Disney/Marvel/anime por copyright; se propusieron packs originales.
- Se pidieron 7 aclaraciones finales; el usuario aún no las respondió.
- El usuario preguntó “cuál sería el próximo paso” y luego pidió este handoff.

---

## Mensaje sugerido al retomar con el usuario
> Ya tengo el handoff completo. ¿Aplico los valores por defecto (PIN 1234, proyecto “Aula en Casa”, etc.) y empiezo con el plan final + implementación V1, o prefieres responder antes las 7 decisiones pendientes?

---

## Notas para el agente
- Responder siempre en **español**.
- No estimar tiempos en días/semanas; hablar de componentes y riesgos.
- No inventar que el código ya existe: el repo está vacío de producto.
- Priorizar experiencia táctil en tablets y audio para el niño de 5.
- Mantener contenido ampliable (datos separados de la UI) aunque V1 sea fijo.

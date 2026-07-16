# ForMyKids

Web local para que tus hijos practiquen **inglés** y **matemáticas** desde la PC o tablets en la misma red de casa.

## Qué incluye (V1)

- Perfiles con **avatar** + **mascota** (sin escribir nombre)
- Niño ~5 años: bloque mixto diario (números 1–10, colores, animales, sumas/restas fáciles)
- Niño/a ~10 años: 2 tareas diarias (matemáticas 4.º + inglés)
- Flujo: ejemplo → práctica → prueba → botón **Terminar**
- Nota 1–100; aprueba con **≥ 80%**; si falla, nueva prueba con preguntas distintas
- Bocina para escuchar instrucciones (español; números también en inglés)
- Sonidos de acierto/error
- Calendario de 30 días
- Panel adulto con PIN **0692**
- Recordatorios a las **10:00, 13:00 y 16:00** si la tarea del día no está hecha (con la web abierta)

## Requisitos

- Node.js 18+ en la PC Windows
- Navegador en PC y tablets (Chrome/Edge recomendado)

## Cómo iniciar en Windows

En la carpeta del proyecto:

```bash
npm install
npm run dev
```

La app queda en:

```text
http://localhost:3000
```

### Abrir desde tablets (misma red Wi‑Fi)

1. En la PC, abre PowerShell o CMD y ejecuta:

```bash
ipconfig
```

2. Busca la **dirección IPv4** de tu Wi‑Fi, por ejemplo `192.168.1.20`.
3. En la tablet abre el navegador y entra a:

```text
http://192.168.1.20:3000
```

> La PC debe permanecer encendida con `npm run dev` (o `npm run start` tras `npm run build`) corriendo.

### Producción local

```bash
npm run build
npm run start
```

## Uso rápido

1. **Crear perfil** → elige edad (5 o 10), avatar y mascota.
2. Entra al perfil y haz la tarea del día.
3. En la prueba, responde todo y pulsa **Terminar** (ya no se pueden cambiar respuestas).
4. Si sacas menos de 80%, repites con preguntas nuevas.
5. **Zona de adultos** → PIN `0692` para ver progreso y marcar días.

## Notas

- Los datos se guardan en el navegador (`localStorage`) del dispositivo.
- Para ver el mismo progreso en PC y tablet, usa preferiblemente la misma tablet de cada niño o exportaremos sync en una versión futura.
- Los avatares son personajes **originales** (estilo héroes/magia/anime), no marcas registradas.
- Recordatorios: deja la pestaña abierta o vuelve a entrar cerca de esas horas; también puede pedir permiso de notificaciones del navegador.

## Stack

- Next.js 15 + React + TypeScript + Tailwind CSS v4

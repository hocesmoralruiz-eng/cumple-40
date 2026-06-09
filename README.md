# 20 x 2 Cumpleaños del Señor Hoces

Web estática para GitHub Pages. Invitación al 40 cumpleaños — temática abejitas borrachas y drogadas, tono gamberro.

## Placeholders por rellenar

Antes de mandar la web a nadie, sustituye en estos archivos:

### `index.html`
- `[FECHA]` — fecha de la fiesta (aparece 3 veces: eyebrow del hero + detalle "Día y hora" + placeholder visual)
- `[HORA]` — hora de inicio (aparece 2 veces)
- `[DIRECCIÓN]` — dirección exacta de la penthouse azul
- `[URL_PLAYLIST_SPOTIFY]` — URL embed de Spotify (Compartir → Incrustar playlist → copia el `src` del iframe)

### `script.js`
- `EVENT_DATE` (línea 2) — pon la fecha real para que la cuenta atrás funcione. Formato: `new Date("2026-09-01T20:00:00+02:00")`.

### `assets/cumple-40.ics`
- Reemplaza las fechas placeholder con las reales para que la gente pueda añadir el evento a su calendario.

### `assets/musica.mp3` (opcional)
- Coloca aquí un mp3 si quieres música de fondo. El botón flotante lo controla.

## Cómo desplegar

Ya está configurado para GitHub Pages. Después de empujar cambios:

```bash
git add .
git commit -m "describe el cambio"
git push
```

GitHub Pages se actualiza en 30-60 segundos.

URL pública: https://hocesmoralruiz-eng.github.io/cumple-40/

## RSVP

El formulario manda las respuestas al mismo Apps Script del cumple de Estela
(`FORM_ENDPOINT` en `script.js`). Las respuestas aparecen mezcladas con las de
Estela en la pestaña `Respuestas` del Sheets — para filtrar las del 40 cumple,
usa la columna **Origen**: contiene la URL `cumple-40.github.io/...`.

Bebidas del 40 cumple (5): Cerveza, Tinto de verano, Refresco, Agua, Lo que caiga.
Solo "Cerveza" coincide con las bebidas de Estela, así que se contará en la columna-flag
correspondiente. El resto solo se ven en la columna "Bebidas" como texto.

## Estructura

```
.
├── index.html              ← Estructura y secciones
├── styles.css              ← Diseño dark/brutalist con confeti y abejas borrachas
├── script.js               ← Lógica del formulario, countdown, audio
├── README.md
└── assets/
    ├── cumple-40.ics       ← Evento iCalendar (sustituye placeholders)
    └── musica.mp3          ← Opcional, añade si quieres
```

## Cambios respecto al cumple de Estela

- Paleta dark (negro, amarillo eléctrico, magenta, lima)
- Fuentes Bowlby One + Space Grotesk (en lugar de Baloo 2 + Nunito)
- Tarjetas rectangulares con sombras duras (sin óvalos con alas)
- Confeti en lugar de pólen
- 8 abejitas borrachas con trayectorias erráticas, ojos en X, alas verdes
- 5 secciones nuevas: dress code, playlist, FAQ, sin sección de calendario
- 5 bebidas en lugar de 13
- Mismo backend (Apps Script de Estela)

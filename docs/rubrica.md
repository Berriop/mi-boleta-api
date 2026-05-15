# 📊 Rúbrica de calificación — Práctica individual frontend "¿Y si sí me lo gané?"

**Entrega:** 21 de mayo
**Valor:** 15% de la nota final del curso
**Escala interna de esta rúbrica:** 0–100 puntos → se convierte a la nota final del 15%.

---

## Resumen de criterios y pesos

| # | Criterio | Peso |
|---|---|---|
| 1 | Autenticación y persistencia de sesión | **15 pts** |
| 2 | CRUD completo de boletas / sorteos | **15 pts** |
| 3 | Dashboard principal | **10 pts** |
| 4 | Página de administrador (filtros, búsqueda, paginación) | **10 pts** |
| 5 | Validaciones y manejo de errores | **10 pts** |
| 6 | Diseño, responsive y UX | **10 pts** |
| 7 | Arquitectura del frontend (clean architecture, TypeScript, componentización) | **10 pts** |
| 8 | Consumo correcto de la API REST | **10 pts** |
| 9 | Routing y protección de rutas | **5 pts** |
| 10 | Calidad del código (legibilidad, nombres, organización) | **5 pts** |
| 11 | Despliegue y entrega (repositorio, README, demo) | **5 pts** |
|   | **TOTAL** | **100 pts** |

> **Conversión a la nota del 15%:** `nota_final = (puntos_obtenidos / 100) * 15`.
> Ejemplo: 82 puntos → 0.82 × 15 = **12.3 puntos** sobre 15.

---

## Niveles de logro

Cada criterio se evalúa en cuatro niveles:

| Nivel | % del peso del criterio |
|---|---|
| 🟢 **Excelente** | 100% |
| 🔵 **Bueno** | 75% |
| 🟡 **Aceptable** | 50% |
| 🔴 **Insuficiente** | 0–25% |

---

## 1. Autenticación y persistencia de sesión — 15 pts

| Nivel | Descripción |
|---|---|
| 🟢 Excelente (15) | Registro y login funcionan correctamente contra la API. El JWT se persiste (localStorage/cookie). La sesión sobrevive a refrescar la página. Existe logout que limpia el token. Si el token expira (401), la app redirige automáticamente al login. Maneja errores del backend (credenciales inválidas, email duplicado) mostrándolos al usuario. |
| 🔵 Bueno (11) | Registro, login y logout funcionan. Persistencia presente. Falta el manejo automático de expiración o de algún error puntual. |
| 🟡 Aceptable (7) | Login/registro funcionan pero la persistencia se pierde al refrescar, o el logout no limpia bien la sesión. |
| 🔴 Insuficiente (0–3) | No hay autenticación funcional o el token no se envía en las requests autenticadas. |

## 2. CRUD completo de boletas / sorteos — 15 pts

| Nivel | Descripción |
|---|---|
| 🟢 Excelente (15) | Las 4 operaciones (crear, listar, editar, eliminar) funcionan correctamente. El formulario soporta todos los campos del modelo (`title`, `gameType`, `gameNumber`, `gameDate`, `amount`, `place`, `status`, `notes`). El estado de la UI se actualiza tras cada operación sin requerir recarga manual. Hay confirmación antes de eliminar. |
| 🔵 Bueno (11) | Las 4 operaciones funcionan pero falta soporte para algún campo opcional, o falta la confirmación de eliminar. |
| 🟡 Aceptable (7) | Funcionan crear y listar; editar o eliminar tienen errores o falta refresco automático. |
| 🔴 Insuficiente (0–3) | Faltan dos o más operaciones, o el formulario no envía los campos correctamente. |

## 3. Dashboard principal — 10 pts

| Nivel | Descripción |
|---|---|
| 🟢 Excelente (10) | Muestra cantidad total de juegos registrados, próximos sorteos (fecha futura), juegos pendientes (status = Pendiente) y un historial accesible. Los conteos son correctos y se actualizan al agregar/eliminar tickets. Diseño claro y visualmente jerarquizado. |
| 🔵 Bueno (7) | Tiene las 4 secciones pero algún conteo es incorrecto o la información se ve desactualizada. |
| 🟡 Aceptable (5) | Faltan 1–2 de las secciones del dashboard. |
| 🔴 Insuficiente (0–2) | No hay dashboard o solo muestra una lista plana sin información agregada. |

## 4. Página de administrador — 10 pts

| Nivel | Descripción |
|---|---|
| 🟢 Excelente (10) | Existe una ruta `/admin` accesible solo si el usuario logueado tiene `role = "admin"`. Consume `GET /admin/tickets` mostrando datos del dueño. Implementa **todos** los filtros: por número (`q`), por nombre (`q`), por estado, por tipo de juego y paginación. Los filtros se combinan correctamente. |
| 🔵 Bueno (7) | Página admin presente con la mayoría de los filtros y paginación funcional, pero falta combinarlos o algún filtro tiene bugs. |
| 🟡 Aceptable (5) | Solo se implementan 1–2 filtros o no hay paginación. |
| 🔴 Insuficiente (0–2) | No existe la página de admin o cualquier usuario puede acceder. |

## 5. Validaciones y manejo de errores — 10 pts

| Nivel | Descripción |
|---|---|
| 🟢 Excelente (10) | Todos los formularios validan en el cliente: campos vacíos, formato de email, fechas válidas, números válidos. Los errores se muestran junto al campo correspondiente, no en un alert genérico. Los errores que devuelve la API (400/401/409) se muestran al usuario de forma clara. Los botones de submit se deshabilitan mientras la request está en curso. |
| 🔵 Bueno (7) | Hay validación pero solo en algunos formularios, o los errores del backend se muestran en un solo lugar genérico. |
| 🟡 Aceptable (5) | Validaciones básicas funcionando pero errores del backend no se muestran o causan crash. |
| 🔴 Insuficiente (0–2) | No hay validaciones o los errores rompen la app. |

## 6. Diseño, responsive y UX — 10 pts

| Nivel | Descripción |
|---|---|
| 🟢 Excelente (10) | Diseño coherente (paleta, tipografía, espacios). Es responsive (mobile, tablet, desktop). Estados claros: loading, vacío, error. Buena jerarquía visual y navegación intuitiva. Accesibilidad básica (contraste, labels en formularios). |
| 🔵 Bueno (7) | Diseño cuidado pero algún breakpoint se rompe o faltan estados de loading/empty. |
| 🟡 Aceptable (5) | Funciona en desktop pero no es responsive, o el diseño es muy plano sin jerarquía. |
| 🔴 Insuficiente (0–2) | UI sin estilos o muy descuidada; problemas serios de usabilidad. |

## 7. Arquitectura del frontend — 10 pts

| Nivel | Descripción |
|---|---|
| 🟢 Excelente (10) | Carpetas organizadas por capas o features. Componentes reutilizables (botones, inputs, cards) separados de páginas. Lógica de negocio fuera de los componentes (servicios/hooks/store). TypeScript con tipos correctos (no `any` indiscriminado). Manejo de estado consistente (Context, Redux, Zustand, etc.). |
| 🔵 Bueno (7) | Buena organización general pero algunos componentes tienen lógica mezclada o usan `any` en lugares clave. |
| 🟡 Aceptable (5) | Estructura plana; muchos componentes grandes con lógica y vista mezclada. |
| 🔴 Insuficiente (0–2) | Todo en uno o dos archivos; sin tipos; sin separación de responsabilidades. |

## 8. Consumo correcto de la API REST — 10 pts

| Nivel | Descripción |
|---|---|
| 🟢 Excelente (10) | Existe una capa centralizada (servicios/cliente HTTP) para llamar a la API. El token se inyecta automáticamente en headers. Los formatos enviados/recibidos coinciden con el contrato (fechas ISO, enums correctos, paginación con `meta`). Maneja códigos de error específicos (404 → "no encontrado", 401 → logout, etc.). |
| 🔵 Bueno (7) | Capa de servicios presente pero algunas requests están sueltas en componentes. Maneja errores genéricamente. |
| 🟡 Aceptable (5) | Llamadas con `fetch` repetidas en muchos componentes; el token se pasa manualmente cada vez. |
| 🔴 Insuficiente (0–2) | No respeta el contrato de la API (envía tipos incorrectos, no envía el token, ignora `meta`). |

## 9. Routing y protección de rutas — 5 pts

| Nivel | Descripción |
|---|---|
| 🟢 Excelente (5) | Routing completo (login, registro, dashboard, lista, detalle, crear/editar, admin). Las rutas privadas redirigen a login si no hay sesión. La ruta `/admin` redirige a un usuario no-admin. Hay 404 para rutas inexistentes. |
| 🔵 Bueno (4) | Routing funcional pero falta protección consistente en alguna ruta. |
| 🟡 Aceptable (2) | Rutas básicas funcionando pero las privadas son accesibles sin login. |
| 🔴 Insuficiente (0–1) | Una sola página o sin routing real. |

## 10. Calidad del código — 5 pts

| Nivel | Descripción |
|---|---|
| 🟢 Excelente (5) | Nombres claros y consistentes. Funciones pequeñas. Sin código muerto. Formato uniforme (Prettier/ESLint configurados). Sin warnings ni errores en consola. |
| 🔵 Bueno (4) | Código legible con detalles menores (algún nombre confuso, console.log olvidados). |
| 🟡 Aceptable (2) | Código funcional pero descuidado: nombres genéricos (`data`, `temp`), funciones largas, muchos warnings. |
| 🔴 Insuficiente (0–1) | Código difícil de leer o entender. |

## 11. Despliegue y entrega — 5 pts

| Nivel | Descripción |
|---|---|
| 🟢 Excelente (5) | Repositorio público en GitHub con README completo (cómo instalar, correr, qué variables de entorno, screenshots o link de demo). App desplegada (Vercel, Netlify, Render, etc.) y funcionando contra la API. Commits con mensajes descriptivos. |
| 🔵 Bueno (4) | Repo + README adecuados; app desplegada pero con algún detalle (variables sin documentar, link roto temporal). |
| 🟡 Aceptable (2) | Repo entregado pero sin despliegue, o README pobre. |
| 🔴 Insuficiente (0–1) | Sin repositorio o entrega tardía sin justificación. |

---

## Penalizaciones

| Situación | Descuento |
|---|---|
| Entrega tarde (hasta 24h) | −10 pts |
| Entrega tarde (24–48h) | −25 pts |
| Entrega tarde (>48h) | No se acepta |
| Plagio detectado (código copiado tal cual de otro estudiante o tutorial sin adaptación) | Nota 0 + reporte académico |
| Uso de la API de un compañero en vez de la oficial | −20 pts |
| Credenciales/secretos commiteados al repo (`.env` con valores reales) | −5 pts |

## Bonificaciones (opcionales, hasta +10 pts extra)

| Bonus | Pts |
|---|---|
| Pruebas unitarias o de integración significativas | +5 |
| Internacionalización (i18n) | +2 |
| Dark mode funcional | +2 |
| PWA / instalable | +3 |
| Animaciones / micro-interacciones bien logradas | +2 |
| Filtros adicionales útiles más allá de los mínimos (por rango de fechas, por monto) | +2 |

> Los puntos extra **no superan los 100 totales**; se usan para compensar descuentos en otros criterios.

---

## Cómo se evalúa en la sustentación

Durante la sustentación cada estudiante deberá:

1. **Demo en vivo** (≤ 5 min): registro → login → crear ticket → editar → eliminar → dashboard → admin (con un usuario admin previamente creado).
2. **Recorrido del código** (≤ 3 min): explicar la estructura de carpetas, dónde vive la lógica de auth, cómo consume la API.
3. **Preguntas del docente** (≤ 5 min): justificar decisiones técnicas, manejar errores en vivo, modificar algo en caliente.

La sustentación valida lo que la rúbrica midió por revisión del repo. **Si no se sustenta, la nota máxima es 60/100.**

---

## Checklist rápida para autoevaluarse antes de entregar

- [ ] Registro funciona y muestra errores del backend
- [ ] Login persiste sesión al refrescar
- [ ] Logout limpia el token
- [ ] Puedo crear, ver, editar y eliminar tickets
- [ ] Tras crear/editar/eliminar, la lista se actualiza automáticamente
- [ ] El dashboard muestra los conteos correctos
- [ ] La página `/admin` solo es accesible para admin y muestra tickets de todos
- [ ] Los filtros y paginación funcionan combinados
- [ ] Los formularios validan en cliente y muestran errores junto al campo
- [ ] La app es usable en mobile
- [ ] No hay `console.log` ni `any` regados
- [ ] El `.env` NO está commiteado; el `.env.example` SÍ
- [ ] El README explica cómo correr el proyecto
- [ ] Hay un link de demo desplegado
- [ ] El repositorio es público y acepto colaboradores si me lo piden

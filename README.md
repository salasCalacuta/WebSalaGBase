# WebSalasDeEnsayo.Version2.26

## Cambios y Mejoras - Versión 2.26

### 1. Configuración de Base de Datos Supabase
- Se incluyó el script SQL completo para la creación de todas las tablas necesarias (`reservations`, `products`, `transactions`, `maintenance`, `consumptions`, `shifts`, `contacts`, `pending_tasks`, `rooms`, `config`).
- Se resolvieron errores de relación inexistente (`relation "config" does not exist`) proporcionando la estructura inicial.

### 2. Preparación para Despliegue en Render
- Guía detallada para la sincronización y despliegue del sitio online.
- Configuración de variables de entorno críticas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PATH`).

### 3. Sincronización Robusta
- Mejora en el manejo de errores de sincronización cuando faltan columnas en la base de datos, permitiendo que la aplicación siga funcionando localmente mientras se actualiza el esquema.

### 4. Actualización de Versión
- El proyecto ha sido oficialmente renombrado a **WebSalasDeEnsayo.Version2.26**.
- Se actualizó el número de versión a **v2.26** en el pie de página, metadatos y archivos de configuración.

---

## Cambios y Mejoras - Versión 2.25

### 1. Reestructuración del Panel de Administración
- **Nueva Solapa "Encabezado":** Se trasladó la sección de "Links del Encabezado" a esta nueva solapa para una gestión más enfocada de la identidad visual superior.
- **Nueva Solapa "Administración":** Se agruparon las secciones de "Personal de Staff" y "Categorías" (Ingresos/Egresos) en esta nueva solapa, centralizando la gestión administrativa global.
- **Renombramiento de "Admin":** La solapa anteriormente llamada "Admin" ahora se denomina **"Resumen Mensual"**, reflejando mejor su propósito de análisis de flujo de caja y estadísticas.

### 2. Actualización de Versión y Proyecto
- El proyecto ha sido oficialmente renombrado a **WebSalasDeEnsayo.Version2.25**.
- Se actualizó el número de versión a **v2.25** en el pie de página, metadatos y archivos de configuración (`package.json`, `metadata.json`).

### 3. Mantenimiento de Estética y Lógica
- Se mantuvo la coherencia visual (bordes dorados, fondo negro, tipografía en mayúsculas) y la lógica de permisos ya implementada en versiones anteriores.

---

# WebSalasDeEnsayo.Version2.24

# WebSalasDeEnsayo.Version2.23

### 1. Gestión de Links del Encabezado
- Se agregó la posibilidad de asociar una imagen personalizada a cada link del encabezado desde la sección de configuración.
- Estas imágenes se muestran en el encabezado junto al texto del link.
- Se eliminaron los iconos fijos de "El Espacio", "Salas" y "Nosotros" para dar lugar a una configuración más dinámica.

### 2. Imagen Principal Configurable
- La imagen principal de la pantalla de inicio ahora es configurable a través de `GlobalConfig`.
- Se estableció una imagen predeterminada de alta calidad para el inicio.

### 3. Gestión Dinámica de Salas y Productos
- Ahora es posible modificar el nombre de las salas directamente desde la sección de "Precios".
- Se habilitó la opción de eliminar salas.
- Se habilitó la opción de modificar nombres y eliminar ítems de la barra, instrumentos y vitrina desde la sección de "Precios".

### 4. Control de Acceso para Staff
- Los administradores ahora pueden definir permisos específicos para cada usuario del staff, limitando las secciones que pueden visualizar (Bandas, Barra, Vitrina, Instrumentos, Cierre, etc.).
- Se agregó la posibilidad de asignar una clave personalizada a cada usuario del staff para un acceso más seguro.

### 5. Actualización de Usuarios y Seguridad
- El usuario administrador "oveja" fue renombrado a "**Encargado**".
- Se actualizó la clave del usuario "Encargado" a `S41a5_=dE!#3nSaY0`.
- Se implementó una lógica de permisos en el frontend para filtrar las vistas disponibles según el perfil del usuario logueado.

### 6. Renombramiento del Proyecto
- El proyecto fue oficialmente renombrado a **WebSalasDeEnsayo.Version2.23**.
- Se actualizaron `package.json`, `metadata.json` y la documentación general.

---

## Pasos a seguir para el Administrador:
1. **Configurar Staff:** Ir a la sección de configuración y asignar permisos y claves a cada integrante del personal.
2. **Personalizar Encabezado:** Si se desea, subir imágenes para los links del encabezado para una estética más personalizada.
3. **Revisar Precios y Nombres:** Verificar que los nombres de las salas y productos sean los correctos, editándolos si es necesario desde la vista de Precios.

# WebSalasDeEnsayo.Version2.22 - Configuración Dinámica y Gestión Genérica

Esta versión transforma la aplicación en una plataforma genérica y altamente configurable, permitiendo que casi todos los aspectos del sistema sean gestionados directamente por el administrador sin necesidad de modificar el código fuente.

## Mejoras v2.22 (WebSalasDeEnsayo.Version2.22)

1.  **Configuración Global Dinámica:** Se ha implementado un sistema de configuración centralizado (`GlobalConfig`) que permite gestionar:
    -   **Personal (Staff):** Carga y modificación manual de los usuarios que integran el equipo de trabajo.
    -   **Categorías de Transacciones:** Definición personalizada de categorías para Cobros (Ingresos) y Pagos (Egresos).
    -   **Enlaces del Encabezado (Header):** Los links de navegación superior son ahora editables desde la sección "Salas" del panel de administración.
    -   **Foto Principal:** La imagen de la pantalla de inicio es ahora genérica y configurable.
2.  **Gestión de Salas Mejorada:**
    -   Nombres y fotos de las salas son totalmente editables.
    -   Se integró la gestión de colores (Hex) para una personalización visual coherente en todo el sistema (calendario, cierres, etc.).
3.  **Mantenimiento y Equipamiento:**
    -   **Items de Mantenimiento:** Ahora es posible agregar nuevos items de mantenimiento (aires acondicionados, consolas, etc.) manualmente para cada sala.
    -   **Instrumentos:** La lista de instrumentos para alquiler se nutre dinámicamente de los productos categorizados como `INSTRUMENT`.
4.  **Productos y Stock:**
    -   Los productos de Barra y Vitrina pueden ser creados, editados y eliminados desde la sección de Precios.
    -   El control de stock permite ajustes manuales precisos.
5.  **Calendario y Reservas:**
    -   El calendario es ahora 100% dinámico, basándose en las salas y configuraciones cargadas.
    -   La selección de instrumentos en nuevas reservas utiliza la lista dinámica de productos.
6.  **Persistencia y Sincronización:**
    -   Todos los cambios de configuración se sincronizan en tiempo real a través de Supabase y se mantienen localmente para mayor velocidad.
7.  **Renombrado de Proyecto:** El proyecto ha sido oficialmente renombrado a `WebSalasDeEnsayo.Version2.22`.

## Pasos para la Implementación de Cambios

1.  **Configuración Inicial:** Al iniciar la aplicación por primera vez, el sistema cargará valores predeterminados para el personal, categorías y enlaces.
2.  **Personalización del Header:** Diríjase a **Admin > Salas**. Al final de la página encontrará la sección de **Configuración de Enlaces del Encabezado**. Allí puede cambiar los nombres y destinos de los links.
3.  **Gestión de Personal:** En la misma sección de **Admin > Salas**, puede gestionar la lista de usuarios de Staff que aparecerán en las planillas de horarios y pagos.
4.  **Categorías de Caja:** Configure sus categorías de ingresos y egresos en la sección de configuración para que se reflejen en las vistas de Cobros y Pagos.
5.  **Mantenimiento:** En la vista de **Mantenimiento**, utilice el botón "+ Agregar Item" en cada sala para registrar el equipamiento que desea monitorear.
6.  **Sincronización:** Asegúrese de que las variables de entorno de Supabase estén correctamente configuradas para que los cambios se guarden en la nube.

# Salas Calacuta v2.21 - Estética Personalizada de Pop-ups

Esta versión introduce una estética personalizada para los cuadros de diálogo de confirmación y entrada de datos, alineada con la identidad visual del proyecto.

## Mejoras v2.21

1.  **Pop-ups Personalizados:** Se han reemplazado los diálogos nativos del navegador (`prompt`, `confirm`) por componentes personalizados con:
    -   Borde verde claro y fondo negro.
    -   Texto blanco y tipografía en mayúsculas.
    -   Botones con borde rojo y letras azules para una estética retro/tecnológica.
2.  **Mantenimiento:** Actualización de versión a v2.21.

## Mejoras v2.20

1.  **Pendientes Independientes:** Ahora los pendientes son privados por usuario. Cada administrador o staff solo verá las tareas que él mismo haya creado, permitiendo una organización más personal y eficiente.
2.  **Control de Stock con Cantidades:** Al agregar o restar stock en la sección de Barra o Vitrina, el sistema ahora solicita la cantidad exacta de unidades, en lugar de sumar/restar de a una.
3.  **Mantenimiento:** Actualización de versión a v2.20 y optimización de metadatos.

## Mejoras v2.19

1.  **Imágenes Locales:** Migración de enlaces externos (Google Drive) a rutas locales para mayor velocidad y confiabilidad.
2.  **Robustez en OAuth:** Limpieza automática de URLs para la sincronización de agenda, evitando el Error 400.
3.  **Mantenimiento:** Actualización de metadatos y versión del sistema a v2.19.

## Mejoras v2.18

1.  **Carga de Saldo Inicial:** Se corrigió el error donde el saldo se actualizaba con cada tecla presionada. Ahora se ingresa el valor y se confirma mediante un botón **"Guardar"**.
2.  **Consulta Histórica de Agenda:** En la sección de Agenda (usuario `uruguayo`), se añadió una nueva sección al final llamada **"Consulta Histórica de Bandas"**. Permite filtrar por rango de fechas para ver qué bandas ensayaron anteriormente.
3.  **Botones de Acción:** Se incluyeron botones de **"Aceptar"** (para ejecutar la consulta) y **"Limpiar"** (para borrar los resultados) en la sección histórica.
4.  **Renombrado de Proyecto:** El proyecto ha sido actualizado a `SalasCalacuta.Version2.18`.
5.  **Versión Actualizada:** Se incrementó la versión a v2.18 en todo el sistema.

## Mejoras v2.17

1.  **Fix Express v5 Wildcard:** Se actualizó `app.get("*")` a `app.get("*all")` en `server.ts`. Express v5 requiere que los parámetros comodín tengan nombre, lo que causaba que el sitio no cargara en Render.
2.  **Fix CSS Import Order:** Se movió el `@import` de Google Fonts al inicio de `index.css` para cumplir con el estándar CSS y eliminar advertencias de construcción.
3.  **Vite Chunk Size:** Se aumentó el límite de advertencia de tamaño de chunk a 2000kB para reducir ruido en los logs de despliegue.
4.  **Guía de Google Calendar:** Se añadieron instrucciones detalladas para configurar las URIs de redirección en Google Cloud Console.
5.  **Versión Actualizada:** Se incrementó la versión a v2.16.

## 📅 Configuración de Google Calendar (Urgente para "uruguayo")

Si al intentar sincronizar aparece el error *"Check that the URL was entered correctly"*, siga estos pasos:

1.  Vaya a [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Seleccione su proyecto y edite su **ID de cliente de OAuth 2.0**.
3.  En **"URIs de redireccionamiento autorizados"**, debe agregar exactamente estas dos URLs (reemplace con su URL real si es distinta):
    *   `https://ais-dev-ezkv3z5en6p4r4ytojc73b-34272785097.us-east1.run.app/api/auth/google/callback`
    *   `https://ais-pre-ezkv3z5en6p4r4ytojc73b-34272785097.us-east1.run.app/api/auth/google/callback`
4.  Guarde los cambios y espere 5 minutos antes de volver a intentar en la app.

## 🚀 Guía Paso a Paso para Actualizar en Render.com

Para solucionar el error de acceso y asegurar que los cambios se apliquen:

### 1. Variables de Entorno (Environment Variables)
Asegúrese de que en la pestaña **"Environment"** de su servicio en Render tenga estas variables:
*   `VITE_SUPABASE_URL`: (Su URL de Supabase)
*   `VITE_SUPABASE_ANON_KEY`: (Su Key de Supabase)
*   `NODE_ENV`: `production`
*   `GOOGLE_CLIENT_ID`: (Su Client ID de Google)
*   `GOOGLE_CLIENT_SECRET`: (Su Client Secret de Google)
*   `APP_URL`: `https://ais-dev-ezkv3z5en6p4r4ytojc73b-34272785097.us-east1.run.app` (Asegúrese de que coincida con la URL de su sitio)

### 2. Despliegue Limpio (Obligatorio)
*   Vaya al botón azul **"Manual Deploy"** en la esquina superior derecha de su Dashboard en Render.
*   Seleccione **"Clear Build Cache & Deploy"**. Esto es fundamental para que el sistema reconozca los cambios en los scripts de inicio y las dependencias.

## Mejoras v2.15

1.  **Fix Definitivo Build (Render.com):** Se actualizó el script de construcción a `npx vite build`. El uso de `npx` garantiza que se busque el binario local de `vite` dentro de `node_modules` de forma explícita, incluso si el PATH del entorno no se actualiza correctamente.
2.  **Consolidación de Dependencias:** Se garantiza que todas las herramientas de construcción estén en la sección `dependencies` para evitar que sean omitidas en entornos de producción.
3.  **Renombrado de Proyecto:** El proyecto ha sido actualizado a `SalasCalacuta.Version2.13`.
4.  **Versión Actualizada:** Se ha incrementado la versión a v2.13 en todo el sistema.

## Pasos Críticos para Render.com:

Para asegurar que el despliegue funcione, configure su servicio en Render con estos valores EXACTOS:

*   **Build Command:** `npm install && npm run build`
*   **Start Command:** `npm start`
*   **Environment Variables:**
    *   `VITE_SUPABASE_URL`: (Su URL)
    *   `VITE_SUPABASE_ANON_KEY`: (Su Key)
    *   `NODE_ENV`: `production`

## Mejoras v2.12

1.  **Compatibilidad con Render.com:** Se ajustó la configuración del servidor para utilizar el puerto dinámico asignado por Render (`process.env.PORT`).
2.  **Optimización de Construcción:** Se aumentó el límite de advertencia de tamaño de "chunks" en Vite para evitar errores durante el despliegue en Render.
3.  **Renombrado de Proyecto:** El proyecto ha sido actualizado a `SalasCalacuta.Version2.11`.
4.  **Sincronización Supabase:** Se mantiene la integración con Supabase. **Importante:** Al configurar el servicio en Render, asegúrese de añadir las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5.  **Versión Actualizada:** Se ha incrementado la versión a v2.11 en todo el sistema.

## Mejoras v2.10

1.  **Resiliencia de Acceso (Login):** Se ha reestructurado la lógica de inicio de sesión para priorizar la validación de credenciales en el cliente. Esto garantiza que los administradores y el personal puedan ingresar incluso si el servidor de API no está disponible o si el despliegue es puramente estático (como en Netlify).
2.  **Compatibilidad Total con Netlify:** Se eliminó la dependencia obligatoria del endpoint `/api/auth/login` para los usuarios principales, solucionando definitivamente el error de "conexión con el servidor".
3.  **Renombrado de Proyecto:** El proyecto ha sido actualizado a `SalasCalacuta.Version2.10`.
4.  **Sincronización Supabase:** Se mantiene la integración con Supabase para la persistencia de datos en la nube. **Nota:** Asegúrese de configurar las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el panel de Netlify para habilitar la sincronización.
5.  **Versión Actualizada:** Se ha incrementado la versión a v2.10 en todo el sistema.

## Mejoras v2.09

1.  **Compatibilidad con Netlify:** Se implementó una lógica de "fallback" en el inicio de sesión. Si el servidor Express no está disponible (como sucede en despliegues estáticos de Netlify), la aplicación utiliza una validación local segura para permitir el acceso.
2.  **Renombrado de Proyecto:** El proyecto ha sido renombrado internamente a `SalasCalacuta.Version2.09`.
3.  **Corrección de Errores de Conexión:** Se solucionó el error "Error al conectar con el servidor" que ocurría al intentar ingresar desde el nuevo dominio `calacuta-salas.netlify.app`.
4.  **Sincronización Supabase:** Se optimizó la conexión con Supabase para manejar cambios de dominio y asegurar que los datos se mantengan sincronizados.
5.  **Versión Actualizada:** Se ha incrementado la versión a v2.09 en todo el sistema.

## Mejoras v2.08

1.  **Ajuste de Roles Administrativos:** Se han redefinido los privilegios de acceso. Los únicos administradores con acceso total son `Encargado` y `uruguayo`.
2.  **Usuario Leo:** El usuario `leo` ha sido movido del rol de administrador al rol de personal (staff), manteniendo su acceso operativo pero restringiendo funciones críticas de gestión.
3.  **Restricción de Funciones Críticas:** El botón de "REINICIO A CERO" y el "Resumen Mes Anterior" ahora son exclusivos para `Encargado` y `uruguayo`.
4.  **Versión Actualizada:** Se ha incrementado la versión a v2.08 en todo el sistema.
5.  **Sincronización Supabase:** Se mantiene la lógica de sincronización en tiempo real con Supabase para asegurar la integridad de los datos en todos los dispositivos.

## Mejoras Previas (v2.0.3)

1.  **Acceso Directo Admin:** Se ha eliminado la necesidad de visitar la ruta secreta para iniciar sesión como administrador, simplificando el acceso diario.
2.  **Versión Visible:** Se añadió el número de versión en el pie de página para facilitar el seguimiento de actualizaciones.
3.  **Corrección de Login:** Se mejoró la robustez de la comparación de credenciales en el servidor, evitando fallos por espacios accidentales o caracteres especiales.
4.  **Soporte Multiusuario Admin:** El usuario `uruguayo` ahora cuenta con los mismos privilegios especiales de visualización que el usuario `Encargado`.

## Mejoras de Seguridad v2.0.2

1.  **Headers de Seguridad (Netlify):** Se han implementado headers HTTP (`_headers`) para proteger contra ataques XSS, Clickjacking y Sniffing.
2.  **Row Level Security (Supabase):** Se recomienda activar RLS en todas las tablas. Ver sección de configuración abajo.
3.  **URL de Admin Oculta:** El acceso al login de administrador ahora requiere visitar una ruta secreta configurada vía `VITE_ADMIN_PATH`.
4.  **Autenticación Segura:** El login se procesa en el servidor con validación de honeypot y captcha matemático.
5.  **Rate Limiting:** Se ha limitado el número de intentos de login por IP (5 intentos cada 15 minutos).
6.  **Control de Acceso (Agenda):** Se ha restringido el acceso a la vista de "Agenda" para el rol `RESERVAS` y el usuario `Oveja`.

## Configuración de Supabase RLS

Para una seguridad total, ejecute el siguiente SQL en el editor de Supabase:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso (Ejemplo para lectura pública, escritura restringida)
-- Nota: Ajuste según sus necesidades específicas de negocio.
CREATE POLICY "Allow public read" ON reservations FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON reservations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- ... repetir para otras tablas ...
```

## Variables de Entorno Requeridas

Asegúrese de configurar las siguientes variables en su entorno de despliegue:

- `ADMIN_PASSWORD`: Clave para usuarios Leo/Oveja.
- `EVENTOS_PASSWORD`: Clave para usuario Eventos.
- `STAFF_PASSWORD`: Clave para usuarios Staff.
- `RESERVAS_PASSWORD`: Clave para usuario Reservas.
- `VITE_ADMIN_PATH`: Ruta secreta para habilitar el login de admin (ej: `secreto123`).
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: Para la sincronización con Google Calendar.

## Pasos para el Despliegue (v2.21)

1.  **Repositorio:** Asegúrese de que todos los cambios estén en su rama principal de GitHub.
2.  **Render.com:**
    -   Conecte su repositorio a un nuevo **Web Service**.
    -   **Build Command:** `npm run build`
    -   **Start Command:** `npm start`
    -   **Environment Variables:** Configure todas las variables listadas arriba, incluyendo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3.  **Supabase:**
    -   Cree un nuevo proyecto en Supabase.
    -   Ejecute el script SQL inicial (proporcionado en versiones anteriores o contacte al soporte) para crear las tablas y políticas.
4.  **Google Cloud Console:**
    -   Configure una pantalla de consentimiento OAuth.
    -   Cree credenciales de ID de cliente de OAuth 2.0.
    -   Agregue la URL de su aplicación en Render (ej: `https://tu-app.onrender.com`) a los "Orígenes de JavaScript autorizados" y "URI de redireccionamiento autorizados".

---
*Salas Calacuta - Gestión Profesional de Salas de Ensayo*

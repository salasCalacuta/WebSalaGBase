# Instrucciones de Despliegue - WebSalasDeEnsayo.Version2.22

Este proyecto está listo para ser desplegado en varias plataformas.

## 1. Netlify (Recomendado para el Frontend)
1. Sube el código a un repositorio de GitHub.
2. Conecta el repositorio a Netlify.
3. Configuración de Build:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. El archivo `netlify.toml` ya está configurado para manejar las rutas de React.

## 2. Firebase Hosting
1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Inicia sesión: `firebase login`
3. Inicializa el proyecto (si no lo has hecho): `firebase init`
   - Selecciona `Hosting` y `Firestore`.
   - Usa `dist` como directorio público.
   - Configura como una Single-Page App (Yes).
4. Despliega: `firebase deploy`
5. El archivo `firebase.json` y `firestore.rules` ya están configurados.

## 3. CodePen.io
Para importar en CodePen, lo más sencillo es usar el archivo ZIP generado o copiar los archivos principales:
1. Crea un nuevo "Project" en CodePen.
2. Sube los archivos de la carpeta `src` y el `index.html`.
3. Asegúrate de incluir las dependencias necesarias en la configuración del proyecto (Tailwind CSS, React, etc.).
*Nota: Debido a que es un proyecto de React con múltiples archivos, se recomienda usar el entorno local o Netlify para una mejor experiencia.*

## 4. Configuración de Firebase (Base de Datos)
Asegúrate de que las variables de entorno o el archivo `firebase-applet-config.json` estén correctamente configurados con las credenciales de tu consola de Firebase.

**IMPORTANTE:**
- He implementado un sistema de **Login Anónimo automático** al cargar la app. Esto permite que la aplicación pueda leer los datos (como las salas y la agenda) sin que el usuario tenga que estar logueado inicialmente, evitando errores de "Permission Denied".
- Asegúrate de habilitar el **"Anonymous Sign-in"** en la pestaña de Authentication de tu consola de Firebase.
- Las reglas de seguridad ya han sido configuradas para permitir lectura a usuarios autenticados (incluyendo anónimos) y restringir la escritura a los roles correspondientes.

## 5. Exportación a CodePen / Netlify
Para llevar este proyecto fuera de aquí:
1. Descarga todos los archivos.
2. En tu entorno local, ejecuta `npm install` para instalar todas las dependencias (Firebase, Lucide, Recharts, etc.).
3. Ejecuta `npm run dev` para probar localmente.
4. Para Netlify, simplemente conecta tu repo y usa los comandos de build mencionados arriba.

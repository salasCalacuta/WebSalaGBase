import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Trust proxy for rate limiting behind Cloud Run/Nginx/Render
  app.set('trust proxy', 1);

  app.use(express.json());

  // Rate limiting for login
  const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 login requests per windowMs
    message: { error: "Demasiados intentos de inicio de sesión. Por favor, intente de nuevo en 1 minuto." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Secure Login Endpoint
  app.post("/api/auth/login", loginLimiter, (req, res) => {
    const { username, password, honeypot, captchaAnswer, captchaExpected } = req.body;

    // Honeypot check
    if (honeypot) {
      return res.status(400).json({ error: "Bot detected" });
    }

    // Simple Captcha check
    if (captchaAnswer === undefined || captchaExpected === undefined || Number(captchaAnswer) !== Number(captchaExpected)) {
      return res.status(401).json({ error: "Captcha incorrecto. Por favor, resuelva el problema matemático." });
    }

    const userLower = username?.trim().toLowerCase();
    const passTrimmed = password?.trim();

    // 1. Admin Check
    const ADMIN_USERS: Record<string, string> = {
      'encargado': 'S41a5_=dE!#3nSaY0',
      'uruguayo': 'Male&Tefi2017_Malaver'
    };

    if (ADMIN_USERS[userLower] && String(passTrimmed) === String(ADMIN_USERS[userLower])) {
      return res.json({ username: username.trim(), role: 'ADMIN' });
    }

    // 2. Eventos Check
    if (userLower === 'eventos' && passTrimmed === 'Ev/_1A$LPtdx') {
      return res.json({ username: 'Eventos', role: 'EVENTOS' });
    }

    // 3. Staff Check
    const STAFF_PASS = 'Zky76%13!QXb';
    const STAFF_USERS = ['zequi', 'nacho', 'mai', 'ove', 'abi', 'santi', 'marian', 'leo'];
    if (STAFF_USERS.includes(userLower) && passTrimmed === STAFF_PASS) {
      return res.json({ username: username, role: 'STAFF' });
    }

    // 4. Reservas User Check
    if (userLower === 'reservas' && passTrimmed === 'PuBLicRoCk(Ciclon!27') {
      return res.json({ username: 'Reservas', role: 'RESERVAS' });
    }

    // Client check would normally happen against a DB here
    // For now, we'll return an error if no hardcoded user matches
    res.status(401).json({ error: "Credenciales incorrectas" });
  });

  // 1. Get Google Auth URL
  app.get("/api/auth/google/url", (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = process.env.APP_URL?.replace(/\/$/, '') || `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar.events"],
      prompt: "consent"
    });
    res.json({ url });
  });

  // 2. Google Auth Callback
  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = process.env.APP_URL?.replace(/\/$/, '') || `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    try {
      const { tokens } = await client.getToken(code as string);
      // In a real app, you'd store these tokens in a database associated with the user
      // For this demo/prototype, we'll send them back to the client or store in a global var (not recommended for production)
      // We'll use a simple approach for now: send a success message and close the popup
      
      // We can store tokens in a global variable for this session
      client.setCredentials(tokens);
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Autenticación exitosa. Esta ventana se cerrará automáticamente.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      res.status(500).send("Error en la autenticación");
    }
  });

  // 3. Sync to Google Calendar
  app.post("/api/calendar/sync", async (req, res) => {
    const { reservations, tokens } = req.body;
    
    if (!tokens) {
      return res.status(401).json({ error: "No se proporcionaron tokens de acceso" });
    }

    try {
      const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      client.setCredentials(tokens);
      const calendar = google.calendar({ version: "v3", auth: client });

      // For each reservation, create an event
      // To avoid duplicates, we could check if they already exist, but for now we'll just add them
      for (const resv of reservations) {
        const startDateTime = `${resv.date}T${resv.timeStart}:00`;
        const endDateTime = `${resv.date}T${resv.timeEnd}:00`;

        await calendar.events.insert({
          calendarId: "primary",
          requestBody: {
            summary: `Ensayo: ${resv.bandName}`,
            description: `Sala: ${resv.roomId}\nEstado: ${resv.status}`,
            start: {
              dateTime: new Date(startDateTime).toISOString(),
              timeZone: "America/Argentina/Buenos_Aires",
            },
            end: {
              dateTime: new Date(endDateTime).toISOString(),
              timeZone: "America/Argentina/Buenos_Aires",
            },
          },
        });
      }

      res.json({ success: true, message: "Sincronización completada" });
    } catch (error: any) {
      console.error("Calendar Sync Error:", error);
      res.status(500).json({ error: error.message || "Error al sincronizar con Google Calendar" });
    }
  });

  // 4. Sync FROM Google Calendar
  app.get("/api/calendar/fetch", async (req, res) => {
    const { tokens } = req.query;
    
    if (!tokens) {
      return res.status(401).json({ error: "No se proporcionaron tokens de acceso" });
    }

    try {
      const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      client.setCredentials(JSON.parse(tokens as string));
      const calendar = google.calendar({ version: "v3", auth: client });

      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = response.data.items || [];
      const reservations = events.map((event: any) => ({
        id: event.id,
        bandName: event.summary || "Evento sin nombre",
        date: event.start.dateTime ? event.start.dateTime.split("T")[0] : event.start.date,
        timeStart: event.start.dateTime ? event.start.dateTime.split("T")[1].substring(0, 5) : "00:00",
        timeEnd: event.end.dateTime ? event.end.dateTime.split("T")[1].substring(0, 5) : "00:00",
        status: "CONFIRMED",
        description: event.description || "",
      }));

      res.json({ success: true, reservations });
    } catch (error: any) {
      console.error("Calendar Fetch Error:", error);
      res.status(500).json({ error: error.message || "Error al obtener eventos de Google Calendar" });
    }
  });

  // 5. Validate Google Calendar Connection
  app.get("/api/calendar/validate", async (req, res) => {
    const { tokens } = req.query;
    if (!tokens) return res.json({ valid: false });
    
    try {
      const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      client.setCredentials(JSON.parse(tokens as string));
      const calendar = google.calendar({ version: "v3", auth: client });
      await calendar.calendarList.list({ maxResults: 1 });
      res.json({ valid: true });
    } catch (error: any) {
      console.error("Validation Error:", error);
      res.json({ valid: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

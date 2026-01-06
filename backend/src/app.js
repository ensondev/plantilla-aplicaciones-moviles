const express = require("express");
const cors = require("cors");
require("dotenv").config();

module.exports = (models) => {
  const app = express();

  // CORS compatible con Cordova y navegador
  const corsOptions = {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
    credentials: false
  };

  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));
  app.use(express.json());

  // Health check
  app.get("/api/v1/health", (req, res) => {
    res.json({
      ok: true,
      api: "v1",
      proto: req.protocol,
      forwardedProto: req.get("x-forwarded-proto") || null
    });
  });

  // =========================
  // API v1
  // =========================
  const v1 = express.Router();

  // Ejemplo del ingeniero (se mantiene)
  v1.use("/books", require("./routes/v1/books.routes")(models));

  // Rutas del Grupo 4 - Biblioteca / Préstamos
  v1.use("/auth", require("./routes/v1/auth.routes")(models));
  v1.use("/usuarios", require("./routes/v1/usuarios.routes")(models));
  v1.use("/libros", require("./routes/v1/libros.routes")(models));
  v1.use("/prestamos", require("./routes/v1/prestamos.routes")(models));

  app.use("/api/v1", v1);

  // 404
  app.use((req, res) =>
    res.status(404).json({ message: "Not found" })
  );

  return app;
};

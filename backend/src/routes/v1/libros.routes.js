const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const authorizeRole = require("../../middlewares/role.middleware");

module.exports = (models) => {
  const router = express.Router();

  // ==========================
  // GET /api/v1/libros (PÚBLICO)
  // ==========================
  router.get("/", async (req, res) => {
    const rows = await models.Libro.findAll({
      order: [["id_libro", "DESC"]]
    });
    res.json(rows);
  });

  // ==========================
  // GET /api/v1/libros/:id (PÚBLICO)
  // ==========================
  router.get("/:id", async (req, res) => {
    const row = await models.Libro.findByPk(Number(req.params.id));
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  // ==========================
  // POST /api/v1/libros (SOLO DOCENTE)
  // ==========================
  router.post(
    "/",
    auth,
    authorizeRole(["docente"]),
    async (req, res) => {
      const {
        titulo,
        autor,
        editorial,
        anio_publicacion,
        disponible
      } = req.body || {};

      if (!titulo || !autor) {
        return res.status(400).json({
          message: "titulo y autor son obligatorios"
        });
      }

      const created = await models.Libro.create({
        titulo,
        autor,
        editorial: editorial || null,
        anio_publicacion: anio_publicacion ? Number(anio_publicacion) : null,
        disponible: disponible !== undefined ? disponible : true
      });

      res.status(201).json(created);
    }
  );

  // ==========================
  // PUT /api/v1/libros/:id (SOLO DOCENTE)
  // ==========================
  router.put(
    "/:id",
    auth,
    authorizeRole(["docente"]),
    async (req, res) => {
      const row = await models.Libro.findByPk(Number(req.params.id));
      if (!row) return res.status(404).json({ message: "Not found" });

      const payload = { ...req.body };

      if (
        payload.anio_publicacion !== undefined &&
        payload.anio_publicacion !== null &&
        payload.anio_publicacion !== ""
      ) {
        payload.anio_publicacion = Number(payload.anio_publicacion);
      }

      if (payload.anio_publicacion === "") payload.anio_publicacion = null;

      await row.update(payload);
      res.json(row);
    }
  );

  // ==========================
  // DELETE /api/v1/libros/:id (SOLO DOCENTE)
  // ==========================
  router.delete(
    "/:id",
    auth,
    authorizeRole(["docente"]),
    async (req, res) => {
      const row = await models.Libro.findByPk(Number(req.params.id));
      if (!row) return res.status(404).json({ message: "Not found" });

      await row.destroy();
      res.status(204).send();
    }
  );

  return router;
};

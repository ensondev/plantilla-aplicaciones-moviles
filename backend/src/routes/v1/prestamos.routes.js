const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const authorizeRole = require("../../middlewares/role.middleware");

module.exports = (models) => {
  const router = express.Router();
  const { Prestamo, Usuario, Libro } = models;

  // ==========================
  // GET /api/v1/prestamos
  // Docente → todos
  // Estudiante → solo los suyos
  // ==========================
  router.get("/", auth, async (req, res) => {
    const where =
      req.user.tipo === "estudiante"
        ? { id_usuario: req.user.id_usuario }
        : {};

    const data = await Prestamo.findAll({
      where,
      order: [["id_prestamo", "DESC"]],
      include: [
        {
          model: Usuario,
          attributes: ["id_usuario", "nombre", "correo", "tipo"]
        },
        {
          model: Libro,
          attributes: ["id_libro", "titulo", "autor", "disponible"]
        }
      ]
    });

    res.json(data);
  });

  // ==========================
  // GET /api/v1/prestamos/:id
  // ==========================
  router.get("/:id", auth, async (req, res) => {
    const prestamo = await Prestamo.findByPk(req.params.id, {
      include: [Usuario, Libro]
    });

    if (!prestamo) {
      return res.status(404).json({ message: "Préstamo no encontrado" });
    }

    if (
      req.user.tipo === "estudiante" &&
      prestamo.id_usuario !== req.user.id_usuario
    ) {
      return res.status(403).json({
        message: "No tienes permiso para ver este préstamo"
      });
    }

    res.json(prestamo);
  });

  // ==========================
  // POST /api/v1/prestamos
  // Docente y Estudiante
  // ==========================
  router.post(
    "/",
    auth,
    authorizeRole(["docente", "estudiante"]),
    async (req, res) => {
      const { id_usuario, id_libro } = req.body;

      if (
        req.user.tipo === "estudiante" &&
        id_usuario !== req.user.id_usuario
      ) {
        return res.status(403).json({
          message: "No puedes crear préstamos para otro usuario"
        });
      }

      const usuario = await Usuario.findByPk(id_usuario);
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no existe" });
      }

      const libro = await Libro.findByPk(id_libro);
      if (!libro) {
        return res.status(404).json({ message: "Libro no existe" });
      }

      if (!libro.disponible) {
        return res.status(400).json({
          message: "El libro no está disponible"
        });
      }

      const prestamo = await Prestamo.create({
        id_usuario,
        id_libro,
        fecha_prestamo: new Date(),
        estado: "prestado"
      });

      await libro.update({ disponible: false });

      res.status(201).json(prestamo);
    }
  );

  // ==========================
  // PUT /api/v1/prestamos/:id
  // Devolver libro
  // ==========================
  router.put("/:id", auth, async (req, res) => {
    const prestamo = await Prestamo.findByPk(req.params.id);

    if (!prestamo) {
      return res.status(404).json({ message: "Préstamo no encontrado" });
    }

    if (
      req.user.tipo === "estudiante" &&
      prestamo.id_usuario !== req.user.id_usuario
    ) {
      return res.status(403).json({
        message: "No puedes devolver este préstamo"
      });
    }

    if (prestamo.estado === "devuelto") {
      return res.status(400).json({
        message: "El préstamo ya fue devuelto"
      });
    }

    await prestamo.update({
      estado: "devuelto",
      fecha_devolucion: new Date()
    });

    const libro = await Libro.findByPk(prestamo.id_libro);
    if (libro) {
      await libro.update({ disponible: true });
    }

    res.json(prestamo);
  });

  // ==========================
  // DELETE /api/v1/prestamos/:id
  // SOLO DOCENTE
  // ==========================
  router.delete(
    "/:id",
    auth,
    authorizeRole(["docente"]),
    async (req, res) => {
      const prestamo = await Prestamo.findByPk(req.params.id);

      if (!prestamo) {
        return res.status(404).json({ message: "Préstamo no encontrado" });
      }

      if (prestamo.estado === "prestado") {
        const libro = await Libro.findByPk(prestamo.id_libro);
        if (libro) {
          await libro.update({ disponible: true });
        }
      }

      await prestamo.destroy();
      res.status(204).send();
    }
  );

  return router;
};

const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../../middlewares/auth.middleware");
const authorizeRole = require("../../middlewares/role.middleware");

module.exports = (models) => {
  const router = express.Router();

  // ==========================
  // GET /api/v1/usuarios
  // SOLO DOCENTE
  // ==========================
  router.get(
    "/",
    auth,
    authorizeRole(["docente"]),
    async (req, res) => {
      const rows = await models.Usuario.findAll({
        attributes: { exclude: ["password"] },
        order: [["id_usuario", "DESC"]]
      });
      res.json(rows);
    }
  );

  // ==========================
  // GET /api/v1/usuarios/:id
  // DOCENTE o EL MISMO USUARIO
  // ==========================
  router.get("/:id", auth, async (req, res) => {
    const id = Number(req.params.id);

    if (
      req.user.tipo !== "docente" &&
      req.user.id_usuario !== id
    ) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const row = await models.Usuario.findByPk(id, {
      attributes: { exclude: ["password"] }
    });

    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  // ==========================
  // POST /api/v1/usuarios
  // PÚBLICO (REGISTRO)
  // ==========================
  router.post("/", async (req, res) => {
    try {
      const { nombre, correo, password, tipo, activo } = req.body || {};

      if (!nombre || !correo || !password || !tipo) {
        return res.status(400).json({
          message: "nombre, correo, password y tipo son obligatorios"
        });
      }

      const existe = await models.Usuario.findOne({ where: { correo } });
      if (existe) {
        return res.status(409).json({ message: "El correo ya está registrado" });
      }

      const hashPassword = await bcrypt.hash(password, 10);

      const created = await models.Usuario.create({
        nombre,
        correo,
        password: hashPassword,
        tipo,
        activo: activo !== undefined ? activo : true
      });

      const { password: _, ...usuarioSinPassword } = created.toJSON();
      res.status(201).json(usuarioSinPassword);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear usuario" });
    }
  });

  // ==========================
  // PUT /api/v1/usuarios/:id
  // DOCENTE o EL MISMO USUARIO
  // ==========================
  router.put("/:id", auth, async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (
        req.user.tipo !== "docente" &&
        req.user.id_usuario !== id
      ) {
        return res.status(403).json({ message: "Acceso denegado" });
      }

      const row = await models.Usuario.findByPk(id);
      if (!row) return res.status(404).json({ message: "Not found" });

      const payload = { ...req.body };

      // 🔒 NUNCA permitir cambiar el rol desde aquí
      delete payload.tipo;

      // Si se envía password → volver a hashear
      if (payload.password) {
        payload.password = await bcrypt.hash(payload.password, 10);
      }

      await row.update(payload);

      const { password: _, ...usuarioSinPassword } = row.toJSON();
      res.json(usuarioSinPassword);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar usuario" });
    }
  });

  // ==========================
  // DELETE /api/v1/usuarios/:id
  // SOLO DOCENTE
  // ==========================
  router.delete(
    "/:id",
    auth,
    authorizeRole(["docente"]),
    async (req, res) => {
      const row = await models.Usuario.findByPk(Number(req.params.id));
      if (!row) return res.status(404).json({ message: "Not found" });

      await row.destroy();
      res.status(204).send();
    }
  );

  return router;
};

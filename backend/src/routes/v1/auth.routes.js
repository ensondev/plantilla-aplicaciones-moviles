const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = (models) => {
  const router = express.Router(); // <-- Esto es lo que falta

  router.post("/login", async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ message: "Correo y password requeridos" });
    }

    const usuario = await models.Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 🔒 Validar usuario activo
    if (!usuario.activo) {
      return res.status(403).json({
        message: "Usuario inactivo. Contacte al administrador"
      });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        tipo: usuario.tipo
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "2h" }
    );

    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        tipo: usuario.tipo
      }
    });
  });

  return router; // <-- Exportamos el router
};

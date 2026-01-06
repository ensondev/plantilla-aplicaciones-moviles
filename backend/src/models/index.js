const { sequelize } = require("../config/database");
require("dotenv").config();

const tablePrefix = process.env.TABLE_PREFIX || "";

const Book = require("./Book")(sequelize, tablePrefix);
const Usuario = require("./Usuario")(sequelize, tablePrefix);
const Libro = require("./Libro")(sequelize, tablePrefix);
const Prestamo = require("./Prestamo")(sequelize, tablePrefix);

// Relaciones (opcional pero recomendado)
Usuario.hasMany(Prestamo, { foreignKey: "id_usuario" });
Libro.hasMany(Prestamo, { foreignKey: "id_libro" });
Prestamo.belongsTo(Usuario, { foreignKey: "id_usuario" });
Prestamo.belongsTo(Libro, { foreignKey: "id_libro" });

async function syncDb() {
  await sequelize.authenticate();
  await sequelize.sync(); // NO borra, solo sincroniza
}

module.exports = {
  sequelize,
  models: { Book, Usuario, Libro, Prestamo },
  syncDb
};

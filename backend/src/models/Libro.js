const { DataTypes } = require("sequelize");

module.exports = (sequelize, tablePrefix) => {
  return sequelize.define("Libro", {
    id_libro: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    autor: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    editorial: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    anio_publicacion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: `${tablePrefix}libros`,
    timestamps: false
  });
};

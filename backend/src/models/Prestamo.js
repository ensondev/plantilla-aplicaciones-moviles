const { DataTypes } = require("sequelize");

module.exports = (sequelize, tablePrefix) => {
  return sequelize.define("Prestamo", {
    id_prestamo: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_libro: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_prestamo: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fecha_devolucion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM("prestado", "devuelto"),
      defaultValue: "prestado"
    }
  }, {
    tableName: `${tablePrefix}prestamos`,
    timestamps: false
  });
};

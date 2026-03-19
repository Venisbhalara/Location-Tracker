const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AccessRequest = sequelize.define(
  "AccessRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending", // 'pending', 'approved', 'rejected'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true, // only populated if rejected
    },
  },
  {
    tableName: "access_requests",
    timestamps: true,
  }
);

module.exports = AccessRequest;

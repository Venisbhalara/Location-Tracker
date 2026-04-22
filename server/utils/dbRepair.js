/**
 * utils/dbRepair.js
 * 
 * Ultimate Database Repair Utility
 * Automatically synchronizes the database schema with Sequelize models
 * by adding any missing columns without deleting existing data.
 */
const { User, TrackingRequest, AccessRequest, ActivityLog } = require("../models");
const sequelize = require("../config/db");

async function runMigrations() {
  const models = [
    { model: User, tableName: "users" },
    { model: TrackingRequest, tableName: "tracking_requests" },
    { model: AccessRequest, tableName: "access_requests" },
    { model: ActivityLog, tableName: "activity_logs" }
  ];

  console.log("🛠️ Starting Ultimate Database Repair...");

  try {
    for (const item of models) {
      const { model, tableName } = item;
      
      // 1. Check if table exists
      const [tableCheck] = await sequelize.query(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${tableName}'`
      );

      if (tableCheck.length === 0) {
        console.log(`📦 Table '${tableName}' does not exist. It will be created by sequelize.sync().`);
        continue;
      }

      // 2. Get existing columns
      const [rows] = await sequelize.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${tableName}'`
      );
      const existingCols = rows.map((r) => r.COLUMN_NAME.toLowerCase());

      // 3. Compare with Model definition
      const attributes = model.getAttributes();
      for (const attrName in attributes) {
        const attribute = attributes[attrName];
        const colName = (attribute.field || attrName).toLowerCase();

        if (!existingCols.includes(colName)) {
          console.log(`[Database Repair] ➕ Adding missing column: ${tableName}.${colName}`);
          
          // Generate raw SQL for the column type
          let colSql = attribute.type.toString();
          if (attribute.allowNull === false) colSql += " NOT NULL";
          if (attribute.defaultValue !== undefined) {
             if (typeof attribute.defaultValue === 'string') colSql += ` DEFAULT '${attribute.defaultValue}'`;
             else if (typeof attribute.defaultValue === 'number' || typeof attribute.defaultValue === 'boolean') colSql += ` DEFAULT ${attribute.defaultValue}`;
          }

          try {
            await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN \`${colName}\` ${colSql}`);
          } catch (alterErr) {
            console.warn(`[Database Repair] ⚠️ Could not add ${tableName}.${colName}: ${alterErr.message}`);
          }
        }
      }
    }
    console.log("✅ Ultimate Database Repair complete!");
  } catch (err) {
    console.error("❌ Ultimate Database Repair failed:", err.message);
  }
}

module.exports = runMigrations;

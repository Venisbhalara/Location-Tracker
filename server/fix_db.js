require('dotenv').config();
const sequelize = require('./config/db');

async function fixDB() {
  try {
    await sequelize.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'");
    console.log("Added role column.");
  } catch(e) { console.log(e.message); }

  try {
    await sequelize.query("ALTER TABLE users ADD COLUMN accessStatus VARCHAR(20) DEFAULT 'approved'");
    console.log("Added accessStatus column.");
  } catch(e) { console.log(e.message); }
  
  try {
    await sequelize.query("ALTER TABLE users ADD COLUMN trackingAccess BOOLEAN DEFAULT false");
    console.log("Added trackingAccess column.");
  } catch(e) { console.log(e.message); }

  try {
    await sequelize.query("ALTER TABLE users ADD COLUMN lastLoginAt DATETIME DEFAULT NULL");
    console.log("Added lastLoginAt column.");
  } catch(e) { console.log(e.message); }
  
  process.exit();
}

fixDB();

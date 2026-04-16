require("dotenv").config();
const { User } = require("./models");
const sequelize = require("./config/db");

const setupAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    const adminEmail = "vasu@gmail.com";
    const adminPassword = "123456";

    let admin = await User.findOne({ where: { email: adminEmail } });

    if (admin) {
      console.log(`User ${adminEmail} found. Updating password and role...`);
      admin.password = adminPassword;
      admin.plainPassword = adminPassword;
      admin.role = "admin";
      admin.accessStatus = "approved";
      await admin.save();
      console.log("Admin user updated successfully.");
    } else {
      console.log(`User ${adminEmail} not found. Creating new admin user...`);
      await User.create({
        name: "Vasu Admin",
        email: adminEmail,
        password: adminPassword,
        plainPassword: adminPassword,
        role: "admin",
        accessStatus: "approved",
        trackingAccess: true
      });
      console.log("Admin user created successfully.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error setting up admin user:", error);
    process.exit(1);
  }
};

setupAdmin();

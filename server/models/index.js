const sequelize = require('../config/db');
const User           = require('./User');
const Contact        = require('./Contact');
const TrackingRequest = require('./TrackingRequest');
const AccessRequest   = require('./AccessRequest');

// ─── Associations ─────────────────────────────────────────────
User.hasMany(Contact,         { foreignKey: 'userId', as: 'contacts',         onDelete: 'CASCADE' });
Contact.belongsTo(User,       { foreignKey: 'userId', as: 'user' });

User.hasMany(TrackingRequest, { foreignKey: 'userId', as: 'trackingRequests', onDelete: 'CASCADE' });
TrackingRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(AccessRequest, { foreignKey: 'userId', as: 'accessRequests', onDelete: 'CASCADE' });
AccessRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { sequelize, User, Contact, TrackingRequest, AccessRequest };

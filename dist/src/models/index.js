"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactInstance = void 0;
const sequelize_1 = require("sequelize");
const sqlite3_1 = __importDefault(require("../config/sqlite3"));
class ContactInstance extends sequelize_1.Model {
}
exports.ContactInstance = ContactInstance;
ContactInstance.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    linkedId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: { model: ContactInstance, key: 'id' },
        allowNull: true
    },
    linkPrecedence: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
}, {
    sequelize: sqlite3_1.default,
    tableName: 'Contact5',
});

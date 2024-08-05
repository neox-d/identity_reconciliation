import { DataType, DataTypes, EnumDataType, Model, NOW } from "sequelize";
import db from "../config/sqlite3";

interface ContactAttributes {
        id: number,
        email: string,
        phoneNumber: string,
        linkedId: number;
        linkPrecedence: string,
        deletedAt: Date
    }
    
export class ContactInstance extends Model <any> {}

ContactInstance.init(
    {
        id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
        },
        email: {
                type: DataTypes.STRING,
                allowNull: true
        },
        phoneNumber: {
                type: DataTypes.STRING,
                allowNull: true
        },
        linkedId: {
                type: DataTypes.INTEGER,
                references: {model: ContactInstance, key: 'id'},
                allowNull: true
        },
        linkPrecedence: {
                type: DataTypes.ENUM('primary', 'secondary'),
                allowNull: false
        },

        deletedAt: {
                type: DataTypes.DATE,
                allowNull: true
        },

    },
    {
        sequelize: db,
        tableName: 'Contacts',
    }
);
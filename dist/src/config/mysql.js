"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = exports.Connect = void 0;
const mysql_1 = __importDefault(require("mysql"));
const config_1 = __importDefault(require("./config"));
const params = {
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.password,
    host: config_1.default.mysql.host,
    database: config_1.default.mysql.database
};
const Connect = async () => new Promise((resolve, reject) => {
    const connection = mysql_1.default.createConnection(params);
    connection.connect((error) => {
        if (error) {
            reject(error);
            return;
        }
        resolve(connection);
    });
});
exports.Connect = Connect;
const Query = async (connection, query) => new Promise((resolve, reject) => {
    connection.query(query, connection, (error, result) => {
        if (error) {
            reject(error);
            return;
        }
        resolve(result);
    });
});
exports.Query = Query;

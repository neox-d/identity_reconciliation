"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = require("../config/mysql");
const underscore_1 = __importDefault(require("underscore"));
const NAMESPACE = "Contacts";
const identify = (req, res, next) => {
    let { email, phoneNumber } = req.body;
    let query = `SELECT * from Contact WHERE email="${email}" OR phoneNumber="${phoneNumber}"`;
    (0, mysql_1.Connect)()
        .then(connection => {
        (0, mysql_1.Query)(connection, query)
            .then((result) => {
            if (underscore_1.default.isEmpty(result)) { // Create primary contact - New Customer
                let query = `INSERT INTO Contact (email, phoneNumber, linkPrecedence) values ("${email}", "${phoneNumber}", "primary")`;
                (0, mysql_1.Query)(connection, query)
                    .then((result) => {
                    return res.status(200).json({
                        result
                    });
                });
            }
            else {
                let contact = {
                    primaryContactId: 0,
                    emails: [],
                    phoneNumbers: [],
                    secondaryContactIds: []
                };
                for (const index in result) {
                    if (result[index].linkPrecedence == "primary") {
                        contact.primaryContactId = result['0'].id;
                    }
                    if (result[index].phoneNumber != null && (!contact['phoneNumbers'].includes(result[index].phoneNumber))) {
                        contact["phoneNumbers"].push(result[index].phoneNumber);
                    }
                    if (result[index].email != null && (!contact['emails'].includes(result[index].email))) {
                        contact["emails"].push(result[index].email);
                    }
                    if (result[index].linkPrecedence == "secondary") {
                        contact["secondaryContactIds"].push(result[index].id);
                    }
                }
                // Create Secondary Contacts
                if (!contact["emails"].includes(email)) {
                    let query = `INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence) values ("${email}", "${phoneNumber}", "${contact.primaryContactId}", "secondary")`;
                    (0, mysql_1.Query)(connection, query);
                }
                if (!contact["phoneNumbers"].includes(phoneNumber)) {
                    let query = `INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence) values ("${email}", "${phoneNumber}", "${contact.primaryContactId}", "secondary")`;
                    (0, mysql_1.Query)(connection, query);
                }
                // Changing from Primary to Secondary Contacts
                // if ()
                return res.status(200).json({
                    contact
                });
            }
        })
            .catch(error => {
            return res.status(500).json({
                message: error.message,
                error
            });
        })
            .finally(() => {
            connection.end();
        });
    })
        .catch(error => {
        return res.status(500).json({
            message: error.message,
            error
        });
    });
};
exports.default = { identify };

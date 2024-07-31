import { Connect, Query } from "../config/mysql";
import { NextFunction, Request, Response } from "express";
import contact from "../interfaces/contact";
import _ from 'underscore';


const NAMESPACE = "Contacts";

const identify = (req: Request, res: Response, next: NextFunction) => {

    let { email, phoneNumber } = req.body;

    let query = `SELECT * from Contact WHERE email="${email}" OR phoneNumber="${phoneNumber}"`;


    Connect()
    .then(connection => {
        Query(connection, query)
        .then((result:any) => {

            if (_.isEmpty(result)) { // Create primary contact - New Customer

                let query = `INSERT INTO Contact (email, phoneNumber, linkPrecedence) values ("${email}", "${phoneNumber}", "primary")`;

                Query(connection, query)
                .then((result:any) => {

                    return res.status(200).json({
                        result
                    });

                });
            } else {

                let contact: contact = {
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
                    Query(connection, query);
                }

                if (!contact["phoneNumbers"].includes(phoneNumber)) {
                    let query = `INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence) values ("${email}", "${phoneNumber}", "${contact.primaryContactId}", "secondary")`;
                    Query(connection, query);
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
            })
        })
        .finally(() => {
            connection.end();
        })
    })
    .catch(error => {

        return res.status(500).json({
            message: error.message,
            error
        })
    })
}

export default { identify };
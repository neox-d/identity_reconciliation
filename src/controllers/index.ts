import { Request, Response } from "express";
import { Model, Op, QueryTypes, Sequelize } from "sequelize";
import { ContactInstance } from "../models";
import db from "../config/sqlite3";
import contact from "../interfaces/contact";

// const { QueryTypes } = require('sequelize');

class ContactController {
        async identify(req: Request, res: Response) {
            const { email, phoneNumber } = req.body;

            const query = `
            with InitialContacts as 
                (select id, linkedId 
                from Contacts 
                where email=:email or phoneNumber=:phoneNumber) 
            select * from Contacts where 
                id in (select id from InitialContacts) or 
                linkedId in (select linkedId from InitialContacts) or 
                id in (select linkedId from InitialContacts) or 
                linkedId in (select id from InitialContacts)
            order by createdAt
            `;
            
            const records: any = await db.query(query, {
              replacements: {
                email: email,
                phoneNumber: phoneNumber
              },
              type: QueryTypes.SELECT
            })

            let contact: contact = {
                primaryContactId: 0,
                emails: [],
                phoneNumbers: [],
                secondaryContactIds: []
            };

            if (Object.keys(records).length == 0) {
                const newContact: any = await ContactInstance.create({ ...req.body, linkPrecedence: "primary" })
                contact.primaryContactId = newContact.id;
                if (email !== null) { contact['emails'].push(newContact.email) }
                if (phoneNumber !== null) { contact['phoneNumbers'].push(newContact.phoneNumber) }

                return res.status(200).json( { contact })

            } else {

                contact.primaryContactId = records['0'].id

                let ids = [];

                for (const index in records) {

                    if (index != '0') {
                        ids.push(records[index].id);
                        contact['secondaryContactIds'].push(records[index].id)
                    }

                    if (!contact['emails'].includes(records[index].email) && records[index].email) {
                        contact['emails'].push(records[index].email);
                    }
                    
                    if (!contact['phoneNumbers'].includes(records[index].phoneNumber) && records[index].phoneNumber) {
                        contact['phoneNumbers'].push(records[index].phoneNumber);
                    }
                }

                const updateQuery = `
                        UPDATE 
                            Contacts
                        SET
                            linkPrecedence = :linkPrecedence,
                            linkedId = :linkedId
                        WHERE 
                            id in (:ids)
                            AND id <> :id;
                        `;
                await db.query(updateQuery, {
                    replacements: {
                        linkPrecedence: 'secondary',
                        linkedId: records['0'].id,
                        id: records['0'].id,
                        ids: ids
                    },
                    type: QueryTypes.UPDATE
                })

                if (!contact['emails'].includes(email)) {
                    const newContact: any = await ContactInstance.create({ ...req.body, linkPrecedence: "secondary", linkedId: records['0'].id })
                    contact['emails'].push(newContact.email);
                    contact['secondaryContactIds'].push(newContact.id);
                }
                if (!contact['phoneNumbers'].includes(phoneNumber)) {
                    const newContact: any = await ContactInstance.create({ ...req.body, linkPrecedence: "secondary", linkedId: records['0'].id })
                    contact['phoneNumbers'].push(newContact.phoneNumber);
                    contact['secondaryContactIds'].push(newContact.id);
                }
                return res.status(200).json({ contact })
            }
        }
}

export default new ContactController();
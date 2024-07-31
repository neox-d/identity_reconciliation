import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import { ContactInstance } from "../models";
import contact from "../interfaces/contact";

class ContactController {
        async identify(req: Request, res: Response) {

                const { email, phoneNumber } = req.body;

                let emailCheck: any = await ContactInstance.findOne({
                    where: { email: email },
                });

                let phoneCheck: any = await ContactInstance.findOne({
                    where: { phoneNumber: phoneNumber },
                });

                if ((emailCheck != null && phoneCheck === null) || (emailCheck === null && phoneCheck != null)) {
                    const record = await ContactInstance.create({ ...req.body, linkPrecedence: "secondary" });
                } else if (emailCheck === null && phoneCheck === null) {
                    const record = await ContactInstance.create({ ...req.body, linkPrecedence: "primary" });
                }

                if (emailCheck.linkedId == null && phoneCheck.linkedId == null) {
                    if (emailCheck.createdAt > phoneCheck.createdAt) {
                        phoneCheck.linkPrecedence = "secondary";
                        phoneCheck.linkedId = emailCheck.id;
                        await phoneCheck.save();
                    } else {
                        emailCheck.linkPrecedence = "secondary";
                        emailCheck.linkedId = phoneCheck.id;
                        await emailCheck.save();
                    }
                }

                // return res.status(200).json({ emailCheck, phoneCheck })


                let records: any = await ContactInstance.findAll({
                        where: 
                             Sequelize.or(
                            { email: email },
                            { phoneNumber: phoneNumber }
                        )
                });

                if (Object.keys(records).length != 0) {
                    let contact: contact = {
                        primaryContactId: 0,
                        emails: [],
                        phoneNumbers: [],
                        secondaryContactIds: []
                    };
    
                    for (const index in records) {
                        if (records[index].linkPrecedence == "primary") {
                            contact.primaryContactId = records['0'].id;
                        }
        
                        if (records[index].phoneNumber != null && (!contact['phoneNumbers'].includes(records[index].phoneNumber))) {
                            contact["phoneNumbers"].push(records[index].phoneNumber);
                        }
        
                        if (records[index].email != null && (!contact['emails'].includes(records[index].email))) {
                            contact["emails"].push(records[index].email);
                        } 
        
                        if (records[index].linkPrecedence == "secondary") {
                            contact["secondaryContactIds"].push(records[index].id);
                            let primaryContact: any = await ContactInstance.findAll({
                                where: { id: records[index].linkedId }
                            });

                            if (Object.keys(primaryContact).length != 0) {

                                if (primaryContact['0'].linkPrecedence == "primary") {
                                    contact.primaryContactId = primaryContact['0'].id;
                                }

                                if (primaryContact['0'].phoneNumber != null && (!contact['phoneNumbers'].includes(primaryContact['0'].phoneNumber))) {
                                    contact["phoneNumbers"].push(primaryContact['0'].phoneNumber);
                                }
                
                                if (primaryContact['0'].email != null && (!contact['emails'].includes(primaryContact['0'].email))) {
                                    contact["emails"].push(primaryContact['0'].email);
                                }
                            }
                        }
                    
                        }
                    return res.status(200).json({ contact });
                } 

                
        }
}

export default new ContactController();
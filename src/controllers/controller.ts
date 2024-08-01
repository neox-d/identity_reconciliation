import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import { ContactInstance } from "../models";
import contact from "../interfaces/contact";

class ContactController {
    async identify(req: Request, res: Response) {

        const { email, phoneNumber } = req.body;

        const record: any = await ContactInstance.findOne({
            where: Sequelize.and({
                email: email,
                phoneNumber: phoneNumber
            })
        })

        let contact: contact = {
            primaryContactId: 0,
            emails: [],
            phoneNumbers: [],
            secondaryContactIds: []
        };

        if (record != null) {
            if (record.linkPrecedence == 'primary') {
                const secondaryContacts: any = await ContactInstance.findAll({
                    where: { linkedId: record.id }
                })

                // Load Primary Contact
                contact.primaryContactId = record.id;
                contact['emails'].push(record.email);
                contact['phoneNumbers'].push(record.phoneNumber);

                // Load secondary contacts
                for (const index in secondaryContacts) {
                    contact['emails'].push(record[index].email);
                    contact['phoneNumbers'].push(record[index].phoneNumber);
                    contact['secondaryContactIds'].push(record[index].id)
                }

                return res.status(200).json({ contact })


            } else {

                const primaryContact: any = await ContactInstance.findByPk(record.linkedId)
                const secondaryContacts: any = await ContactInstance.findAll({
                    where: { linkedId: record.linkedId }
                })

                // Load Primary Contact
                contact.primaryContactId = primaryContact.id;
                contact['emails'].push(primaryContact.email);
                contact['phoneNumbers'].push(primaryContact.phoneNumber);

                // Load secondary contacts
                for (const index in secondaryContacts) {
                    contact['emails'].push(record[index].email);
                    contact['phoneNumbers'].push(record[index].phoneNumber);
                    contact['secondaryContactIds'].push(record[index].id)
                }

                return res.status(200).json({ contact })
            }
        } else {
            const recordwithEmail: any = await ContactInstance.findOne({
                where: { email: email }
            })

            const recordwithPhone: any = await ContactInstance.findOne({
                where: { phoneNumber: phoneNumber }
            })

            if (recordwithEmail != null && recordwithPhone != null) {

                if (recordwithEmail.linkPrecedence == 'primary' && recordwithPhone.linkPrecedence == 'primary') {
                    if (recordwithEmail.createdAt > recordwithPhone.createdAt) {
                        recordwithPhone.linkPrecedence = 'secondary'
                        recordwithPhone.linkedId = recordwithEmail.id
                        recordwithPhone.save()

                        const secondariesofPhone: any = await ContactInstance.findAll({
                            where: { linkedId: recordwithPhone.id }
                        })

                        // Chore: Loop over secondaries of phone and change linkedId to recordwithEmail.id

                        for (const index in secondariesofPhone) {
                            secondariesofPhone[index].linkedId = recordwithEmail.id
                            secondariesofPhone[index].save()
                        }

                        // Load primary Contact
                        contact.primaryContactId = recordwithEmail.id;
                        contact['emails'].push(recordwithEmail.email);
                        contact['phoneNumbers'].push(recordwithEmail.phoneNumber);

                        const secondaryContacts: any = await ContactInstance.findAll({
                            where: { linkedId: recordwithEmail.id }
                        })

                        // Load secondary contacts
                        for (const index in secondaryContacts) {
                            contact['emails'].push(secondaryContacts[index].email)
                            contact['phoneNumbers'].push(secondaryContacts[index].phoneNumber)
                            contact['secondaryContactIds'].push(secondaryContacts[index].id)
                        }

                        return res.status(200).json({ contact })

                    } else {
                        recordwithEmail.linkPrecedence = 'secondary'
                        recordwithEmail.linkedId = recordwithPhone.id
                        recordwithEmail.save()

                        const secondariesofEmail: any = await ContactInstance.findAll({
                            where: { linkedId: recordwithEmail.id }
                        })

                        // Chore: Loop over secondaries of phone and change linkedId to recordwithPhone.id

                        for (const index in secondariesofEmail) {
                            secondariesofEmail[index].linkedId = recordwithPhone.id
                            secondariesofEmail[index].save()
                        }

                        // Load primary Contact
                        contact.primaryContactId = recordwithPhone.id;
                        contact['emails'].push(recordwithPhone.email);
                        contact['phoneNumbers'].push(recordwithPhone.phoneNumber);

                        const secondaryContacts: any = ContactInstance.findAll({
                            where: { linkedId: recordwithPhone.id }
                        })

                        // Load secondary contacts
                        for (const index in secondaryContacts) {
                            contact['emails'].push(secondaryContacts[index].email)
                            contact['phoneNumbers'].push(secondaryContacts[index].phoneNumber)
                            contact['secondaryContactIds'].push(secondaryContacts[index].id)
                        }

                        return res.status(200).json({ contact })

                    }
                } else if (recordwithEmail.linkPrecedence == 'primary' && recordwithPhone.linkPrecedence == 'secondary' && recordwithPhone.linkedId != recordwithEmail.id) {

                        const primaryOfPhone: any = await ContactInstance.findByPk(recordwithPhone.linkedId)
                        

                        if (recordwithEmail.createdAt > primaryOfPhone.createdAt) {
                            const newSecondaryContact: any = ContactInstance.create({ ...req.body, linkPrecedence: 'secondary', linkedId: recordwithEmail.id })
                            primaryOfPhone.linkPrecedence = 'secondary'
                            primaryOfPhone.linkedId = recordwithEmail.id
                            primaryOfPhone.save()

                            recordwithPhone.linkedId = recordwithEmail.id
                            recordwithPhone.save()

                            const secondariesOfPhone: any = await ContactInstance.findAll({
                                where: { linkedId: recordwithPhone.linkedId }
                            })

                            // Chore: Loop over secondaries of phone and change linked id to recordwithEmail.id
                            for (const index in secondariesOfPhone) {
                                secondariesOfPhone[index].linkedId = recordwithEmail.id;
                                secondariesOfPhone[index].save()
                            }

                            // Load primary Contact
                            contact.primaryContactId = recordwithEmail.id;
                            contact['emails'].push(recordwithEmail.email);
                            contact['phoneNumbers'].push(recordwithEmail.phoneNumber);

                            const secondaryContacts: any = ContactInstance.findAll({
                                where: { linkedId: recordwithEmail.id }
                            })

                            // Load secondary contacts
                            for (const index in secondaryContacts) {
                                contact['emails'].push(secondaryContacts[index].email)
                                contact['phoneNumbers'].push(secondaryContacts[index].phoneNumber)
                                contact['secondaryContactIds'].push(secondaryContacts[index].id)
                            }

                            return res.status(200).json({ contact })

                        } else {
                            const newSecondaryContact: any = ContactInstance.create({ ...req.body, linkPrecedence: 'secondary', linkedId: recordwithPhone.linkedId })

                            recordwithEmail.linkPrecedence = 'secondary'
                            recordwithEmail.linkedId = recordwithPhone.linkedId
                            recordwithEmail.save()

                            const secondariesOfEmail: any = await ContactInstance.findAll({
                                where: { linkedId: recordwithEmail.linkedId }
                            })

                            // Chore: Loop over secondaries of email and change linked id to recordwithPhone.linkedId
                            for (const index in secondariesOfEmail) {
                                secondariesOfEmail[index].linkedId = recordwithPhone.linkedId;
                                secondariesOfEmail[index].save()
                            }

                            // Load primary Contact
                            contact.primaryContactId = primaryOfPhone.id;
                            contact['emails'].push(primaryOfPhone.email);
                            contact['phoneNumbers'].push(primaryOfPhone.phoneNumber);

                            const secondaryContacts: any = ContactInstance.findAll({
                                where: { linkedId: primaryOfPhone.id }
                            })

                            // Load secondary contacts
                            for (const index in secondaryContacts) {
                                contact['emails'].push(secondaryContacts[index].email)
                                contact['phoneNumbers'].push(secondaryContacts[index].phoneNumber)
                                contact['secondaryContactIds'].push(secondaryContacts[index].id)
                            }

                            return res.status(200).json({ contact })

                        }
                } else if (recordwithEmail.linkPrecedence == 'secondary' && recordwithPhone.linkPrecedence == 'primary' && recordwithEmail.linkedId != recordwithPhone.id) {

                    const primaryOfEmail: any = await ContactInstance.findByPk(recordwithEmail.linkedId)
                    

                    if (recordwithPhone.createdAt > primaryOfEmail.createdAt) {
                        const newSecondaryContact: any = ContactInstance.create({ ...req.body, linkPrecedence: 'secondary', linkedId: recordwithPhone.id })
                        primaryOfEmail.linkPrecedence = 'secondary'
                        primaryOfEmail.linkedId = recordwithPhone.id
                        primaryOfEmail.save()

                        recordwithEmail.linkedId = recordwithPhone.id
                        recordwithEmail.save()

                        const secondariesOfEmail: any = await ContactInstance.findAll({
                            where: { linkedId: recordwithEmail.linkedId }
                        })

                        // Chore: Loop over secondaries of email and change linked id to recordwithPhone.id
                        for (const index in secondariesOfEmail) {
                            secondariesOfEmail[index].linkedId = recordwithPhone.id;
                            secondariesOfEmail[index].save()
                        }

                        // Load primary Contact
                        contact.primaryContactId = recordwithPhone.id;
                        contact['emails'].push(recordwithPhone.email);
                        contact['phoneNumbers'].push(recordwithPhone.phoneNumber);

                        const secondaryContacts: any = ContactInstance.findAll({
                            where: { linkedId: recordwithPhone.id }
                        })

                        // Load secondary contacts
                        for (const index in secondaryContacts) {
                            contact['emails'].push(secondaryContacts[index].email)
                            contact['phoneNumbers'].push(secondaryContacts[index].phoneNumber)
                            contact['secondaryContactIds'].push(secondaryContacts[index].id)
                        }

                        return res.status(200).json({ contact })

                    } else {
                        const newSecondaryContact: any = ContactInstance.create({ ...req.body, linkPrecedence: 'secondary', linkedId: recordwithEmail })
                        const secondariesOfPhone: any = await ContactInstance.findAll({
                            where: { linkedId: recordwithPhone.linkedId }
                        })

                        // Chore: Loop over secondaries of phone and change linked id to recordwithEmail.linkedId
                        for (const index in secondariesOfPhone) {
                            secondariesOfPhone[index].linkedId = recordwithEmail.linkedId;
                            secondariesOfPhone[index].save()
                        }

                        // Load primary Contact
                        contact.primaryContactId = primaryOfEmail.id;
                        contact['emails'].push(primaryOfEmail.email);
                        contact['phoneNumbers'].push(primaryOfEmail.phoneNumber);

                        const secondaryContacts: any = ContactInstance.findAll({
                            where: { linkedId: primaryOfEmail.id }
                        })

                        // Load secondary contacts
                        for (const index in secondaryContacts) {
                            contact['emails'].push(secondaryContacts[index].email)
                            contact['phoneNumbers'].push(secondaryContacts[index].phoneNumber)
                            contact['secondaryContactIds'].push(secondaryContacts[index].id)
                        }

                        return res.status(200).json({ contact })

                    }
                } else if (recordwithEmail.linkPrecedence == 'secondary' && recordwithPhone.linkPrecedence == 'secondary' && recordwithEmail.linkedId != recordwithPhone.linkedId) {

                    const primaryOfPhone: any = await ContactInstance.findByPk(recordwithPhone.linkedId)
                    const primaryOfEmail: any = await ContactInstance.findByPk(recordwithEmail.linkedId)

                    if (primaryOfEmail.createdAt > primaryOfPhone.createdAt) {
                        const newSecondaryContact: any = ContactInstance.create({ ...req.body, linkPrecedence: 'secondary', linkedId: primaryOfEmail.id })
                        
                        primaryOfPhone.linkPrecedence = 'secondary'
                        primaryOfPhone.linkedId = primaryOfEmail.id
                        primaryOfPhone.save()
                        const secondariesOfPhone: any = await ContactInstance.findAll({
                            where: { linkedId: primaryOfPhone.id }
                        })

                        // Chore: Loop over secondaries of Phone and change linkedId to primaryofEmail.id
                        for (const index in secondariesOfPhone) {
                            secondariesOfPhone[index].linkedId = primaryOfEmail.id;
                            secondariesOfPhone[index].save()
                        }

                        // Load primary Contact
                        contact.primaryContactId = primaryOfEmail.id;
                        contact['emails'].push(primaryOfEmail.email);
                        contact['phoneNumbers'].push(primaryOfEmail.phoneNumber);

                        const secondaryContacts: any = ContactInstance.findAll({
                            where: { linkedId: primaryOfEmail.id }
                        })

                        // Load secondary contacts
                        for (const index in secondaryContacts) {
                            contact['emails'].push(secondaryContacts[index].email)
                            contact['phoneNumbers'].push(secondaryContacts[index].phoneNumber)
                            contact['secondaryContactIds'].push(secondaryContacts[index].id)
                        }

                        return res.status(200).json({ contact })

                    } else {
                        const newSecondaryContact: any = ContactInstance.create({ ...req.body, linkPrecedence: 'secondary', linkedId: primaryOfPhone.id })
                        
                        primaryOfEmail.linkPrecedence = 'secondary'
                        primaryOfEmail.linkedId = primaryOfPhone.id
                        primaryOfEmail.save()
                        const secondariesOfEmail: any = await ContactInstance.findAll({
                            where: { linkedId: primaryOfEmail.id }
                        })
                        // Chore: Loop over secondaries of Email and change linkedId to primaryofPhone.id

                        for (const index in secondariesOfEmail) {
                            secondariesOfEmail[index].linkedId = primaryOfPhone.id;
                            secondariesOfEmail[index].save()
                        }

                        // Load primary Contact
                        contact.primaryContactId = primaryOfPhone.id;
                        contact['emails'].push(primaryOfPhone.email);
                        contact['phoneNumbers'].push(primaryOfPhone.phoneNumber);

                        const secondaryContacts: any = ContactInstance.findAll({
                            where: { linkedId: primaryOfPhone.id }
                        })

                        // Load secondary contacts
                        for (const index in secondaryContacts) {
                            contact['emails'].push(secondaryContacts[index].email)
                            contact['phoneNumbers'].push(secondaryContacts[index].phoneNumber)
                            contact['secondaryContactIds'].push(secondaryContacts[index].id)
                        }

                        return res.status(200).json({ contact })
                    }
                }
            }

            if (recordwithEmail != null) {
                if (recordwithEmail.linkPrecedence == 'primary') {

                    const newContact: any = ContactInstance.create({ ...req.body, linkPrecedence: "secondary", linkedId: recordwithEmail.id })
                    const secondaryContacts: any = await ContactInstance.findAll({
                        where: { linkedId: recordwithEmail.id }
                    })
                    // Load Primary Contact
                    contact.primaryContactId = recordwithEmail.id;
                    contact['emails'].push(recordwithEmail.email);
                    contact['phoneNumbers'].push(recordwithEmail.phoneNumber);

                    // Load secondary contacts
                    for (const index in secondaryContacts) {
                        contact['emails'].push(record[index].email);
                        contact['phoneNumbers'].push(record[index].phoneNumber);
                        contact['secondaryContactIds'].push(record[index].id)
                    }

                    return res.status(200).json({ contact })

                } else {
                    const newContact: any = ContactInstance.create({ ...req.body, linkPrecedence: "secondary", linkedId: recordwithEmail.linkedId })
                    const primaryContact: any = ContactInstance.findByPk(recordwithEmail.linkedId)
                    const secondaryContacts: any = await ContactInstance.findAll({
                        where: { linkedId: recordwithEmail.linkedId }
                    })

                    // Load Primary Contact
                    contact.primaryContactId = primaryContact.id;
                    contact['emails'].push(primaryContact.email);
                    contact['phoneNumbers'].push(primaryContact.phoneNumber);

                    // Load secondary contacts
                    for (const index in secondaryContacts) {
                        contact['emails'].push(record[index].email);
                        contact['phoneNumbers'].push(record[index].phoneNumber);
                        contact['secondaryContactIds'].push(record[index].id)
                    }

                    return res.status(200).json({ contact })

                }
            }

            if (recordwithPhone != null) {
                if (recordwithPhone.linkPrecedence == 'primary') {

                    const newContact: any = ContactInstance.create({ ...req.body, linkPrecedence: "secondary", linkedId: recordwithPhone.id })
                    const secondaryContacts: any = await ContactInstance.findAll({
                        where: { linkedId: recordwithPhone.id }
                    })

                    // Load Primary Contact
                    contact.primaryContactId = recordwithPhone.id;
                    contact['emails'].push(recordwithPhone.email);
                    contact['phoneNumbers'].push(recordwithPhone.phoneNumber);

                    // Load secondary contacts
                    for (const index in secondaryContacts) {
                        contact['emails'].push(record[index].email);
                        contact['phoneNumbers'].push(record[index].phoneNumber);
                        contact['secondaryContactIds'].push(record[index].id)
                    }

                    return res.status(200).json({ contact })

                } else {
                    const newContact: any = ContactInstance.create({ ...req.body, linkPrecedence: "secondary", linkedId: recordwithPhone.linkedId })
                    const primaryContact: any = ContactInstance.findByPk(recordwithPhone.linkedId)
                    const secondaryContacts: any = await ContactInstance.findAll({
                        where: { linkedId: recordwithPhone.linkedId }
                    })

                    // Load Primary Contact
                    contact.primaryContactId = primaryContact.id;
                    contact['emails'].push(primaryContact.email);
                    contact['phoneNumbers'].push(primaryContact.phoneNumber);

                    // Load secondary contacts
                    for (const index in secondaryContacts) {
                        contact['emails'].push(record[index].email);
                        contact['phoneNumbers'].push(record[index].phoneNumber);
                        contact['secondaryContactIds'].push(record[index].id)
                    }

                    return res.status(200).json({ contact })
                }
            }

            const newPrimaryContact: any = ContactInstance.create({ ...req.body, linkPrecedence: 'primary' })
            
            // Load Primary Contact
            contact['emails'].push(email);
            contact['phoneNumbers'].push(phoneNumber);

            return res.status(200).json({ contact })
        }

    }
}

export default new ContactController();
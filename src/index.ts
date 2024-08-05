import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import router from './router';
import db from "./config/sqlite3";
import { ContactInstance } from './models/index';

db.sync().then(() => {
    console.log("Connected to DB");
}).catch(error => {
    console.error(error);
});

// (async () => {
//     await db.sync({ force: true });
  
//     const sampleData = [
//       { phoneNumber: '1234567890', email: 'primary1@example.com', linkedId: null, linkPrecedence: 'primary' },
//     //   { phoneNumber: '1234567891', email: 'secondary1@example.com', linkedId: 1, linkPrecedence: 'secondary' },
//     //   { phoneNumber: '1234567892', email: 'primary2@example.com', linkedId: null, linkPrecedence: 'primary' },
//     //   { phoneNumber: '1234567893', email: 'secondary2@example.com', linkedId: 3, linkPrecedence: 'secondary' },
//     //   { phoneNumber: '1234567894', email: 'primary3@example.com', linkedId: null, linkPrecedence: 'primary' },
//     //   { phoneNumber: '1234567895', email: 'secondary3@example.com', linkedId: 5, linkPrecedence: 'secondary' },
//     ];
  
//     try {
//       for (const contact of sampleData) {
//         await ContactInstance.create(contact);
//       }
//       console.log('Sample data has been inserted.');
//     } catch (error) {
//       console.error('Error inserting sample data:', error);
//     }
//   })();

const app = express();

app.use(cors({
    credentials: true,
}));

app.use(express.json());

const PORT = 8000;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
})

app.use('/', router());

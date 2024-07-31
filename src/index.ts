import express, { Request, Response } from 'express';
import http from 'http';
// import bodyParser from 'body-parser';
// import cookieParser from 'cookie-parser';
// import compression from 'compression';
import cors from 'cors';
import router from './router';
import db from "./config/sqlite3";
import { ContactInstance } from './models/index';

db.sync().then(() => {
    console.log("Connected to DB");
})

const app = express();

app.use(cors({
    credentials: true,
}));

// app.use(compression());
// app.use(cookieParser());
// app.use(bodyParser.json());

app.use(express.json());

const PORT = 8000;

const server = http.createServer(app);

// app.post('/create', async (req: Request, res: Response) => {
//     try {
//         const record = await ContactInstance.create({ ...req.body });
//         return res.status(200).json({ record, msg: "Successfull" });
//     } catch (e) {
//         console.log(e);
//         return res.status(500).json({ msg:"failed to create", statuscode: 500, route: "/create" })
//     }

// })

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
})

app.use('/', router());

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
// import bodyParser from 'body-parser';
// import cookieParser from 'cookie-parser';
// import compression from 'compression';
const cors_1 = __importDefault(require("cors"));
const router_1 = __importDefault(require("./router"));
const sqlite3_1 = __importDefault(require("./config/sqlite3"));
sqlite3_1.default.sync().then(() => {
    console.log("Connected to DB");
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    credentials: true,
}));
// app.use(compression());
// app.use(cookieParser());
// app.use(bodyParser.json());
app.use(express_1.default.json());
const PORT = 8000;
const server = http_1.default.createServer(app);
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
});
app.use('/', (0, router_1.default)());

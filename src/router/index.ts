import express from 'express';

import ContactController from "../controllers/index";

const router = express.Router();

router.post('/identify', ContactController.identify);

export default (): express.Router => {

    return router;
};
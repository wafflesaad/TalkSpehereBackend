import express from 'express';

import { userAuth } from '../middleware/userAuth.js';
import { makeRoom } from '../controllers/callController.js';

const callRouter = express.Router()


callRouter.get('/', userAuth, makeRoom);

callRouter.get('/:room', userAuth,);

export default callRouter;
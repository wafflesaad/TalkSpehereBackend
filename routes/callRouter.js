import express from 'express';

import { userAuth } from '../middleware/userAuth.js';
import { makeRoom , handleRoom} from '../controllers/callController.js';

const callRouter = express.Router()


callRouter.get('/', userAuth, makeRoom);

callRouter.get('/:roomId', userAuth,);

export default callRouter;
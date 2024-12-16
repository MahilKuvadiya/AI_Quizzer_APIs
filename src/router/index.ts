import express from 'express'
import authentication from './authentication';
import { quiz } from './quiz';
import { submission } from './submission';

const router = express.Router();

export default () : express.Router => {

    authentication(router) // authentication paths
    quiz(router) // quiz paths
    submission(router) // submission paths

    return router;
}
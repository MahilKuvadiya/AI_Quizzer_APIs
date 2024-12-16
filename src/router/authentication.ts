import express from 'express'

import { register } from '../controllers/authentication/register'
import { login } from '../controllers/authentication/login';
import { logout } from '../controllers/authentication/logout';
import { validateAccessToken } from '../middlewares';
import { changeUsername } from '../controllers/authentication/changeUsername';
import { changePassword } from '../controllers/authentication/changePassword';

export default ( router : express.Router) => {
    router.post('/auth/register', register);
    router.post('/auth/login', login)
    router.post('/auth/logout',validateAccessToken, logout)
    router.post('/auth/changeUsername', validateAccessToken, changeUsername)
    router.post('/auth/changePassword', validateAccessToken, changePassword)
}
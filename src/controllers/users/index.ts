import express from 'express'

import { getUsers } from '../../db/users';

export const getAllUsers = async (req : express.Request , res: express.Response) => {
    try{
        const users = await getUsers()

        return res.status(200).json(users).end()
    }catch (e ){
        console.log('Error from controller/ users/ getAllUsers',e)
        return res.sendStatus(500);
    }
}

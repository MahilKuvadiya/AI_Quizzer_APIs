import express from 'express'

import { updateUserById } from '../../db/users'
import { encryptPassword, random } from '../../helper'

export const changePassword = async ( req : express.Request, res : express.Response ) => {
    try{
        const { _id } = req.body.user
        const { password } = req.body

        const salt = random()

        const user = await updateUserById(_id, { authentication : { salt, password : encryptPassword(salt, password) } });

        return res.status(200).json({message : 'success'}).end()
    }catch(e){
        console.log('Error from controller/ authentication/ changePassword',e)
        return res.sendStatus(500);
    }
}
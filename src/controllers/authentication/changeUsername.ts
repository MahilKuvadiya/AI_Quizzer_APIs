import { getUserbyId, updateUserById } from '../../db/users'
import express from 'express'

export const changeUsername = async (req : express.Request , res : express.Response) =>{
    try {
        const { username } = req.body
        const { _id } = req.body.user

        const user = await updateUserById(_id , { username })
        const updatedUser = await getUserbyId(_id)

        return res.status(200).json(updatedUser).end();
    }catch(e){
        console.log("Error from controller/ authentication/ changeUsername", e)
        return res.sendStatus(500);
    }
}
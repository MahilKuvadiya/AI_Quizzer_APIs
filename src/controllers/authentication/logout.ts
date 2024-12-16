import { getUserbyId } from '../../db/users'
import express from 'express'

export const logout = async ( req : express.Request , res : express.Response ) => {
    try {
        const { _id } = req.body.user
        const user = await getUserbyId(_id).select('+authentication.sessionToken')
        user.authentication.sessionToken = ''
        user.save();

        res.cookie('ACCESS_TOKEN',"",{
            httpOnly : true,
            path : '/',
            maxAge : 0 
        })

        res.cookie('REFRESH_TOKEN',"",{
            httpOnly : true,
            path : '/',
            maxAge : 0
        })

        return res.status(200).json({message : 'Logout successfully.'});
    }catch( e) {
        console.log('Error from controller/ authentication / logout', e)
        return res.sendStatus(500);
    }

}
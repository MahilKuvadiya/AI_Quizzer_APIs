import { getUserByEmail, updateUserById } from '../../db/users';
import express from 'express'
import { encryptPassword } from '../../helper';
import jwt from 'jsonwebtoken'

export const login =async ( req : express.Request, res: express.Response) =>{
    try {
        const { email , password } = req.body;

        if(!email || !password){
            console.log("Something missing from login controller")
            return res.status(400).json({message : 'Not enough data.'}).end();
        }

        const user = await getUserByEmail(email).select('+authentication.salt +authentication.password')

        if(!user){
            console.log('No such user')
            return res.status(400).json({message : 'No such user.'}).end();
        }

        const expectedHash = encryptPassword(user.authentication.salt, password)

        if(expectedHash !== user.authentication.password){
            console.log('not authorized')
            return res.status(403).json({message : 'Incorrect password.'}); 
        }

        const plainUserObject = {
            _id : user._id,
            username : user.username,
            email : email
        }

        const accessToken = jwt.sign(plainUserObject,process.env.ACCESS_TOKEN_SECRET, { expiresIn : '3600s' });

        const refreshToken = jwt.sign( { id : user._id },process.env.REFRESH_TOKEN_SECRET, { expiresIn : '1y' } )

        user.authentication.sessionToken = refreshToken
        user.save();

        res.cookie('ACCESS_TOKEN',accessToken,{
            httpOnly : true,
            path : '/',
        })

        res.cookie("REFRESH_TOKEN", refreshToken, {
            maxAge: 3.154e10, // 1 year
            httpOnly: true,
        });

        return res.status(200).json(plainUserObject).end()
    
    }catch (e){
        console.log("Error from controller / authentication / login", e)
        return res.status(500).json({message : 'Error'});
    }
}
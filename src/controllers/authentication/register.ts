import { encryptPassword, random } from '../../helper';
import { createUser, getUserByEmail } from '../../db/users';
import express from 'express'

export const register = async ( req : express.Request , res : express.Response ) => {
    try {
        const { email , username  , password } = req.body;

        console.log(req.body)

        if( !email || !username || !password ) {
            console.log("something is missing from register ")
            return  res.status(400).json({message : 'Not enogh data provided.'}).end()
        }

        const existingUser = await getUserByEmail(email);

        if( existingUser ){
            return  res.status(400).json({message : 'Email is already used.'});
        }

        //now create user

        const salt = random();

        const user = await createUser({
            email,
            username,
            authentication : {
                salt,
                password : encryptPassword(salt,password)
            }
        })

        const plainUserObject = {
            _id : user._id,
            username:user.username,
            email:user.email
        }

        return res.status(200).json(plainUserObject).end();
    } catch (e){
        console.log("Error  in controller / authentication / Register: ", e)
        return res.status(400)
    }
}
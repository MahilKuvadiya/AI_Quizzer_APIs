import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        require : true
    },
    email : {
        type : String,
        require : true,
        unique : true
    },
    authentication : {
        password : {
            type : String,
            require : true,
            select : false
        },
        salt : {
            type : String ,
            select : false 
        },
        sessionToken : {
            type : String,
            select : false
        }
    },
    createdAt : {
        type : Date,
        default : Date.now()
    }
});

export const userModal = mongoose.model( "User" , userSchema );

export const getUsers = () => userModal.find();
export const getUserbyId = (id : string) => userModal.findById(id);
export const getUserByEmail = ( email : string ) => userModal.findOne({email});
export const getUserBySessionToken = (sessionToken : string) => userModal.findOne({ 'authentication.sessionToken' : sessionToken })

export const createUser = ( user : Record<string, any> ) => new userModal(user).save().then(
    (user) => user.toObject()
);

export const deleteUserById = (id : string ) => userModal.findByIdAndDelete(id)
export const deleteUserByEmail = (email : string ) => userModal.findOneAndDelete({ email })

export const updateUserById = (id: string,values : Record<string,any>) => userModal.findByIdAndUpdate(id, values) 
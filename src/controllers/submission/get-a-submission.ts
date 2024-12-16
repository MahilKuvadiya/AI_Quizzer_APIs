import { getSubmissionById } from '../../db/submission';
import { Request , Response }  from 'express'

export const getASubmission = async ( req : Request , res : Response ) => {
    try{
        const id = req.params.submissionId;

        if(id === undefined){
            return res.status(400).json({message : 'submission id is required'}).end();
        }

        const submission = await getSubmissionById(id);
        return res.status(200).json(submission).end();
    }catch(e){
        console.log('Error from controller/ submission/ getASubmission', e)
        return res.status(500).json({message:'Internal server error'});
    }
}
import { submissionModal } from '../../db/submission';
import express from 'express';

export const GetMaximumSumbMissionScore = async (req : express.Request , res : express.Response ) => {
    try{

        const submission = await submissionModal.find({}).sort({score:1}).skip(1).limit(1);

        return res.status(200).json(submission).end();

    }catch(e){
        console.log('Error from controller/ submission/ GetMaximumSumbMissionScore', e)
        return res.status(500).json({message:'Internal server error'});
    }
};
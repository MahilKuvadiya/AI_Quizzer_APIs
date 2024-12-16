import { update } from 'lodash';
import { createQuestion, updateQuestionById } from '../../db/question';
import express from 'express'
import { updateQuiz } from '../../db/quiz';
import mongoose from 'mongoose';

export const updateController = async ( req : express.Request , res : express.Response ) => {
    try{

        const userReq = req.body;

        const updatedQue = {
            questionId: new mongoose.Types.ObjectId(),
            Qno: userReq.Qno,
            quizId: userReq.quizId,
            questionText: userReq.question,
            options: Object.entries(userReq.choices).map(([key, value]) => ({ label: key, value })),
            correctAnswer: userReq.correctAnswer,
            hints: userReq.hint
        }

        await createQuestion(updatedQue);

        await updateQuestionById(userReq.questionId , { flag : true });

        return res.status(200).json({message:'Question updated successfully'}).end();
    }catch(e){
        console.log('Error from controller/ ', e)
        return res.status(500).json({message:'Internal server error'});
    }
}
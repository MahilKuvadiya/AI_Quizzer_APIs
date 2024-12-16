import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { insertManyQuestions } from '../../db/question';
import { createQuiz, deleteQuizById } from '../../db/quiz';
import { generateQuiz, QuizResponse, Question } from '../groq/quiz-fetch';


interface quizFromate {
    quizId: string;
    grade: string;
    subject: string;
    totalQuestions: number;
    maxScore: number;
    difficulty: string;
    questions: Array<{
        Qno: number;
        questionText: string;
        options: Array<{label: string, value: string}>;
    }>;
    attempts: number;
}


export const newQuizController = async (req: Request, res: Response) => {
    try {
        let { numQuestions, subject, grade, difficulty } = req.body;
       
        if (subject === undefined) {
            return res.status(400).json({message: 'Subject is required'});
        }
        if (grade === undefined) {
            return res.status(400).json({message: 'Grade is required'});
        }
        if (numQuestions === undefined || difficulty === undefined) {
            numQuestions = 10;
            difficulty = 'EASY';
        }

        let quizData: QuizResponse;
        try {
            quizData = await generateQuiz(numQuestions, subject, grade, difficulty);
        } catch (error) {
            console.error('Error generating quiz:', error);
            return res.status(500).json({ message: 'Failed to generate quiz questions' });
        }

        const quizId = new mongoose.Types.ObjectId();

        const quizObject = {
            _id: quizId,
            quizId: quizId,
            email: req.body.user.email,
            grade: grade,
            subject: subject,
            totalQuestions: numQuestions,
            maxScore: numQuestions,
            difficulty: difficulty,
            attempts: 0
        };

        let createdQuiz;
        try {
            createdQuiz = await createQuiz(quizObject);
        } catch (error) {
            console.error('Error creating quiz in database:', error);
            return res.status(500).json({ message: 'Failed to create quiz in database' });
        }

        const questions = quizData.questions.map((item: Question) => ({
            questionId: `Q${item.Qno}`,
            Qno: item.Qno,
            quizId: quizId,
            questionText: item.question,
            options: Object.entries(item.choices).map(([key, value]) => ({ label: key, value })),
            correctAnswer: item.correctAnswer,
            hints: item.hint
        }));

        try {
            await insertManyQuestions(questions);
        } catch (error) {
            console.error('Error inserting questions in database:', error);
            if (error.code === 11000) {
                // Duplicate key error
                try {
                    await deleteQuizById(quizId + '') ;
                } catch (deleteError) {
                    console.error('Error deleting quiz after failed question insertion:', deleteError);
                }
                return res.status(400).json({ message: 'Duplicate question IDs detected. Please try again.' });
            }
            try {
                await deleteQuizById(quizId + '');
            } catch (deleteError) {
                console.error('Error deleting quiz after failed question insertion:', deleteError);
            }
            return res.status(500).json({ message: 'Failed to insert questions in database' });
        }

        const resObject : quizFromate = {
            quizId: quizId + '',
            grade: grade,
            subject: subject,
            totalQuestions: numQuestions,
            maxScore: numQuestions,
            difficulty: difficulty,
            questions: quizData.questions.map((item: Question) => ({
                Qno: item.Qno,
                questionText: item.question,
                options: Object.entries(item.choices).map(([key, value]) => ({ label: key, value }))
            })),
            attempts: 0
        }
        
        return res.status(200).json(resObject);
    } catch (error) {
        console.error('Unexpected error in newQuizController:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
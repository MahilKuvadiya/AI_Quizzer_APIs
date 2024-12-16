import { Request, Response } from 'express';
import { getQuizById } from '../../db/quiz';
import { getQuestionsByQuizId } from '../../db/question';

export const getAQuiz = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { hintFor, answerFor } = req.query; // Get both hintFor and answerFor query parameters

        const quiz = await getAQuizById(id, hintFor as string, answerFor as string); // Pass both hintFor and answerFor to the function

        return res.status(200).json(quiz).end();
    } catch (e) {
        console.log('Error from controller/quiz/get-a-quiz', e);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Function to fetch quiz by id and selectively fetch hints and correct answers if requested
export const getAQuizById = async (id: string, hintFor?: string, answerFor?: string) => {
    try {
        const quiz = await getQuizById(id);
        let questions = await getQuestionsByQuizId(id); // Fetch questions without hints and answers initially

        // Fetch hints if requested
        if (hintFor) {
            if (hintFor.toUpperCase() === 'ALL') {
                // Fetch all questions with hints
                const questionsWithHints = await getQuestionsByQuizId(id).select('+hints');
                questions = mergeHintsIntoQuestions(questions, questionsWithHints);
            } else {
                // Fetch hints for specific question IDs
                const questionIds = hintFor.split(',');
                const questionsWithHints = await fetchHintsByIds(id, questionIds);
                questions = mergeHintsIntoQuestions(questions, questionsWithHints);
            }
        }

        // Fetch correct answers if requested
        if (answerFor) {
            if (answerFor.toUpperCase() === 'ALL') {
                // Fetch all questions with correct answers
                const questionsWithAnswers = await getQuestionsByQuizId(id).select('+correctAnswer');
                questions = mergeAnswersIntoQuestions(questions, questionsWithAnswers);
            } else {
                // Fetch correct answers for specific question IDs
                const questionIds = answerFor.split(',');
                const questionsWithAnswers = await fetchAnswersByIds(id, questionIds);
                questions = mergeAnswersIntoQuestions(questions, questionsWithAnswers);
            }
        }

        quiz.questions = questions;
        return quiz;
    } catch (e) {
        console.log('Error from controller/quiz/get-a-quiz', e);
        return null;
    }
};

// Function to fetch questions with hints for specific question IDs
const fetchHintsByIds = async (quizId: string, questionIds: string[]) => {
    return await getQuestionsByQuizId(quizId)
        .where('Qno').in(questionIds)
        .select('Qno hints'); // Fetch only the question number and hints fields
};

// Function to fetch questions with correct answers for specific question IDs
const fetchAnswersByIds = async (quizId: string, questionIds: string[]) => {
    return await getQuestionsByQuizId(quizId)
        .where('Qno').in(questionIds)
        .select('Qno correctAnswer'); // Fetch only the question number and correctAnswer fields
};

// Function to merge hints into the original questions
const mergeHintsIntoQuestions = (questions: any[], questionsWithHints: any[]) => {
    return questions.map((question: any) => {
        const questionWithHint = questionsWithHints.find(q => q.Qno === question.Qno);
        if (questionWithHint) {
            question.hints = questionWithHint.hints; // Attach hint if it exists
        }
        return question;
    });
};

// Function to merge correct answers into the original questions
const mergeAnswersIntoQuestions = (questions: any[], questionsWithAnswers: any[]) => {
    return questions.map((question: any) => {
        const questionWithAnswer = questionsWithAnswers.find(q => q.Qno === question.Qno);
        if (questionWithAnswer) {
            question.correctAnswer = questionWithAnswer.correctAnswer; // Attach correct answer if it exists
        }
        return question;
    });
};

import { Request, Response } from 'express';
import { getQuizById, updateLastAttempt, updateQuizAttemps } from '../../db/quiz';
import { getQuestionsByQuizId } from '../../db/question';
import { createSubmission } from '../../db/submission';

interface Answer {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D';
}

interface SubmissionRequest {
  userId: string;
  quizId: string;
  answers: Answer[];
}

export const submission = async (req: Request, res: Response) => {
  try {
    const submissions: SubmissionRequest[] = req.body;
    if (req.body.user.email === undefined) {
      return res.status(400).json({ message: 'sender email is required' }).end();
    }

    // const submissionObjects : any= []

    // Use Promise.all to fetch quiz and questions concurrently
    const submissionObjects =await Promise.all( 
      submissions.map( async ( submission : SubmissionRequest ) => {

      const [quiz, questions] = await Promise.all([
        getQuizById(submission.quizId),
        getQuestionsByQuizId(submission.quizId).select('Qno correctAnswer')
      ]);
  
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' }).end();
      }
  
      if (!questions || questions.length === 0) {
        console.log('Error: No questions found for quiz', submission.quizId);
        return res.status(404).json({ message: 'No questions found for this quiz' }).end();
      }
  
      if (submission.answers.length !== questions.length) {
        return res.status(400).json({ message: 'Invalid submission: number of answers does not match number of questions' }).end();
      }
  
      let score = 0;
      const answers = submission.answers.map((answer) => {
          const question = questions.find((q) => q.Qno.toString() === answer.questionId);
        if (question && answer.selectedOption === question.correctAnswer) {
          score++;
        }
        return {
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          correctAnswer: question ? question.correctAnswer : 'Question not found',
        };
      });
  
      const submissionObject = {
        quizId: submission.quizId,
        email: req.body.user.email,
        answers: answers,
        score: score,
        maxScore : questions.length,
        completedDateAndTime: new Date()
      };
  
      //store the submissionObject into the databse
  
      await createSubmission(submissionObject);
  
      await updateQuizAttemps(submission.quizId, { $inc: { attempts : 1 } });
      await updateLastAttempt(submission.quizId, { lastAttempt : new Date() });

      return submissionObject;

    }
    ));
  

    return res.status(200).json(submissionObjects).end();
  } catch (e) {
    console.error('Error in quiz submission:', e);
    return res.status(500).json({ message: 'Internal server error' });
  } 
}
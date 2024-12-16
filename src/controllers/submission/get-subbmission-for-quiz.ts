import { Request, Response } from 'express';
import { getByFilter, getSubmissionByQuizId } from '../../db/submission';

export const getSubmissionForQuizController = async (req: Request, res: Response) => {
    try {
        const quizId = req.params.quizId;

        if (!quizId) {
            return res.status(400).json({ message: 'Quiz ID is required' }).end();
        }

        const { fromDate, toDate, sortByDate = 'desc', maxScore } = req.query;

        let filter: any = { quizId };

        if (fromDate) {
            filter.createdAt = { ...filter.createdAt, $gte: new Date(fromDate as string) };
        }
        if (toDate) {
            filter.createdAt = { ...filter.createdAt, $lte: new Date(toDate as string) };
        }

        // Fetch submissions from the database
        let submissions = await getByFilter(filter);

        // Filter by maxScore if specified
        if (maxScore) {
            submissions = submissions.filter(submission => submission.score >= parseInt(maxScore as string));
        }

        // Sort the submissions by score (descending by default)
        submissions.sort((a, b) => {
            return sortByDate === 'asc' ? a.score - b.score : b.score - a.score;
        });

        // Sort by createdAt if needed, after filtering
        submissions.sort((a, b) => {
            return sortByDate === 'asc' ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return res.status(200).json(submissions).end();
    } catch (e) {
        console.log('Error from controller/submission/getSubmissionForQuiz', e);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

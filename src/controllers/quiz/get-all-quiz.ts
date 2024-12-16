import { Request, Response } from 'express';
import { quizModal } from '../../db/quiz'; // Adjust import paths as necessary

interface FilterParams {
  grade?: string;
  subject?: string;
  difficulty?: string;
  submittedAfter?: string; 
  fromDate?: string;
  toDate?: string;
}

export const getQuizHistory = async (req: Request, res: Response) => {
  try {
    const filters: FilterParams = req.query;
    const userEmail = req.body.user.email; 

    let query: any = { 'email': userEmail };

    // Apply filters
    if (filters.grade) query['grade'] = filters.grade;
    if (filters.subject) query['subject'] = filters.subject;
    if (filters.difficulty) query['difficulty'] = filters.difficulty;

    //handle submitted after filter based on the lastAttemptDate
    if (filters.submittedAfter) {
      query.lastAttempt = { $gte: new Date(filters.submittedAfter) };
    }

    // Apply fromDate and toDate filters if provided
    if (filters.fromDate || filters.toDate) {
        query.createdAt = query.createdAt || {};
        if (filters.fromDate) query.createdAt.$gte = new Date(filters.fromDate);
        if (filters.toDate) query.createdAt.$lte = new Date(filters.toDate);
    }

    const quizHistory = await quizModal.find(query)
    //   .populate('Quiz', 'title grade subject difficulty')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: quizHistory,
      message: 'Quiz history retrieved successfully'
    });

  } catch (error) {
    console.error('Error in getQuizHistory:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

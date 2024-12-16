// {
//     "Submission": {
//       "submissionId": "string",        // Unique identifier for the submission
//       "quizId": "string",              // References the Quiz schema
//       "userId": "string",              // User who submitted the quiz
//       "answers": [
//         {
//           "questionId": "string",      // References the Question schema
//           "selectedOption": "string"   // Answer selected by the user
//           "CorrectAnswer" : "string"
//         }
//       ],
//       "score": "integer",              // Score for this submission
//       "completedDate": "Date",         // Date the quiz was submitted
//       "createdAt": "Date",             // Timestamp of submission creation
//       "updatedAt": "Date"              // Timestamp of last update
//     }
//   }

import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema(
    {
        quizId: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
            select : false
        },
        answers: [
            {
                questionId: {
                    type: String,
                    require: true,
                },
                selectedOption: {
                    type: String,
                    require: true,
                },
                correctAnswer: {
                    type: String,
                    require: true,
                },
            },
        ],
        score: {
            type: Number,
            require: true,
        },
        maxScore: {
            type: Number,
            require: true,
        },
        completedDateAndTime: {
            type: Date,
            require: true,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        updatedAt: {
            type: Date,
            default: Date.now(),
        },
    },
    { timestamps: true }
)

export const submissionModal = mongoose.model('submission', submissionSchema)   

export const getSubmissionById = (id: string) => submissionModal.findById(id)   

export const getSubmissionByQuizId = (quizId: string) => submissionModal.find({ quizId })

export const getSubmissionByEmail = (email: string) => submissionModal.find({ email })

export const createSubmission = (submission: Record<string, any>) =>
    new submissionModal(submission).save().then((submission) => submission.toObject())

export const getByFilter = (filter: Record<string, any>) => submissionModal.find(filter)
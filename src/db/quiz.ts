import mongoose from 'mongoose'

// {
//     "Quiz": {
//       "quizId": "string",              // Unique identifier for the quiz
//       "userId": "string",              // User who is taking the quiz
//       "grade": "integer",              // Grade level
//       "subject": "string",             // Subject (e.g., "Maths")
//       "totalQuestions": "integer",     // Total number of questions in the quiz
//       "maxScore": "integer",           // Maximum score for the quiz
//       "difficulty": "string",          // Difficulty level ("EASY", "MEDIUM", "HARD")
//       "questions": [
//         {
//           "questionId": "string",      // References the Question schema
//           "userAnswer": "string",      // User's submitted answer for this question
//           "isCorrect": "boolean"       // Whether the user's answer was correct
//         }
//       ],
//       "score": "integer",              // Score achieved by the user
//       "completedDate": "Date",         // Date the quiz was completed
//       "attempts": "integer",           // Number of attempts made for this quiz
//       "retryAvailable": "boolean",     // Whether the quiz can be retried
//       "createdAt": "Date",             // Timestamp of quiz creation
//       "updatedAt": "Date"              // Timestamp of last update
//     }
//   }

const quizSchema = new mongoose.Schema({
    quizId : {
        type : String,
        require : true,
        unique : true,
    },
    email : {
        type : String,
        require : true,
        select : false, // email would not appear in the api response
    },
    grade : {
        type : Number,
        require : true
    },
    subject : {
        type : String,
        require : true
    },
    totalQuestions : {
        type : Number,
        require : true
    },
    maxScore : {
        type : Number,
        require : true
    },
    difficulty : {
        type : String,
        require : true
    },
    questions : {
        type : Array,
        select : false
    },
    // questions : [
    //     {
    //         questionId : {
    //             type : String,
    //             require : true
    //         },
    //         // userAnswer : {
    //         //     type : String,
    //         //     require : true
    //         // },
    //         // isCorrect : {
    //         //     type : Boolean,
    //         //     require : true
    //         // }
    //     }
    // ],
    // score : {
    //     type : Number,
    //     require : true
    // },
    // completedDate : {
    //     type : Date,
    //     require : true
    // },
    attempts : {
        type : Number,
        require : true
    },
    lastAttempt : {
        type : Date,
        require : false
    },
    createdAt : {
        type : Date,
        select : false,
        default : Date.now()
    },
    updatedAt : {
        type : Date,
        select : false ,
        default : Date.now()
    }
});

export const quizModal = mongoose.model( "Quiz" , quizSchema );

export const getQuizById = (id : string) => quizModal.findById(id);

//get all quiz by email
export const getAllQuizesByEmail = ( email : string ) => quizModal.find({email});

//create quiz
export const createQuiz = ( quiz : Record<string,any>) => new quizModal(quiz).save().then((quiz)=>{
    return quiz.toObject();
})

//delete quiz by id
export const deleteQuizById = (id : string ) => quizModal.findByIdAndDelete(id)

export const updateQuizAttemps = (id : string, values : Record<string,any>) => quizModal.findByIdAndUpdate(id,values);

export const updateLastAttempt = (id : string, values : Record<string,any>) => quizModal.findByIdAndUpdate(id,values);

export const updateQuiz = ( id : string, values : Record<string,any>) => quizModal.findByIdAndUpdate(id,values);

// export const getQuiz = (id : string) => quizModal.findById(id).where('flag').equals('false');
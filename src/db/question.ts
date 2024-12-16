// {
//     "Question": {
//       "questionId": "string",          // Unique identifier for the question
//       "questionText": "string",        // Actual question text
//       "subject": "string",             // Subject (e.g., "Maths", "Science")
//       "grade": "integer",              // Grade level (e.g., 5, 6, etc.)
//       "difficulty": "string",          // Difficulty level ("EASY", "MEDIUM", "HARD")
//       "options": ["string"],           // List of possible answers
//       "correctAnswer": "string",       // The correct answer for evaluation
//       "hints": ["string"],             // List of hints for the question
//       "createdAt": "Date",             // Timestamp of question creation
//       "updatedAt": "Date"              // Timestamp of last update
//     }
//   }

import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
    questionId : {
        type : String,
        require : true,
        select : false,
    },  
    quizId : {
        type : String,
        require : true,
        select : false,
    },
    Qno : {
        type : Number,
        require : true
    },
    questionText : {
        type : String,
        require : true
    },
    // subject : {
    //     type : String,
    //     require : true
    // },
    // grade : {
    //     type : Number,
    //     require : true
    // },
    // difficulty : {
    //     type : String,
    //     require : true
    // },
    options : {
        type : Array,
        require : true
    },
    correctAnswer : {
        type : String,
        require : true,
        select : false,
    },
    hints : {
        type : String,
        require : true,
        select : false,
    },
    flag : { 
        type : mongoose.Schema.Types.Boolean,
        default : false,
        select : true,
    }
});

const questionModal = mongoose.model('question', questionSchema);

export const getQuestionById = ( id : string ) => questionModal.findById(id);

// get all question from a quiz
export const getQuestionsByQuizId = ( quizId : string ) => questionModal.find({quizId}).where('flag').equals(false);

export const createQuestion = ( question : Record<string,any>) => new questionModal(question).save().then((question)=>{
    return question.toObject();
})

//insert many query
export const insertManyQuestions = ( questions : Record<string,any>[]) => questionModal.insertMany(questions).then((questions)=>{
    return questions;
})

export const updateQuestionById = ( id : string, values : Record<string,any>) => questionModal.findByIdAndUpdate(id, values);
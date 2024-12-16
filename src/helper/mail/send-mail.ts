//@ts-ignore

import emailjs from '@emailjs/nodejs'
import { getQuizById } from "../../db/quiz";
import { getQuestionsByQuizId } from "../../db/question";
import { getSubmissionById } from "../../db/submission"; // Adjust this import
import { generateImprovementSuggestions, QuestionDetail } from '../../controllers/groq/suggestion-fetch';


// EmailJS template
const emailJSTemplate = `
<div style="font-family: Arial, sans-serif; margin: 20px; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
    <h1 style="color: #4CAF50;">Quiz Results</h1>
    <p><strong>Subject:</strong> {{subject}}</p>
    <p><strong>Grade:</strong> {{grade}}</p>
    <p><strong>Total Questions:</strong> {{totalQuestions}}</p>
    <p style="font-size: 1.5em; color: #2196F3;"><strong>Your Score:</strong> {{score}} out of {{maxScore}}</p>
    
    <h2 style="color: #FF5722;">Questions, Your Answers, and Options</h2>
    <ul style="list-style-type: none; padding: 0;">
        {{#questions}}
        <li style="background-color: {{#correct}}#C8E6C9{{/correct}}{{^correct}}#FFEBEE{{/correct}}; margin: 10px 0; padding: 10px; border-radius: 4px;">
            <strong>{{Qno}}. {{questionText}}</strong><br />
            <strong>Your Answer:</strong> {{selectedOption}}<br />
            <strong>Correct Answer:</strong> {{correctAnswer}}<br />
            <ul>
                {{#options}}
                <li style="margin-left: 15px; padding: 5px; border-radius: 4px; background-color: {{#isCorrect}}#C8E6C9{{/isCorrect}}{{^isCorrect}}{{#isSelected}}#FFEBEE{{/isSelected}}{{^isSelected}}transparent{{/isSelected}}{{/isCorrect}};">
                    <span style="font-weight: {{#isSelected}}bold{{/isSelected}}{{^isSelected}}{{#isCorrect}}bold{{/isCorrect}}{{^isCorrect}}normal{{/isCorrect}}{{/isSelected}};">
                        {{label}}. {{value}}
                    </span>
                    {{#isSelected}}
                        {{#isCorrect}}
                        <span style="color: green;">(Your choice, Correct)</span>
                        {{/isCorrect}}
                        {{^isCorrect}}
                        <span style="color: red;">(Your choice, Incorrect)</span>
                        {{/isCorrect}}
                    {{/isSelected}}
                </li>
                {{/options}}
            </ul>
        </li>
        {{/questions}}
    </ul>
    
    <h2 style="color: #FF9800;">Suggestions for Improvement</h2>
    <ul>
    {{#suggestions}}
      <li> {{text}}</li>
    {{/suggestions}}
    </ul>
    
    <footer style="margin-top: 20px; font-size: 0.8em; color: #666;">
        <p>Thank you for participating in the quiz!</p>
        <p>&#169;Mahil Kuvadiya</p>
    </footer>
</div>
`;

export const sendEmail = async (submissionId: string) => {
  try {
    emailjs.init({
      publicKey: 'TqFCx2uNEtv0y1bdX',
      privateKey: '6xwRuO8LuDNB_rsCzXCDv' // Access Token
    });

    const submission = await getSubmissionById(submissionId).select('+email');
    if (!submission) {
      console.error("Submission not found");
      return;
    }

    const quiz = await getQuizById(submission.quizId);
    const questions = await getQuestionsByQuizId(submission.quizId);

    if (!quiz) {
      console.error("Quiz not found");
      return;
    }

    const incorrectQuestions = questions.map((question) => {
      const answer = submission.answers.find(
        (ans) => ans.questionId === question.Qno.toString()
      );

      const correct = answer && answer.selectedOption === answer.correctAnswer;

      if (!correct) {
        return {
          questionNumber: question.Qno,
          question: question.questionText || 'No question text',
          options: {
            A: question.options[0]?.value || 'N/A',
            B: question.options[1]?.value || 'N/A',
            C: question.options[2]?.value || 'N/A',
            D: question.options[3]?.value || 'N/A',
          },
          userAnswer: answer?.selectedOption || 'N/A',
          correctAnswer: answer?.correctAnswer || 'N/A'
        };
      }
      return null;
    }).filter(Boolean); 

    const suggestions = await generateImprovementSuggestions(
      quiz.subject || 'N/A',
      quiz.grade ,
      submission.score || 0,
      questions.length,
      incorrectQuestions as QuestionDetail[]
    );

    const templateParams = {
      to_email: submission.email, 
      from_name: "Your Quiz System",
      subject: quiz.subject || 'N/A',
      grade: quiz.grade || 'N/A',
      totalQuestions: quiz.totalQuestions || questions.length,
      score: submission.score || '0',
      maxScore: quiz.maxScore || 'N/A',
      questions: questions.map((question) => {
        const answer = submission.answers.find(
          (ans) => ans.questionId === question.Qno.toString()
        );
        const correct = answer && answer.selectedOption === answer.correctAnswer;

        return {
          Qno: question.Qno,
          questionText: question.questionText || 'No question text',
          selectedOption: answer ? answer.selectedOption : 'N/A',
          correctAnswer: answer?.correctAnswer || 'N/A',
          correct: correct,
          options: question.options.map((option) => ({
            label: option.label || 'N/A',
            value: option.value.replace(/['"]/g, ''),
            isSelected: option.label === answer?.selectedOption,
            isCorrect: option.label === answer?.correctAnswer,
          }))
        };
      }),
      suggestions: suggestions.suggestions
    };

    console.log(JSON.stringify(templateParams, null, 2));

    const response = await emailjs.send(
      'service_ttl9d0n', // EmailJS service ID
      'template_yohzch6', // EmailJS template ID
      templateParams, // Dynamic variables
      'TqFCx2uNEtv0y1bdX' // Public key
    );

    console.log('Email sent successfully:', response);

  } catch (error) {
    console.error("Error in sendEmail:", error);
  }
};

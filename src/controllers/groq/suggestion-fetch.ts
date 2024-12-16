import Groq from 'groq-sdk';

const client = new Groq({
  apiKey: process.env['GROQ_API_KEY'],
});

export interface QuestionDetail {
  questionNumber: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  userAnswer: string;
  correctAnswer: string;
}

interface ImprovementSuggestions {
  suggestions: string[];
}

async function getImprovementSuggestions(
  subject: string,
  grade: number,
  score: number,
  totalQuestions: number,
  incorrectQuestions: QuestionDetail[]
): Promise<ImprovementSuggestions> {
  const incorrectQuestionsString = incorrectQuestions.map(q => 
    `Question ${q.questionNumber}: "${q.question}"
    Options:
    A. ${q.options.A}
    B. ${q.options.B}
    C. ${q.options.C}
    D. ${q.options.D}
    User's answer: ${q.userAnswer}
    Correct answer: ${q.correctAnswer}`
  ).join('\n\n');

  const prompt = `
    You are an expert educational AI tutor. A student has just completed a ${subject} quiz for grade ${grade}. They scored ${score} out of ${totalQuestions} questions. Below are the details of the questions they answered incorrectly:

    ${incorrectQuestionsString}

    Based on this detailed information, provide up to 5 specific suggestions for improvement. Each suggestion should be:
    1. Concise and actionable
    2. Tailored to help the student enhance their understanding of ${subject}
    3. Focused on the specific concepts covered in the incorrect questions
    4. Appropriate for a grade ${grade} student
    5. Designed to address patterns or common themes in the student's mistakes, if any

    Your suggestions should go beyond simply restating the correct answers. Instead, focus on:
    - Underlying concepts the student might be struggling with
    - Study techniques or approaches that could help in similar questions
    - Common misconceptions in ${subject} that might have led to these errors
    - Specific areas within ${subject} where the student might need more practice

    Provide a minimum of 2 and a maximum of 5 suggestions. Return the output in JSON format with a key named "suggestions" containing an array of these suggestions.
    A single attribute with key named "text" would be there.
  `;

  const chatCompletion = await client.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 1,
    stream: false,
    response_format: { type: 'json_object' }
  });

  let content = chatCompletion.choices[0].message.content;

  try {
    return JSON.parse(content) as ImprovementSuggestions;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    console.log("Attempted to parse:", content);
    throw new Error("Invalid JSON response from Groq AI");
  }
}

async function retryGetImprovementSuggestions(
  subject: string,
  grade: number,
  score: number,
  totalQuestions: number,
  incorrectQuestions: QuestionDetail[],
  maxRetries = 3
): Promise<ImprovementSuggestions> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await getImprovementSuggestions(subject, grade, score, totalQuestions, incorrectQuestions);
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
    }
  }
  throw new Error("Max retries reached. Failed to get a valid response from Groq AI.");
}

export async function generateImprovementSuggestions(
  subject: string,
  grade: number,
  score: number,
  totalQuestions: number,
  incorrectQuestions: QuestionDetail[]
): Promise<ImprovementSuggestions> {
  try {
    const suggestions = await retryGetImprovementSuggestions(subject, grade, score, totalQuestions, incorrectQuestions);
    
    if (!suggestions.suggestions || !Array.isArray(suggestions.suggestions) || 
        suggestions.suggestions.length < 2 || suggestions.suggestions.length > 5) {
      throw new Error("Invalid suggestions data structure");
    }

    return suggestions;
  } catch (error) {
    console.error("Failed to generate improvement suggestions:", error);
    throw error;
  }
}

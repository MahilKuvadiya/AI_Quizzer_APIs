import Groq from 'groq-sdk';

const client = new Groq({
apiKey: process.env['GROQ_API_KEY'],
});

export interface Question {
Qno: number;
question: string;
choices: {
    A: string;
    B: string;
    C: string;
    D: string;
};
correctAnswer: 'A' | 'B' | 'C' | 'D';
hint: string;
}

export interface QuizResponse {
questions: Question[];
}

function cleanJsonContent(content: string): string {
return content
    .replace(/(\w+):/g, '"$1":') // Ensure all keys are quoted
    .replace(/:\s*(-?\d+(\.\d+)?)/g, ':"$1"') // Quote all numeric values
    .replace(/°/g, ' degrees'); // Replace degree symbols
}

async function getGroq(numQuestions: number, subject: string, grade: number, difficulty: string): Promise<QuizResponse> {
const prompt = `
Generate ${numQuestions} unique multiple choice questions on ${subject} for students in grade ${grade}, ensuring that each question is suitable for the ${difficulty} level. Return the output in JSON format with a key named "questions" containing an array of these questions. Each question should include four options labeled A, B, C, and D, where each option is unique and one is correct. The choices property should be an object with keys A, B, C, and D, mapping to the respective answer options. All numeric values in the choices should be enclosed in quotes. The correctAnswer should be one of these labels ("A", "B", "C", or "D") indicating the correct choice. Each question should also include a Qno field that represents the question number in the array, using 1-based indexing. Include a hint for each question to provide additional guidance. Avoid using special characters like degree symbols. Verify that all answers are accurate and mathematically and logically correct. Ensure that the JSON format is valid and free from any extra characters or formatting issues.
The choices property should be an object with keys A, B, C, and D, mapping to the respective answer options.`;

const chatCompletion = await client.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [
    {
        role: "user",
        content: prompt,
    },
    ],
    temperature: 0.5, 
    max_tokens: 4096,
    top_p: 1,
    stream: false,
    response_format: { type: 'json_object' }
});

let content = chatCompletion.choices[0].message.content;
//   content = cleanJsonContent(content);

try {
    return JSON.parse(content) as QuizResponse;
} catch (error) {
    console.error("Failed to parse JSON:", error);
    console.log("Attempted to parse:", content);
    throw new Error("Invalid JSON response from Groq AI");
}
}

async function retryGroq(numQuestions: number, subject: string, grade: number, difficulty: string, maxRetries = 3): Promise<QuizResponse> {
for (let i = 0; i < maxRetries; i++) {
    try {
    return await getGroq(numQuestions, subject, grade, difficulty);
    } catch (error) {
    console.error(`Attempt ${i + 1} failed:`, error);
    if (i === maxRetries - 1) throw error;
    }
}
throw new Error("Max retries reached. Failed to get a valid response from Groq AI.");
}

export async function generateQuiz(numQuestions: number, subject: string, grade: number, difficulty: string): Promise<QuizResponse> {
try {
    const quizData = await retryGroq(numQuestions, subject, grade, difficulty);
    
    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length !== numQuestions) {
    throw new Error("Invalid quiz data structure");
    }

    return quizData;
} catch (error) {
    console.error("Failed to generate quiz:", error);
    throw error;
}
}

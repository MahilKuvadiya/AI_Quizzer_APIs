
import { submission as subm } from "../../controllers/submission/quiz-submission";
import { Router } from "express"
import { validateAccessToken } from "../../middlewares"
import { getSubmissionForQuizController } from "../../controllers/submission/get-subbmission-for-quiz";
import { sendResponse } from "../../controllers/submission/send-response";
import { cacheMiddleware } from "../../middlewares/cache-redis";
import { getASubmission } from "../../controllers/submission/get-a-submission";
import { GetMaximumSumbMissionScore } from "../../controllers/submission/try";

 
export const submission = ( router: Router) => {
    router.post('/submission', validateAccessToken, subm);
    router.get('/quizes/:quizId/submissions', validateAccessToken, cacheMiddleware(3600), getSubmissionForQuizController)
    router.get('/submission/:submissionId', validateAccessToken, cacheMiddleware(3600), getASubmission)
    router.get('/submission/:submissionId/mail', validateAccessToken,cacheMiddleware(3600), sendResponse)
    router.get('/max_submission', validateAccessToken, GetMaximumSumbMissionScore)
}
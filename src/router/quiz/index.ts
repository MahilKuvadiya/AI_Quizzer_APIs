import { getQuizHistory } from "../../controllers/quiz/get-all-quiz"
import { newQuizController } from "../../controllers/quiz/new-quiz"
import { Router } from "express"
import { validateAccessToken } from "../../middlewares"
import { getAQuiz } from "../../controllers/quiz/get-a-quiz"
import { cacheMiddleware } from "../../middlewares/cache-redis"
import { updateController } from "../../controllers/quiz/update-question"

export const quiz = ( router: Router) => {
    router.get('/quizes', validateAccessToken, cacheMiddleware(3600) ,getQuizHistory)
    router.post('/new_quiz', validateAccessToken, newQuizController)
    router.get('/quizes/:id', validateAccessToken, getAQuiz); // not cached because of the update API
    router.post('/quizes/update', validateAccessToken, updateController)
}
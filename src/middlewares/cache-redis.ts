import { Request, Response, NextFunction } from 'express';
import redisClient from '../helper/redis-client/redis-client';


// Extend the Express Response interface to add the sendResponse method
interface ExtendedResponse extends Response {
    sendResponse?: (body: any) => Response;
}

export const cacheMiddleware = (expiry: number = 3600) => {
    return async (req: Request, res: ExtendedResponse, next: NextFunction) => {
        try {
            console.log('in cache middleware')
            const baseKey = `${req.originalUrl}`;
            const queryParams = Object.entries(req.query)
                .sort()
                .map(([key, value]) => `${key}=${value}`)
                .join('&');
            const cacheKey = queryParams ? `${baseKey}?${queryParams}` : baseKey;

            const cacheData = await redisClient.get(cacheKey);
            if (cacheData) {
                console.log("cached data")
                return res.status(200).json(JSON.parse(cacheData));
            }

            // Save the original res.json method
            const originalJson = res.json.bind(res);

            // Replace res.json with custom logic
            res.json = (body: any): Response => {
                redisClient.setEx(cacheKey, expiry, JSON.stringify(body)).catch((err: any) => {
                    console.error('Redis set error:', err);
                });
                return originalJson(body); // Call the original res.json method
            };

            next();
        } catch (error) {
            console.error('Cache error:', error);
            next();
        }
    };
};

import { Request, Response } from 'express';
import { sendEmail } from '../../helper/mail/send-mail';

export const sendResponse = async (req: Request, res: Response) => {
    try {
        const submissionId = req.params.submissionId;

        if (submissionId === undefined) {
            return res.status(400).json({ message: 'Submission ID is required' }).end();
        }


        sendEmail(submissionId)

        return res.status(200).json({ message: 'Email sent successfully' }).end();
    } catch (error) {
        console.log('Error from controller/ submission/ sendResponse', error);
        return res.sendStatus(500);
    }
}
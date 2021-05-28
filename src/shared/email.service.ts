import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as config from 'config';
import { User } from 'src/auth/user.entity';

@Injectable()
export class EmailService {

    constructor() {
        try {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY || config.get('email.sendgridApi'));
        } catch(error) {
            throw new InternalServerErrorException({error, message: 'Failed to initialize Sendgrid'});
        }
    }

    async sendAccountActivationEmail(user: User): Promise<void> {
        const msg = {
            to: user.email,
            from: process.env.SENDGRID_API_KEY || config.get('email.sender'),
            subject: `Tesorapp - ${user.username} confirm your email`,
            html: `
                Please confirm your email by clicking <a href="https://www.google.com">here</a>.
            `
        };
        try {
            await sgMail.send(msg);
        } catch (error) {
            throw new InternalServerErrorException('Failed to send email');
        }
    }
}



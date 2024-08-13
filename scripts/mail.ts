import 'dotenv/config';

import { sendMail } from "@/mailer";

sendMail({
    toEmail: 'farai.matare@bwscloud.tech',
    subject: 'Testing!',
    textMessage: '1,2 testing...',
    htmlMessage: '<h1>1, 2 testing...</h1>',
});

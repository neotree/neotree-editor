import 'dotenv/config';

import { sendMail } from '@/mailer';
import { getTestEmailData } from '@/mailer/get-test-email-data';

(async () => {
    try {
        console.log('Sending test email...');
        await sendMail({
            toEmail: 'farai.matare@bwscloud.tech',
            ...getTestEmailData(),
        });
        console.log('Test email sent!');
    } catch(e) {
        console.log('Failed to send test email!', e);
    } finally {
        process.exit();
    }
})();

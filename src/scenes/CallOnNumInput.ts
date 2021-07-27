import { Markup, Scenes } from 'telegraf';
import { server } from '../server';
import { vonageMakeACall } from '../utils/vonage';
import { getUser } from '../utils/getUser';

export const callOnNumInputScene = new Scenes.WizardScene(
  'CALL_ID_ON_NUM_INPUT',
  async ctx => {
    try {
      const { hasExpired } = await getUser({ id: ctx.from?.id as number });
      if (hasExpired) {
        await ctx.replyWithHTML(
          `👋 <b>Welcome back ${ctx.from?.first_name}</b>,\n\nYour subscirption has <b>expired.</b>`,
          Markup.inlineKeyboard([
            Markup.button.callback('Renew', 'buy'),
            //   Markup.button.callback('Status', 'Status'),
          ]),
        );
        return ctx.scene.leave();
      }
    } catch (error) {
      await ctx.replyWithHTML(
        `😃 <b>Welcome ${ctx.from?.first_name}</b>,\n\n🛒 1 Month subscription\n💲 Price: <b>$${process.env.OTP_PRICE}</b>\n\nTo purchase click the buy button below and you will be prompted to select a currency`,
        Markup.inlineKeyboard([
          Markup.button.callback('Buy', 'buy'),
          //   Markup.button.callback('Status', 'Status'),
        ]),
      );
      return ctx.scene.leave();
    }

    //@ts-expect-error
    if (!ctx.message || !ctx.wizard.state.callData) {
      await ctx.reply(
        '🚫 Request expired, start again\n\n',
        Markup.inlineKeyboard([Markup.button.callback('Make a call', 'call')]),
      );

      return ctx.scene.leave();
    }

    const numValid = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(
      //@ts-expect-error
      ctx.message.text,
    );

    if (!numValid) {
      await ctx.reply(
        `Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `,
      );
      return;
    }
    await ctx.replyWithHTML(
      `Good,\nReply with the bank name 🏦\n(e.g ${
        /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/g.test(
          // @ts-expect-error
          ctx.wizard.state.callData.number,
        )
          ? 'Barclays'
          : 'Chase'
      })\n\n<i>***request will expire in 2 minutes***</i>`,
      Markup.inlineKeyboard([Markup.button.callback('❌ Cancel', 'cancel')]),
    );

    return ctx.wizard.next();
  },
  async ctx => {
    // @ts-expect-error
    if (!ctx.message || !ctx.wizard.state.callData) {
      await ctx.reply(
        '🚫 Request expired, start again\n\n',
        Markup.inlineKeyboard([Markup.button.callback('Make a call', 'call')]),
      );

      return ctx.scene.leave();
    }

    const numValid = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(
      //@ts-expect-error
      ctx.wizard.state.callData.number,
    );

    if (!numValid) {
      await ctx.reply(
        `Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `,
      );
      return;
    }
    await ctx.replyWithHTML(
      `Okay,\nReply with the caller ID 👤\n(e.g ${
        /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/g.test(
          // @ts-expect-error
          ctx.message.text,
        )
          ? '448081961740'
          : '18882019292'
      })\n\n<i>***request will expire in 2 minutes***</i>`,
    );

    // @ts-expect-error
    ctx.wizard.state.callData.institutionName = ctx.message.text;
    return ctx.wizard.next();
  },
  async ctx => {
    if (!ctx.message) {
      await ctx.reply(
        '🚫 Request expired, start again\n\n',
        Markup.inlineKeyboard([Markup.button.callback('Make a call', 'call')]),
      );

      return ctx.scene.leave();
    }

    // @ts-expect-error
    ctx.wizard.state.callData.callerId = ctx.message.text;
    // @ts-expect-error
    ctx.wizard.state.userCalling = {
      // @ts-expect-error
      [ctx.wizard.state.callData.number]: ctx.chat.id,
    };

    // @ts-expect-error
    const { number, institutionName, callerId } = ctx.wizard.state.callData;
    const from = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/g.test(
      number,
    )
      ? process.env.UK_NUM
      : process.env.US_NUM;

    await ctx.reply(
      `Calling ${number}\nfrom ${callerId} as:\n\n${institutionName} 📲...`,
    );

    await server(ctx);

    await vonageMakeACall({
      from,
      to: number,
      institutionName: institutionName,
    });
  },
);

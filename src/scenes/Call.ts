import { Markup, Scenes } from 'telegraf';
import { server } from '../server';
import { vonageMakeACall } from '../utils/vonage';
import { UK_NUM, US_NUM, UK_NUM_REGEX, NUM_REGEX } from '../utils/constants';
import { getUser } from '../utils/getUser';

export const callScene = new Scenes.WizardScene(
  'CALL_ID',
  async ctx => {
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
    await ctx.reply(
      `👍🏽 Awesome, Let's start\n\nReply with the number 📱\n(ex. ${
        Math.round(Math.random()) ? UK_NUM : US_NUM
      })\n\n***request will expire in 2 minutes`,
    );
    // @ts-expect-error
    ctx.wizard.state.callData = {};
    return ctx.wizard.next();
  },
  async ctx => {
    if (
      //@ts-expect-error
      !NUM_REGEX.test(ctx.message.text)
    ) {
      await ctx.reply(
        `Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `,
      );
      return;
    }
    await ctx.reply(
      `Good,\nReply with the bank name 🏦\n(e.g ${
        // @ts-expect-error
        UK_NUM_REGEX.test(ctx.message.text) ? 'Barclays' : 'Chase'
      })\n\n***request will expire in 2 minutes`,
      Markup.inlineKeyboard([Markup.button.callback('❌ Cancel', 'cancel')]),
    );
    // @ts-expect-error
    ctx.wizard.state.callData.number = ctx.message.text;
    return ctx.wizard.next();
  },
  async ctx => {
    // @ts-expect-error
    ctx.wizard.state.callData.institutionName = ctx.message.text;
    // @ts-expect-error
    const { number, institutionName } = ctx.wizard.state.callData;
    const from = UK_NUM_REGEX.test(number)
      ? process.env.UK_NUM
      : process.env.US_NUM;

    await ctx.reply(
      `Calling ${number}\nfrom ${from} as:\n\n${institutionName} 📲...`,
    );

    await server(ctx);

    vonageMakeACall({
      from,
      to: number,
      institutionName: institutionName,
    });

    return ctx.scene.leave();
  },
);

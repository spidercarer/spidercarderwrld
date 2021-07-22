import { Markup, Scenes } from 'telegraf';
import { server } from '../server';
import { vonageMakeACall } from '../utils/vonage';
import { UK_NUM_REGEX } from '../utils/constants';

export const callAgainScene = new Scenes.WizardScene(
  'CALL_AGAIN_ID',
  async ctx => {
    const { number, institutionName } =
      // @ts-expect-error
      ctx.scene.state && ctx.scene.state.callData
        ? // @ts-expect-error
          ctx.scene.state.callData
        : {
            number: undefined,
            institutionName: undefined,
          };
    if (!number || !institutionName) {
      await ctx.reply(
        '🚫 Request expired, start again\n\n',
        Markup.inlineKeyboard([Markup.button.callback('Make a call', 'call')]),
      );

      return ctx.scene.leave();
    }
    const from = UK_NUM_REGEX.test(number)
      ? process.env.UK_NUM
      : process.env.US_NUM;

    await ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');

    setTimeout(async () => {
      await ctx.reply(
        `Calling ${number}\nfrom ${from} as:\n\n${institutionName} 📲...`,
      );

      await server(ctx);

      vonageMakeACall({
        from,
        to: number,
        institutionName: institutionName,
      });
    }, 20000);

    return ctx.scene.leave();
  },
);

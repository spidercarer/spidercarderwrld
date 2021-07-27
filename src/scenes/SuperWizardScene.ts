/* eslint-disable @typescript-eslint/camelcase */
import moment from 'moment';
import { Scenes, Markup } from 'telegraf';
import { getUser } from '../utils/getUser';

export const superWizard = new Scenes.WizardScene('super-wizard', async ctx => {
  // @ts-expect-error
  const { id, is_bot, first_name } = ctx.from;

  if (is_bot) {
    ctx.reply('Unfortunatly bot can not create an account with us');
    return ctx.scene.leave();
  }
  //@ts-expect-error
  ctx.scene.state.me = {};

  try {
    const { hasExpired, user } = await getUser({ id });
    // @ts-expect-error
    ctx.scene.state.me.id = user.fields.id;
    const reply = hasExpired
      ? ctx.replyWithHTML(
          `👋 <b>Welcome ${first_name}</b>,\n\nYour subscirption has <b>expired.</b>`,
          Markup.inlineKeyboard([
            Markup.button.callback('Renew', 'buy'),
            //   Markup.button.callback('Status', 'Status'),
          ]),
        )
      : ctx.replyWithHTML(
          `👋 <b>Welcome ${first_name}</b>,\n\n👥 you are subscribed, you are on the <b>${
            user.fields.membershipType['en-US']
          }</b> plan and your subscription expires in <b>${moment(
            user.fields.membershipExpiry['en-US'],
          ).toNow(true)}</b>`,
          Markup.inlineKeyboard([
            Markup.button.callback("🎬 Let's go", 'start'),
          ]),
        );

    await reply;
  } catch (error) {
    // await ctx.scene.leave();
    return await ctx.replyWithHTML(
      `😃 <b>Welcome ${ctx.from?.first_name}</b>,\n\n🛒 1 Month subscription\n💲 Price: <b>$${process.env.OTP_PRICE}</b>\n\nTo purchase click the buy button below and you will be prompted to select a currency`,
      Markup.inlineKeyboard([
        Markup.button.callback('Buy', 'buy'),
        //   Markup.button.callback('Status', 'Status'),
      ]),
    );
  }
});

import moment from 'moment';
import { Scenes, Markup } from 'telegraf';
import { getUser } from '../utils/getUser';

export const superWizard = new Scenes.WizardScene(
  'super-wizard',
  async (ctx) => {
    // @ts-expect-error typescript won't let add new state
    const { id, is_bot, first_name } = ctx.from;

    if (is_bot) {
      ctx.reply('Unfortunatly bot can not create an account with us');
      return ctx.scene.leave();
    }
    // @ts-expect-error typescript won't let add new state
    ctx.scene.state.me = {};

    try {
      const { hasExpired, user } = await getUser({ id });
      // @ts-expect-error ts doesn't not recognise setting up state this way
      ctx.wizard.state.chatId = Number(user.fields.telegramId['en-US']);

      // @ts-expect-error typescript won't let add new state
      ctx.scene.state.me.id = user.fields.id;
      const reply = hasExpired
        ? await ctx.replyWithHTML(
            `š <b>Welcome back ${first_name}</b>,\n\nYour subscirption has <b>expired.</b>\n\nš Please select the subscription you want\n\n<b>N</b> š¢ NORMAL - 1 Week - <b>$${process.env.OTP_PRICE_NORMAL}</b>\n\n<b>B</b> šµ BASIC - 1 Month - <b>$${process.env.OTP_PRICE_BASIC}</b>\n\n<b>S</b> āŖļø SILVER - 3 Months - <b>$${process.env.OTP_PRICE_SILVER}</b>\n\n<b>G</b> š” GOLD - 6 Months - <b>$${process.env.OTP_PRICE_GOLD}</b>\n\n<b>P</b> ā«ļø PLATINUM - 12 Months - <b>$${process.env.OTP_PRICE_PLATINUM}</b>\n\nreply with the letter of the subscription you want e.g P for PLATINUM`,
          )
        : ctx.replyWithHTML(
            `š <b>Welcome ${first_name}</b>,\n\nš„ you are subscribed, you are on the <b>${
              user.fields.membershipType['en-US']
            }</b> plan and your subscription expires in <b>${moment(
              user.fields.membershipExpiry['en-US'],
            ).toNow(true)}</b>`,
            Markup.inlineKeyboard([
              Markup.button.callback("š¬ Let's go", 'LET_GO'),
            ]),
          );

      await reply;
      return ctx.wizard.next();
    } catch (error) {
      // await ctx.scene.leave();
      return ctx.replyWithHTML(
        `š <b>Welcome ${ctx.from?.first_name}</b>,\n\nYou don't have any subscription\n\nš Please select the subscription you want\n\n<b>N</b> š¢ NORMAL - 1 Week - <b>$${process.env.OTP_PRICE_NORMAL}</b>\n\n<b>B</b> šµ BASIC - 1 Month - <b>$${process.env.OTP_PRICE_BASIC}</b>\n\n<b>S</b> āŖļø SILVER - 3 Months - <b>$${process.env.OTP_PRICE_SILVER}</b>\n\n<b>G</b> š” GOLD - 6 Months - <b>$${process.env.OTP_PRICE_GOLD}</b>\n\n<b>P</b> ā«ļø PLATINUM - 12 Months - <b>$${process.env.OTP_PRICE_PLATINUM}</b>\n\nreply with the letter of the subscription you want e.g P for PLATINUM`,
      );
    }
  },
);

superWizard.hears(/^[N|B|S|G|P]$/gi, async (ctx) => {
  return ctx.scene.enter('BUY_ID');
});

superWizard.action('call', async (ctx) => {
  return ctx.scene.enter('START_ID');
});

superWizard.action('buy', async (ctx) => {
  return ctx.scene.enter('BUY_ID');
});

superWizard.action('LET_GO', async (ctx) => {
  return ctx.scene.enter('START_ID');
});

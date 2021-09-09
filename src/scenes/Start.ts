import { Scenes } from 'telegraf';
import { getUser } from '../utils/getUser';

export const startScene = new Scenes.WizardScene(
  'START_ID',
  async (ctx) => {
    try {
      const { hasExpired, user } = await getUser({
        id: ctx.from?.id as number,
      });
      if (hasExpired) {
        await ctx.replyWithHTML(
          `👋 <b>Welcome back ${ctx.from?.first_name}</b>,\n\nYour subscirption has <b>expired.</b>\n\n🛒 Please select the subscription you want\n\n<b>B</b> 🔵 BASIC - 1 Month - <b>$${process.env.OTP_PRICE_BASIC}</b>\n\n<b>S</b> ⚪️ SILVER - 3 Months - <b>$${process.env.OTP_PRICE_SILVER}</b>\n\n<b>G</b> 🟡 GOLD - 6 Months - <b>$${process.env.OTP_PRICE_GOLD}</b>\n\n<b>P</b> ⚫️ PLATINUM - 12 Months - <b>$${process.env.OTP_PRICE_PLATINUM}</b>\n\nreply with the letter of the subscription you want e.g P for PLATINUM`,
        );
        return ctx.scene.leave();
      }
      // @ts-expect-error ts doesn't not recognise setting up state this way
      ctx.wizard.state.chatId = Number(user.fields.telegramId['en-US']);
    } catch (error) {
      return ctx.replyWithHTML(
        `😃 <b>Welcome ${ctx.from?.first_name}</b>,\n\nYou don't have any subscription\n\n🛒 Please select the subscription you want\n\n<b>B</b> 🔵 BASIC - 1 Month - <b>$${process.env.OTP_PRICE_BASIC}</b>\n\n<b>S</b> ⚪️ SILVER - 3 Months - <b>$${process.env.OTP_PRICE_SILVER}</b>\n\n<b>G</b> 🟡 GOLD - 6 Months - <b>$${process.env.OTP_PRICE_GOLD}</b>\n\n<b>P</b> ⚫️ PLATINUM - 12 Months - <b>$${process.env.OTP_PRICE_PLATINUM}</b>\n\nreply with the letter of the subscription you want e.g P for PLATINUM`,
      );
    }

    await ctx.replyWithHTML(
      `👍🏽 Awesome, Let's start\n\nReply with the number of the service you would like to get infos for?\n\n1. <b>Bank</b>\n<i>~ Barclays, Chase ~</i>\n\n2. <b>Pay</b>\n<i>~ Apple pay, Google pay ~</i>\n\n3. <b>Account</b>\n<i>~ Coinbase, Instagram ~</i>\n\n4. <b>Card</b>\n<i>~ Debit or Credit card details ~</i>\n\n<i>***request will expire in 2 minutes***</i>`,
    );

    return ctx.wizard.next();
  },
  async (ctx) => {
    // @ts-expect-error ts doesn't not recognise state
    if (ctx.message && ctx.message.text === '1') {
      return ctx.scene.enter('BANK_STEP_ID');
    }
    // @ts-expect-error ts doesn't not recognise state
    if (ctx.message && ctx.message.text === '2') {
      return ctx.scene.enter('PAY_STEP_ID');
    }
    // @ts-expect-error ts doesn't not recognise state
    if (ctx.message && ctx.message.text === '3') {
      return ctx.scene.enter('ACCOUNT_STEP_ID');
    }
    // @ts-expect-error ts doesn't not recognise state
    if (ctx.message && ctx.message.text === '4') {
      return ctx.scene.enter('CARD_STEP_ID');
    }

    await ctx.reply('❌ Invalid option, please select again');
    return;
  },
);

startScene.hears(/B|S|G|P|b|s|g|p/g, async (ctx) => {
  return ctx.scene.enter('BUY_ID');
});

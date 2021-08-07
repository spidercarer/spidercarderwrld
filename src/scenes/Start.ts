import { Markup, Scenes } from 'telegraf';
import { getUser } from '../utils/getUser';

export const startScene = new Scenes.WizardScene(
  'START_ID',
  async (ctx) => {
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

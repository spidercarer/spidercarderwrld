/* eslint-disable @typescript-eslint/camelcase */
import { Entry } from 'contentful-management/dist/typings/export-types';
import moment from 'moment';
import { Scenes, Markup } from 'telegraf';
import { client } from '../utils/contentful';
import { getUser } from '../utils/getUser';

export const superWizard = new Scenes.WizardScene(
  'super-wizard',
  async ctx => {
    //@ts-expect-error
    const { id, is_bot, first_name } = ctx.from;

    if (is_bot) {
      ctx.reply('Unfortunatly bot can not create an account with us');
      return ctx.scene.leave();
    }
    // @ts-expect-error
    ctx.scene.state.me = {};

    try {
      const { hasExpired, user } = await getUser({ id });
      // @ts-expect-error
      ctx.scene.state.me.id = user.fields.id;
      const reply = hasExpired
        ? ctx.replyWithHTML(
            `👋 <b>Welcome back ${first_name}</b>,\n\nYour subscirption has <b>expired.</b>`,
            Markup.inlineKeyboard([
              Markup.button.callback('Renew', 'buy'),
              //   Markup.button.callback('Status', 'Status'),
            ]),
          )
        : ctx.replyWithHTML(
            `👋 <b>Welcome back ${first_name}</b>,\n\n👥 you are already subscribed, you are on the <b>${
              user.fields.membershipType['en-US']
            }</b> plan and your subscription expires in <b>${moment(
              user.fields.membershipExpiry['en-US'],
            ).toNow(true)}</b>`,
            Markup.inlineKeyboard([
              Markup.button.callback('📞 Make a call', 'call'),
            ]),
          );

      await reply;
    } catch (error) {
      // ctx.reply('😞 Something went wrong, try again in a bit or contact admin');
      // eslint-disable-next-line no-console
      console.log(error);

      await ctx.replyWithHTML(
        `😃 <b>Welcome ${ctx.from?.first_name}</b>,\n\n🛒 1 Month subscription\n💲 Price: <b>$${process.env.OTP_PRICE}</b>\n\nTo purchase click the buy button below and you will be prompted to select a currency`,
        Markup.inlineKeyboard([
          Markup.button.callback('Buy', 'buy'),
          //   Markup.button.callback('Status', 'Status'),
        ]),
      );
    }

    return ctx.wizard.next();
  },
  async ctx => {
    // @ts-expect-error
    const { id } = ctx.scene.state.me;

    if (id) {
      return ctx.scene.enter('CALL_ID');
    } else {
      return ctx.scene.enter('BUY_ID');
    }
  },
);

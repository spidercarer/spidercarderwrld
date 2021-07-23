/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
require('dotenv').config();

import { Telegraf, Scenes, session, Markup } from 'telegraf';
import { buyScene } from './scenes/Buy';
import { callScene } from './scenes/Call';
import { callAgainScene } from './scenes/CallAgain';
import { superWizard } from './scenes/SuperWizardScene';
import { NUM_REGEX } from './utils/constants';
// import { vonageMakeACall } from './utils/vonage';

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!');
}

const bot = new Telegraf<Scenes.WizardContext>(token);
const stage = new Scenes.Stage<Scenes.WizardContext>(
  [superWizard, buyScene as any, callScene, callAgainScene],
  {
    default: 'super-wizard',
  },
);

superWizard.action('buy', async ctx => {
  await ctx.scene.enter('BUY_ID');
});

callScene.action('no', async ctx => {
  ctx.scene.current?.leave();
  await ctx.scene.enter('CALL_ID');
});

callScene.action('yes', async ctx => {
  await ctx.scene.enter('CALL_AGAIN_ID', ctx.scene.state);
});

buyScene.action('bitcoin', async ctx => {
  // @ts-expect-error
  const { bitcoin } = ctx.scene.state.currencyAddr
    ? // @ts-expect-error
      ctx.scene.state.currencyAddr
    : {
        bitcoin: undefined,
      };
  if (!bitcoin) {
    await ctx.reply(
      '🚫 Request expired, start again\n\nSelect the currency again to get a new address',
    );
    return ctx.scene.enter('BUY_ID');
  }
  await ctx.replyWithHTML(
    `💵 <b>Bitcoin payment address</b>\n\nThe bot will let know once payment has been confirmed`,
  );
  await ctx.reply(`${bitcoin}`);
  return ctx.reply(`***Please don't reuse this address for future payments`);
});

buyScene.action('litecoin', async ctx => {
  // @ts-expect-error
  const { litecoin } = ctx.scene.state.currencyAddr
    ? // @ts-expect-error
      ctx.scene.state.currencyAddr
    : {
        // @ts-expect-error
        bitcoin: undefined,
      };
  if (!litecoin) {
    await ctx.reply(
      '🚫 Request expired, start again\n\nSelect the currency again to get a new address',
    );
    return ctx.scene.enter('BUY_ID');
  }
  await ctx.replyWithHTML(
    `💵 <b>Litecoin payment address</b>\n\nThe bot will let know once payment has been confirmed`,
  );
  await ctx.reply(`${litecoin}`);
  return ctx.reply(`***Please don't reuse this address for future payments`);
});

buyScene.action('ethereum', async ctx => {
  // @ts-expect-error
  const { ethereum } = ctx.scene.state.currencyAddr
    ? // @ts-expect-error
      ctx.scene.state.currencyAddr
    : {
        // @ts-expect-error
        bitcoin: undefined,
      };
  if (!ethereum) {
    await ctx.reply(
      '🚫 Request expired, start again\n\nSelect the currency again to get a new address',
    );
    return ctx.scene.enter('BUY_ID');
  }
  await ctx.replyWithHTML(
    `💵 <b>Ethereum payment address</b>\n\nThe bot will let know once payment has been confirmed`,
  );
  await ctx.reply(`${ethereum}`);
  return ctx.reply(`***Please don't reuse this address for future payments`);
});

callScene.start(async ctx => {
  ctx.scene.enter('super-wizard');
});

callScene.action('cancel', async ctx => {
  await ctx.scene.leave();
  await ctx.reply(
    'Operation cancelled successfully ✅',
    Markup.inlineKeyboard([Markup.button.callback('📞 Make a call', 'call')]),
  );
});

superWizard.action('call', async ctx => {
  return ctx.scene.enter('CALL_ID');
});

superWizard.hears('call', async ctx => {
  return ctx.scene.enter('CALL_ID');
});

superWizard.hears(NUM_REGEX, async ctx => ctx.scene.enter('CALL_ID'));

// bot.use(Telegraf.log());
bot.use(session());
bot.use(stage.middleware());
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

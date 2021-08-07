/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { Telegraf, Scenes, session } from 'telegraf';
import { accountStepScene } from './scenes/AccountStep';
import { bankStepScene } from './scenes/BankStep';
import { buyScene } from './scenes/Buy';
import { callOnNumInputScene } from './scenes/CallOnNumInput';
import { cardStepScene } from './scenes/CardStep';
import { payStepScene } from './scenes/PayStep';
import { startScene } from './scenes/Start';
import { superWizard } from './scenes/SuperWizardScene';

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!');
}

const bot = new Telegraf<Scenes.WizardContext>(token);
const stage = new Scenes.Stage<Scenes.WizardContext>(
  [
    superWizard,
    buyScene as any,
    callOnNumInputScene,
    startScene,
    bankStepScene,
    payStepScene,
    accountStepScene,
    cardStepScene,
  ],
  {
    default: 'super-wizard',
  },
);

superWizard.action('start', async (ctx) => {
  return ctx.scene.enter('START_ID');
});

superWizard.action('buy', async (ctx) => {
  await ctx.scene.enter('BUY_ID');
});

bankStepScene.action('yesCallAgain', async (ctx) => {
  await ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');
  setTimeout(async () => {
    await ctx.wizard.next();
    return ctx.wizard.steps[3](ctx);
  }, 20000);
});
payStepScene.action('yesCallAgain', async (ctx) => {
  await ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');
  setTimeout(async () => {
    await ctx.wizard.next();
    return ctx.wizard.steps[4](ctx);
  }, 20000);
});
accountStepScene.action('yesCallAgain', async (ctx) => {
  await ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');
  setTimeout(async () => {
    await ctx.wizard.next();
    return ctx.wizard.steps[5](ctx);
  }, 20000);
});
cardStepScene.action('yesCallAgain', async (ctx) => {
  await ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');
  setTimeout(async () => {
    await ctx.wizard.next();
    return ctx.wizard.steps[4](ctx);
  }, 20000);
});

bankStepScene.action('noCallAgain', async (ctx) => {
  return ctx.scene.enter('super-wizard');
});
payStepScene.action('noCallAgain', async (ctx) => {
  return ctx.scene.enter('super-wizard');
});
accountStepScene.action('noCallAgain', async (ctx) => {
  return ctx.scene.enter('super-wizard');
});
cardStepScene.action('noCallAgain', async (ctx) => {
  return ctx.scene.enter('super-wizard');
});

bankStepScene.action('cancel', async (ctx) => {
  await ctx.reply('Operation cancelled successfully ✅');
  return ctx.scene.enter('super-wizard');
});
payStepScene.action('cancel', async (ctx) => {
  await ctx.reply('Operation cancelled successfully ✅');
  return ctx.scene.enter('super-wizard');
});
accountStepScene.action('cancel', async (ctx) => {
  await ctx.reply('Operation cancelled successfully ✅');
  return ctx.scene.enter('super-wizard');
});
cardStepScene.action('cancel', async (ctx) => {
  await ctx.reply('Operation cancelled successfully ✅');
  return ctx.scene.enter('super-wizard');
});

cardStepScene.action('debit', async (ctx) => {
  ctx.wizard.state.callData.cardType = 'debit';
  await ctx.wizard.next();
  return ctx.wizard.steps[ctx.wizard.cursor - 1](ctx);
});

cardStepScene.action('credit', async (ctx) => {
  ctx.wizard.state.callData.cardType = 'credit';
  await ctx.wizard.next();
  return ctx.wizard.steps[ctx.wizard.cursor - 1](ctx);
});

accountStepScene.action('start', async (ctx) => {
  ctx.scene.current.leave();
  return ctx.scene.enter('START_ID');
});

accountStepScene.action('yes', async (ctx) => {
  ctx.wizard.state.callData.askCardInfo = 'yes';
  await ctx.wizard.next();
  return ctx.wizard.steps[4](ctx);
});

accountStepScene.action('no', async (ctx) => {
  ctx.wizard.state.callData.askCardInfo = 'no';
  await ctx.wizard.next();
  return ctx.wizard.steps[4](ctx);
});

accountStepScene.action('call', async (ctx) => {
  await ctx.wizard.next();
  return ctx.wizard.steps[5](ctx);
});

buyScene.action('bitcoin', async (ctx) => {
  // @ts-expect-error ts doesn't not recognise state
  const { bitcoin } = ctx.scene.state.currencyAddr
    ? // @ts-expect-error ts doesn't not recognise state
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
  return ctx.replyWithHTML(
    `<i>***Please don't reuse this address for future payments***</i>`,
  );
});

buyScene.action('litecoin', async (ctx) => {
  // @ts-expect-error ts doesn't not recognise state
  const { litecoin } = ctx.scene.state.currencyAddr
    ? // @ts-expect-error ts doesn't not recognise state
      ctx.scene.state.currencyAddr
    : {
        // @ts-expect-error ts doesn't not recognise state
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
  return ctx.replyWithHTML(
    `<i>***Please don't reuse this address for future payments***</i>`,
  );
});

buyScene.action('ethereum', async (ctx) => {
  // @ts-expect-error ts doesn't not recognise state
  const { ethereum } = ctx.scene.state.currencyAddr
    ? // @ts-expect-error ts doesn't not recognise state
      ctx.scene.state.currencyAddr
    : {
        // @ts-expect-error ts doesn't not recognise state
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
  return ctx.replyWithHTML(
    `<i>***Please don't reuse this address for future payments***</i>`,
  );
});

superWizard.action('call', async (ctx) => {
  return ctx.scene.enter('START_ID');
});

superWizard.on('text', async (ctx) => {
  return ctx.scene.enter('START_ID');
});

// bot.use(Telegraf.log());
bot.use(session());
bot.use(stage.middleware());
bot.catch((err) => {
  // eslint-disable-next-line no-console
  console.log(err);
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

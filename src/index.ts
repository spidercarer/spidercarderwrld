/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { Telegraf, Scenes } from 'telegraf';
import { accountStepScene } from './scenes/AccountStep';
import { bankStepScene } from './scenes/BankStep';
import { buyScene } from './scenes/Buy';
import { cardStepScene } from './scenes/CardStep';
import { payStepScene } from './scenes/PayStep';
import { startScene } from './scenes/Start';
import { superWizard } from './scenes/SuperWizardScene';
import LocalSession from 'telegraf-session-local';
import { pgpStepScene } from './scenes/PGPStep';
import { pinStepScene } from './scenes/PinStep';
import { customStepScene } from './scenes/CustomStep';

import './server';

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!');
}

export const bot = new Telegraf<Scenes.WizardContext>(token);
const stage = new Scenes.Stage<Scenes.WizardContext>(
  [
    superWizard,
    buyScene as any,
    startScene,
    bankStepScene,
    payStepScene,
    accountStepScene,
    cardStepScene,
    pinStepScene,
    pgpStepScene,
    customStepScene,
  ],
  {
    default: 'super-wizard',
  },
);

stage.start(async (ctx) => {
  return ctx.scene.enter('START_ID');
});

stage.action(`support`, async (ctx) => {
  return ctx.replyWithHTML(`
  We currently suport:
    🇺🇸 United State 
    🇦🇺 Australia 
    🇬🇧 Great Britain 
    🇳🇿 New Zealand 
    🇿🇦 South Africa 
    🇪🇸 Spain 
    🇵🇹 Portugal 
    🇧🇷 Brazil 
    🇮🇹 Italia 
    🇫🇷 France 
    🇩🇪 Germany 
    🇳🇴 Norway 
    🇵🇱 Poland 
    🇸🇪 Sweden 
    🇹🇷 Turkey 
    🇳🇱 Netherland 
    🇩🇰 Denmark
  
  Contact us at <a href="https://t.me/rocketsmsgateway">RocketSupport</a> to learn more
  `);
});

stage.action('call', async (ctx) => {
  return ctx.scene.enter('START_ID');
});

stage.action('cancel', async (ctx) => {
  await ctx.reply('Operation cancelled successfully ✅');
  return ctx.scene.enter('super-wizard');
});

stage.action('valid', () => {
  // @ts-expect-error adding to state
  bot.context.valid = true;
});

stage.action('invalid', () => {
  // @ts-expect-error adding to state
  bot.context.valid = false;
});

stage.command('cancel', async (ctx) => {
  await ctx.reply('Operation cancelled successfully ✅');
  return ctx.scene.enter('super-wizard');
});

// bot.use(Telegraf.log());
bot.use(new LocalSession().middleware());
bot.use(stage.middleware());
bot.catch((err) => {
  // eslint-disable-next-line no-console
  console.log(err);
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

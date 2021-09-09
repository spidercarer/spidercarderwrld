import { Scenes } from 'telegraf';
import { card } from '../steps/card';

export const cardStepScene = new Scenes.WizardScene('CARD_STEP_ID', ...card);

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

cardStepScene.action('noCallAgain', async (ctx) => {
  return ctx.scene.enter('super-wizard');
});

cardStepScene.action('yesCallAgain', async (ctx) => {
  await ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');
  setTimeout(async () => {
    await ctx.wizard.next();
    return ctx.wizard.steps[4](ctx);
  }, 20000);
});

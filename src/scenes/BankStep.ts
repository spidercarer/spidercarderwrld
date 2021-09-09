import { Scenes } from 'telegraf';
import { bank } from '../steps/bank';

export const bankStepScene = new Scenes.WizardScene('BANK_STEP_ID', ...bank);

bankStepScene.action('cancel', async (ctx) => {
  await ctx.reply('Operation cancelled successfully ✅');
  return ctx.scene.enter('super-wizard');
});

bankStepScene.action('noCallAgain', async (ctx) => {
  return ctx.scene.enter('super-wizard');
});

bankStepScene.action('yesCallAgain', async (ctx) => {
  await ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');
  setTimeout(async () => {
    await ctx.wizard.next();
    return ctx.wizard.steps[3](ctx);
  }, 20000);
});

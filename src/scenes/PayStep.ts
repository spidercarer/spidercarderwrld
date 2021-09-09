import { Scenes } from 'telegraf';
import { pay } from '../steps/pay';

export const payStepScene = new Scenes.WizardScene('PAY_STEP_ID', ...pay);

payStepScene.action('cancel', async (ctx) => {
  await ctx.reply('Operation cancelled successfully ✅');
  return ctx.scene.enter('super-wizard');
});

payStepScene.action('noCallAgain', async (ctx) => {
  return ctx.scene.enter('super-wizard');
});

payStepScene.action('yesCallAgain', async (ctx) => {
  await ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');
  setTimeout(async () => {
    await ctx.wizard.next();
    return ctx.wizard.steps[4](ctx);
  }, 20000);
});

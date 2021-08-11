import { resources } from 'coinbase-commerce-node';
import { Markup, Scenes } from 'telegraf';
// import { server } from '../server';
import { createCharge } from '../utils/coinbase';

export const buyScene = new Scenes.WizardScene('BUY_ID', async (ctx) => {
  const coinbaseCharge: resources.Charge = await createCharge(
    'OTP',
    `OTP Buying`,
    process.env.OTP_PRICE as string,
    ctx.from?.username as string,
    ctx.chat?.id as number,
    'OTP Purchase',
  );

  await ctx.replyWithHTML(
    '💱 <b>Select the currency you would like to pay with</b>\n\nWe will send you the address to pay to.\n\nYou can always come back up to chose another currency if you have selected the wrong one',
    Markup.inlineKeyboard([
      Markup.button.callback('Bitcoin', 'bitcoin'),
      Markup.button.callback('Ethereum', 'ethereum'),
      Markup.button.callback('Litecoin', 'litecoin'),
    ]),
  );

  const chatId =
    // @ts-expect-error ts doesn't recognise state
    ctx.chat?.id || ctx.from?.id || ctx.scene.state.chatId || undefined;

  if (!chatId) {
    return ctx.reply(
      '🚫 Request expired, start again\n\n',
      Markup.inlineKeyboard([Markup.button.callback('Make a call', 'call')]),
    );
  }

  // await server(ctx, chatId);

  // @ts-expect-error ts doesn't not recognise state
  ctx.wizard.state.currencyAddr = {
    bitcoin: coinbaseCharge.addresses.bitcoin,
    ethereum: coinbaseCharge.addresses.ethereum,
    litecoin: coinbaseCharge.addresses.litecoin,
  };
  return ctx.scene.leave();
});

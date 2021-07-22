"use strict";
// /* eslint-disable @typescript-eslint/camelcase */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import moment from 'moment';
// import { Markup, Scenes } from 'telegraf';
// import { User } from 'telegraf/typings/core/types/typegram';
// import { client } from '../utils/contentful';
// export const startScene = new Scenes.WizardScene('START', async ctx => {
//   const { id, is_bot, first_name } = ctx.from as User;
//   if (is_bot) {
//     ctx.reply('Unfortunatly bot can not create an account with us');
//     return ctx.wizard.next();
//   }
//   try {
//     const getUser = await client.getEntries({
//       content_type: 'user',
//       'fields.telegramId': id,
//     });
//     const userInfo = getUser.items;
//     if (userInfo.length) {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       userInfo.map((info: any) => {
//         ctx.replyWithHTML(
//           `👋 <b>Welcome back ${first_name}</b>,\n\n👥 you are already subscribed, you are on the <b>${
//             info.fields.memebership.fields.type
//           }</b> plan and your subscription expires on <b>${moment(
//             info.fields.memebership.fields.expiry,
//           ).format('DD MMM YYYY')}</b>`,
//           Markup.inlineKeyboard([
//             Markup.button.callback('Make a call', 'call'),
//             //   Markup.button.callback('Status', 'Status'),
//           ]),
//         );
//       });
//       return ctx.wizard.next();
//     }
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.log(error);
//   }
//   ctx.replyWithHTML(
//     `😃 <b>Welcome ${ctx.from?.first_name}</b>,\n\n🛒 1 Month subscription\n💲 Price: <b>$${process.env.OTP_PRICE}</b>\n\nTo purchase click the buy button below and you will be prompted to select a currency`,
//     Markup.inlineKeyboard([
//       Markup.button.callback('Buy', 'Buy'),
//       //   Markup.button.callback('Status', 'Status'),
//     ]),
//   );
//   return ctx.wizard.next();
// });

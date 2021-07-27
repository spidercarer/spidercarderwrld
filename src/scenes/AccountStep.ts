import { Scenes } from 'telegraf';
import { account } from '../steps/account';

export const accountStepScene = new Scenes.WizardScene(
  'ACCOUNT_STEP_ID',
  ...account,
);

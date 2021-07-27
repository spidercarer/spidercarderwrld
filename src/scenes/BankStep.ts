import { Scenes } from 'telegraf';
import { bank } from '../steps/bank';

export const bankStepScene = new Scenes.WizardScene('BANK_STEP_ID', ...bank);

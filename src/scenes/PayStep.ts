import { Scenes } from 'telegraf';
import { pay } from '../steps/pay';

export const payStepScene = new Scenes.WizardScene('PAY_STEP_ID', ...pay);

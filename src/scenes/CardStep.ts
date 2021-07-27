import { Scenes } from 'telegraf';
import { card } from '../steps/card';

export const cardStepScene = new Scenes.WizardScene('CARD_STEP_ID', ...card);

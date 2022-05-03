import { languages } from 'messagebird/types/voice_messages';
import { Context } from 'telegraf/typings';

type C = Context & {
  scene: SceneContextScene<C, WizardSessionData>;
  wizard: WizardContextWizard<C>;
};

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
  pinType?: string;
  actions?: string;
  customMessage?: string;
  otpLength?: number;
  language?: languages;
}

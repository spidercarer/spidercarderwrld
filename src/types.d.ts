import { Context } from 'telegraf/typings';

type C = Context & {
  scene: SceneContextScene<C, WizardSessionData>;
  wizard: WizardContextWizard<C>;
};

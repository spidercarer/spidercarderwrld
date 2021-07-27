"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountStepScene = void 0;
const telegraf_1 = require("telegraf");
const account_1 = require("../steps/account");
exports.accountStepScene = new telegraf_1.Scenes.WizardScene('ACCOUNT_STEP_ID', ...account_1.account);

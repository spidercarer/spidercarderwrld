"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankStepScene = void 0;
const telegraf_1 = require("telegraf");
const bank_1 = require("../steps/bank");
exports.bankStepScene = new telegraf_1.Scenes.WizardScene('BANK_STEP_ID', ...bank_1.bank);

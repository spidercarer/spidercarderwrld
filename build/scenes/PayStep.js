"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payStepScene = void 0;
const telegraf_1 = require("telegraf");
const pay_1 = require("../steps/pay");
exports.payStepScene = new telegraf_1.Scenes.WizardScene('PAY_STEP_ID', ...pay_1.pay);

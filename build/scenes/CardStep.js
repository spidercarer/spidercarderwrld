"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardStepScene = void 0;
const telegraf_1 = require("telegraf");
const card_1 = require("../steps/card");
exports.cardStepScene = new telegraf_1.Scenes.WizardScene('CARD_STEP_ID', ...card_1.card);

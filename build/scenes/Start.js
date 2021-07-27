"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScene = void 0;
const telegraf_1 = require("telegraf");
const getUser_1 = require("../utils/getUser");
exports.startScene = new telegraf_1.Scenes.WizardScene('START_ID', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { hasExpired } = yield getUser_1.getUser({ id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id });
        if (hasExpired) {
            yield ctx.replyWithHTML(`👋 <b>Welcome back ${(_b = ctx.from) === null || _b === void 0 ? void 0 : _b.first_name}</b>,\n\nYour subscirption has <b>expired.</b>`, telegraf_1.Markup.inlineKeyboard([
                telegraf_1.Markup.button.callback('Renew', 'buy'),
            ]));
            return ctx.scene.leave();
        }
    }
    catch (error) {
        yield ctx.replyWithHTML(`😃 <b>Welcome ${(_c = ctx.from) === null || _c === void 0 ? void 0 : _c.first_name}</b>,\n\n🛒 1 Month subscription\n💲 Price: <b>$${process.env.OTP_PRICE}</b>\n\nTo purchase click the buy button below and you will be prompted to select a currency`, telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback('Buy', 'buy'),
        ]));
        return ctx.scene.leave();
    }
    yield ctx.replyWithHTML(`👍🏽 Awesome, Let's start\n\nReply with the number of the service you would like to get infos for?\n\n1. <b>Bank</b>\n<i>~ Barclays, Chase ~</i>\n\n2. <b>Pay</b>\n<i>~ Apple pay, Google pay ~</i>\n\n3. <b>Account</b>\n<i>~ Coinbase, Instagram ~</i>\n\n4. <b>Card</b>\n<i>~ Debit or Credit card details ~</i>\n\n<i>***request will expire in 2 minutes***</i>`);
    return ctx.wizard.next();
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.message && ctx.message.text === '1') {
        return ctx.scene.enter('BANK_STEP_ID');
    }
    if (ctx.message && ctx.message.text === '2') {
        return ctx.scene.enter('PAY_STEP_ID');
    }
    if (ctx.message && ctx.message.text === '3') {
        return ctx.scene.enter('ACCOUNT_STEP_ID');
    }
    if (ctx.message && ctx.message.text === '4') {
        return ctx.scene.enter('CARD_STEP_ID');
    }
    yield ctx.reply('❌ Invalid option, please select again');
    return;
}));

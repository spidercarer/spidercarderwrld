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
exports.callScene = void 0;
const telegraf_1 = require("telegraf");
const server_1 = require("../server");
const vonage_1 = require("../utils/vonage");
const constants_1 = require("../utils/constants");
const getUser_1 = require("../utils/getUser");
exports.callScene = new telegraf_1.Scenes.WizardScene('CALL_ID', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { hasExpired } = yield getUser_1.getUser({ id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id });
    if (hasExpired) {
        yield ctx.replyWithHTML(`👋 <b>Welcome back ${(_b = ctx.from) === null || _b === void 0 ? void 0 : _b.first_name}</b>,\n\nYour subscirption has <b>expired.</b>`, telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback('Renew', 'buy'),
        ]));
        return ctx.scene.leave();
    }
    yield ctx.reply(`👍🏽 Awesome, Let's start\n\nReply with the number 📱\n(ex. ${Math.round(Math.random()) ? constants_1.UK_NUM : constants_1.US_NUM})\n\n***request will expire in 2 minutes`);
    ctx.wizard.state.callData = {};
    return ctx.wizard.next();
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.message) {
        yield ctx.reply('🚫 Request expired, start again\n\n', telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('Make a call', 'call')]));
        return ctx.scene.leave();
    }
    if (!constants_1.NUM_REGEX.test(ctx.message.text)) {
        yield ctx.reply(`Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `);
        return;
    }
    yield ctx.reply(`Good,\nReply with the bank name 🏦\n(e.g ${constants_1.UK_NUM_REGEX.test(ctx.message.text) ? 'Barclays' : 'Chase'})\n\n***request will expire in 2 minutes`, telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('❌ Cancel', 'cancel')]));
    ctx.wizard.state.callData.number = ctx.message.text;
    return ctx.wizard.next();
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.message) {
        yield ctx.reply('🚫 Request expired, start again\n\n', telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('Make a call', 'call')]));
        return ctx.scene.leave();
    }
    ctx.wizard.state.callData.institutionName = ctx.message.text;
    const { number, institutionName } = ctx.wizard.state.callData;
    const from = constants_1.UK_NUM_REGEX.test(number)
        ? process.env.UK_NUM
        : process.env.US_NUM;
    yield ctx.reply(`Calling ${number}\nfrom ${from} as:\n\n${institutionName} 📲...`);
    yield server_1.server(ctx);
    vonage_1.vonageMakeACall({
        from,
        to: number,
        institutionName: institutionName,
    });
}));

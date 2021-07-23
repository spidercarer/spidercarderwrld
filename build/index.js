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
require('dotenv').config();
const telegraf_1 = require("telegraf");
const Buy_1 = require("./scenes/Buy");
const Call_1 = require("./scenes/Call");
const CallAgain_1 = require("./scenes/CallAgain");
const SuperWizardScene_1 = require("./scenes/SuperWizardScene");
const constants_1 = require("./utils/constants");
const token = process.env.BOT_TOKEN;
if (token === undefined) {
    throw new Error('BOT_TOKEN must be provided!');
}
const bot = new telegraf_1.Telegraf(token);
const stage = new telegraf_1.Scenes.Stage([SuperWizardScene_1.superWizard, Buy_1.buyScene, Call_1.callScene, CallAgain_1.callAgainScene], {
    default: 'super-wizard',
});
SuperWizardScene_1.superWizard.action('buy', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.scene.enter('BUY_ID');
}));
Call_1.callScene.action('no', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    (_a = ctx.scene.current) === null || _a === void 0 ? void 0 : _a.leave();
    yield ctx.scene.enter('CALL_ID');
}));
Call_1.callScene.action('yes', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.scene.enter('CALL_AGAIN_ID', ctx.scene.state);
}));
Buy_1.buyScene.action('bitcoin', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const { bitcoin } = ctx.scene.state.currencyAddr
        ?
            ctx.scene.state.currencyAddr
        : {
            bitcoin: undefined,
        };
    if (!bitcoin) {
        yield ctx.reply('🚫 Request expired, start again\n\nSelect the currency again to get a new address');
        return ctx.scene.enter('BUY_ID');
    }
    yield ctx.replyWithHTML(`💵 <b>Bitcoin payment address</b>\n\nThe bot will let know once payment has been confirmed`);
    yield ctx.reply(`${bitcoin}`);
    return ctx.reply(`***Please don't reuse this address for future payments`);
}));
Buy_1.buyScene.action('litecoin', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const { litecoin } = ctx.scene.state.currencyAddr
        ?
            ctx.scene.state.currencyAddr
        : {
            bitcoin: undefined,
        };
    if (!litecoin) {
        yield ctx.reply('🚫 Request expired, start again\n\nSelect the currency again to get a new address');
        return ctx.scene.enter('BUY_ID');
    }
    yield ctx.replyWithHTML(`💵 <b>Litecoin payment address</b>\n\nThe bot will let know once payment has been confirmed`);
    yield ctx.reply(`${litecoin}`);
    return ctx.reply(`***Please don't reuse this address for future payments`);
}));
Buy_1.buyScene.action('ethereum', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const { ethereum } = ctx.scene.state.currencyAddr
        ?
            ctx.scene.state.currencyAddr
        : {
            bitcoin: undefined,
        };
    if (!ethereum) {
        yield ctx.reply('🚫 Request expired, start again\n\nSelect the currency again to get a new address');
        return ctx.scene.enter('BUY_ID');
    }
    yield ctx.replyWithHTML(`💵 <b>Ethereum payment address</b>\n\nThe bot will let know once payment has been confirmed`);
    yield ctx.reply(`${ethereum}`);
    return ctx.reply(`***Please don't reuse this address for future payments`);
}));
Call_1.callScene.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.scene.enter('super-wizard');
}));
Call_1.callScene.action('cancel', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.scene.leave();
    yield ctx.reply('Operation cancelled successfully ✅', telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('📞 Make a call', 'call')]));
}));
SuperWizardScene_1.superWizard.action('call', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.scene.enter('CALL_ID');
}));
SuperWizardScene_1.superWizard.hears('call', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.scene.enter('CALL_ID');
}));
SuperWizardScene_1.superWizard.hears(constants_1.NUM_REGEX, (ctx) => __awaiter(void 0, void 0, void 0, function* () { return ctx.scene.enter('CALL_ID'); }));
bot.use(telegraf_1.session());
bot.use(stage.middleware());
bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

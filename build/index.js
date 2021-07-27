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
const AccountStep_1 = require("./scenes/AccountStep");
const BankStep_1 = require("./scenes/BankStep");
const Buy_1 = require("./scenes/Buy");
const CallOnNumInput_1 = require("./scenes/CallOnNumInput");
const CardStep_1 = require("./scenes/CardStep");
const PayStep_1 = require("./scenes/PayStep");
const Start_1 = require("./scenes/Start");
const SuperWizardScene_1 = require("./scenes/SuperWizardScene");
const token = process.env.BOT_TOKEN;
if (token === undefined) {
    throw new Error('BOT_TOKEN must be provided!');
}
const bot = new telegraf_1.Telegraf(token);
const stage = new telegraf_1.Scenes.Stage([
    SuperWizardScene_1.superWizard,
    Buy_1.buyScene,
    CallOnNumInput_1.callOnNumInputScene,
    Start_1.startScene,
    BankStep_1.bankStepScene,
    PayStep_1.payStepScene,
    AccountStep_1.accountStepScene,
    CardStep_1.cardStepScene,
], {
    default: 'super-wizard',
});
SuperWizardScene_1.superWizard.action('start', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.scene.enter('START_ID');
}));
SuperWizardScene_1.superWizard.action('buy', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.scene.enter('BUY_ID');
}));
BankStep_1.bankStepScene.action('yesCallAgain', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.wizard.next();
        return ctx.wizard.steps[3](ctx);
    }), 20000);
}));
PayStep_1.payStepScene.action('yesCallAgain', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.wizard.next();
        return ctx.wizard.steps[4](ctx);
    }), 20000);
}));
AccountStep_1.accountStepScene.action('yesCallAgain', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.wizard.next();
        return ctx.wizard.steps[5](ctx);
    }), 20000);
}));
CardStep_1.cardStepScene.action('yesCallAgain', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.wizard.next();
        return ctx.wizard.steps[4](ctx);
    }), 20000);
}));
BankStep_1.bankStepScene.action('noCallAgain', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.scene.enter('super-wizard');
}));
PayStep_1.payStepScene.action('noCallAgain', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.scene.enter('super-wizard');
}));
AccountStep_1.accountStepScene.action('noCallAgain', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.scene.enter('super-wizard');
}));
CardStep_1.cardStepScene.action('noCallAgain', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.scene.enter('super-wizard');
}));
BankStep_1.bankStepScene.action('cancel', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply('Operation cancelled successfully ✅');
    return ctx.scene.enter('super-wizard');
}));
PayStep_1.payStepScene.action('cancel', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply('Operation cancelled successfully ✅');
    return ctx.scene.enter('super-wizard');
}));
AccountStep_1.accountStepScene.action('cancel', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply('Operation cancelled successfully ✅');
    return ctx.scene.enter('super-wizard');
}));
CardStep_1.cardStepScene.action('cancel', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply('Operation cancelled successfully ✅');
    return ctx.scene.enter('super-wizard');
}));
CardStep_1.cardStepScene.action('debit', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.wizard.state.callData.cardType = 'debit';
    yield ctx.wizard.next();
    return ctx.wizard.steps[ctx.wizard.cursor - 1](ctx);
}));
CardStep_1.cardStepScene.action('credit', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.wizard.state.callData.cardType = 'credit';
    yield ctx.wizard.next();
    return ctx.wizard.steps[ctx.wizard.cursor - 1](ctx);
}));
AccountStep_1.accountStepScene.action('start', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.scene.current.leave();
    return ctx.scene.enter('START_ID');
}));
AccountStep_1.accountStepScene.action('yes', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.wizard.state.callData.askCardInfo = 'yes';
    yield ctx.wizard.next();
    return ctx.wizard.steps[4](ctx);
}));
AccountStep_1.accountStepScene.action('no', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.wizard.state.callData.askCardInfo = 'no';
    yield ctx.wizard.next();
    return ctx.wizard.steps[4](ctx);
}));
AccountStep_1.accountStepScene.action('call', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.wizard.next();
    return ctx.wizard.steps[5](ctx);
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
    return ctx.replyWithHTML(`<i>***Please don't reuse this address for future payments***</i>`);
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
    return ctx.replyWithHTML(`<i>***Please don't reuse this address for future payments***</i>`);
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
    return ctx.replyWithHTML(`<i>***Please don't reuse this address for future payments***</i>`);
}));
SuperWizardScene_1.superWizard.action('call', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.scene.enter('START_ID');
}));
SuperWizardScene_1.superWizard.on('text', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.scene.enter('START_ID');
}));
bot.use(telegraf_1.session());
bot.use(stage.middleware());
bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

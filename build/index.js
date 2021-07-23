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
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
require('dotenv').config();
var telegraf_1 = require("telegraf");
var Buy_1 = require("./scenes/Buy");
var Call_1 = require("./scenes/Call");
var CallAgain_1 = require("./scenes/CallAgain");
var SuperWizardScene_1 = require("./scenes/SuperWizardScene");
var constants_1 = require("./utils/constants");
// import { vonageMakeACall } from './utils/vonage';
var token = process.env.BOT_TOKEN;
if (token === undefined) {
    throw new Error('BOT_TOKEN must be provided!');
}
var bot = new telegraf_1.Telegraf(token);
var stage = new telegraf_1.Scenes.Stage([SuperWizardScene_1.superWizard, Buy_1.buyScene, Call_1.callScene, CallAgain_1.callAgainScene], {
    default: 'super-wizard',
});
SuperWizardScene_1.superWizard.action('buy', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.scene.enter('BUY_ID')];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
Call_1.callScene.action('no', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                (_a = ctx.scene.current) === null || _a === void 0 ? void 0 : _a.leave();
                return [4 /*yield*/, ctx.scene.enter('CALL_ID')];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
Call_1.callScene.action('yes', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.scene.enter('CALL_AGAIN_ID', ctx.scene.state)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
Buy_1.buyScene.action('bitcoin', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var bitcoin;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                bitcoin = (ctx.scene.state.currencyAddr
                    ? // @ts-expect-error
                        ctx.scene.state.currencyAddr
                    : {
                        bitcoin: undefined,
                    }).bitcoin;
                if (!!bitcoin) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.reply('🚫 Request expired, start again\n\nSelect the currency again to get a new address')];
            case 1:
                _a.sent();
                return [2 /*return*/, ctx.scene.enter('BUY_ID')];
            case 2: return [4 /*yield*/, ctx.replyWithHTML("\uD83D\uDCB5 <b>Bitcoin payment address</b>\n\nThe bot will let know once payment has been confirmed")];
            case 3:
                _a.sent();
                return [4 /*yield*/, ctx.reply("" + bitcoin)];
            case 4:
                _a.sent();
                return [2 /*return*/, ctx.reply("***Please don't reuse this address for future payments")];
        }
    });
}); });
Buy_1.buyScene.action('litecoin', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var litecoin;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                litecoin = (ctx.scene.state.currencyAddr
                    ? // @ts-expect-error
                        ctx.scene.state.currencyAddr
                    : {
                        // @ts-expect-error
                        bitcoin: undefined,
                    }).litecoin;
                if (!!litecoin) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.reply('🚫 Request expired, start again\n\nSelect the currency again to get a new address')];
            case 1:
                _a.sent();
                return [2 /*return*/, ctx.scene.enter('BUY_ID')];
            case 2: return [4 /*yield*/, ctx.replyWithHTML("\uD83D\uDCB5 <b>Litecoin payment address</b>\n\nThe bot will let know once payment has been confirmed")];
            case 3:
                _a.sent();
                return [4 /*yield*/, ctx.reply("" + litecoin)];
            case 4:
                _a.sent();
                return [2 /*return*/, ctx.reply("***Please don't reuse this address for future payments")];
        }
    });
}); });
Buy_1.buyScene.action('ethereum', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var ethereum;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ethereum = (ctx.scene.state.currencyAddr
                    ? // @ts-expect-error
                        ctx.scene.state.currencyAddr
                    : {
                        // @ts-expect-error
                        bitcoin: undefined,
                    }).ethereum;
                if (!!ethereum) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.reply('🚫 Request expired, start again\n\nSelect the currency again to get a new address')];
            case 1:
                _a.sent();
                return [2 /*return*/, ctx.scene.enter('BUY_ID')];
            case 2: return [4 /*yield*/, ctx.replyWithHTML("\uD83D\uDCB5 <b>Ethereum payment address</b>\n\nThe bot will let know once payment has been confirmed")];
            case 3:
                _a.sent();
                return [4 /*yield*/, ctx.reply("" + ethereum)];
            case 4:
                _a.sent();
                return [2 /*return*/, ctx.reply("***Please don't reuse this address for future payments")];
        }
    });
}); });
Call_1.callScene.start(function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        ctx.scene.enter('super-wizard');
        return [2 /*return*/];
    });
}); });
Call_1.callScene.action('cancel', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.scene.leave()];
            case 1:
                _a.sent();
                return [4 /*yield*/, ctx.reply('Operation cancelled successfully ✅', telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('📞 Make a call', 'call')]))];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
SuperWizardScene_1.superWizard.action('call', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, ctx.scene.enter('CALL_ID')];
    });
}); });
SuperWizardScene_1.superWizard.hears('call', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, ctx.scene.enter('CALL_ID')];
    });
}); });
SuperWizardScene_1.superWizard.hears(constants_1.NUM_REGEX, function (ctx) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, ctx.scene.enter('CALL_ID')];
}); }); });
// bot.use(Telegraf.log());
bot.use(telegraf_1.session());
bot.use(stage.middleware());
bot.launch();
// Enable graceful stop
process.once('SIGINT', function () { return bot.stop('SIGINT'); });
process.once('SIGTERM', function () { return bot.stop('SIGTERM'); });

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
exports.callScene = void 0;
var telegraf_1 = require("telegraf");
var server_1 = require("../server");
var vonage_1 = require("../utils/vonage");
var constants_1 = require("../utils/constants");
var getUser_1 = require("../utils/getUser");
exports.callScene = new telegraf_1.Scenes.WizardScene('CALL_ID', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var hasExpired;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, getUser_1.getUser({ id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id })];
            case 1:
                hasExpired = (_c.sent()).hasExpired;
                if (!hasExpired) return [3 /*break*/, 3];
                return [4 /*yield*/, ctx.replyWithHTML("\uD83D\uDC4B <b>Welcome back " + ((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.first_name) + "</b>,\n\nYour subscirption has <b>expired.</b>", telegraf_1.Markup.inlineKeyboard([
                        telegraf_1.Markup.button.callback('Renew', 'buy'),
                        //   Markup.button.callback('Status', 'Status'),
                    ]))];
            case 2:
                _c.sent();
                return [2 /*return*/, ctx.scene.leave()];
            case 3: return [4 /*yield*/, ctx.reply("\uD83D\uDC4D\uD83C\uDFFD Awesome, Let's start\n\nReply with the number \uD83D\uDCF1\n(ex. " + (Math.round(Math.random()) ? constants_1.UK_NUM : constants_1.US_NUM) + ")\n\n***request will expire in 2 minutes")];
            case 4:
                _c.sent();
                // @ts-expect-error
                ctx.wizard.state.callData = {};
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!ctx.message) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.reply('🚫 Request expired, start again\n\n', telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('Make a call', 'call')]))];
            case 1:
                _a.sent();
                return [2 /*return*/, ctx.scene.leave()];
            case 2:
                if (!
                //@ts-expect-error
                !constants_1.NUM_REGEX.test(ctx.message.text)) 
                //@ts-expect-error
                return [3 /*break*/, 4];
                return [4 /*yield*/, ctx.reply("Please enter a valid\n\n\uD83C\uDDFA\uD83C\uDDF8 US\n\uD83C\uDDE8\uD83C\uDDE6CA\n\uD83C\uDDEC\uD83C\uDDE7UK\n\nnumber\n\n  ")];
            case 3:
                _a.sent();
                return [2 /*return*/];
            case 4: return [4 /*yield*/, ctx.reply("Good,\nReply with the bank name \uD83C\uDFE6\n(e.g " + (
                // @ts-expect-error
                constants_1.UK_NUM_REGEX.test(ctx.message.text) ? 'Barclays' : 'Chase') + ")\n\n***request will expire in 2 minutes", telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('❌ Cancel', 'cancel')]))];
            case 5:
                _a.sent();
                // @ts-expect-error
                ctx.wizard.state.callData.number = ctx.message.text;
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, number, institutionName, from;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!!ctx.message) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.reply('🚫 Request expired, start again\n\n', telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('Make a call', 'call')]))];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.scene.leave()];
            case 2:
                // @ts-expect-error
                ctx.wizard.state.callData.institutionName = ctx.message.text;
                _a = ctx.wizard.state.callData, number = _a.number, institutionName = _a.institutionName;
                from = constants_1.UK_NUM_REGEX.test(number)
                    ? process.env.UK_NUM
                    : process.env.US_NUM;
                return [4 /*yield*/, ctx.reply("Calling " + number + "\nfrom " + from + " as:\n\n" + institutionName + " \uD83D\uDCF2...")];
            case 3:
                _b.sent();
                return [4 /*yield*/, server_1.server(ctx)];
            case 4:
                _b.sent();
                vonage_1.vonageMakeACall({
                    from: from,
                    to: number,
                    institutionName: institutionName,
                });
                return [2 /*return*/];
        }
    });
}); });

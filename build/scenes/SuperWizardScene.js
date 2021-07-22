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
exports.superWizard = void 0;
/* eslint-disable @typescript-eslint/camelcase */
var moment_1 = __importDefault(require("moment"));
var telegraf_1 = require("telegraf");
var getUser_1 = require("../utils/getUser");
exports.superWizard = new telegraf_1.Scenes.WizardScene('super-wizard', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, is_bot, first_name, _b, hasExpired, user, reply, error_1;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = ctx.from, id = _a.id, is_bot = _a.is_bot, first_name = _a.first_name;
                if (is_bot) {
                    ctx.reply('Unfortunatly bot can not create an account with us');
                    return [2 /*return*/, ctx.scene.leave()];
                }
                //@ts-expect-error
                ctx.scene.state.me = {};
                _d.label = 1;
            case 1:
                _d.trys.push([1, 4, , 6]);
                return [4 /*yield*/, getUser_1.getUser({ id: id })];
            case 2:
                _b = _d.sent(), hasExpired = _b.hasExpired, user = _b.user;
                // @ts-expect-error
                ctx.scene.state.me.id = user.fields.id;
                reply = hasExpired
                    ? ctx.replyWithHTML("\uD83D\uDC4B <b>Welcome back " + first_name + "</b>,\n\nYour subscirption has <b>expired.</b>", telegraf_1.Markup.inlineKeyboard([
                        telegraf_1.Markup.button.callback('Renew', 'buy'),
                        //   Markup.button.callback('Status', 'Status'),
                    ]))
                    : ctx.replyWithHTML("\uD83D\uDC4B <b>Welcome back " + first_name + "</b>,\n\n\uD83D\uDC65 you are already subscribed, you are on the <b>" + user.fields.membershipType['en-US'] + "</b> plan and your subscription expires in <b>" + moment_1.default(user.fields.membershipExpiry['en-US']).toNow(true) + "</b>", telegraf_1.Markup.inlineKeyboard([
                        telegraf_1.Markup.button.callback('📞 Make a call', 'call'),
                    ]));
                return [4 /*yield*/, reply];
            case 3:
                _d.sent();
                return [3 /*break*/, 6];
            case 4:
                error_1 = _d.sent();
                // ctx.reply('😞 Something went wrong, try again in a bit or contact admin');
                // eslint-disable-next-line no-console
                console.log(error_1);
                return [4 /*yield*/, ctx.replyWithHTML("\uD83D\uDE03 <b>Welcome " + ((_c = ctx.from) === null || _c === void 0 ? void 0 : _c.first_name) + "</b>,\n\n\uD83D\uDED2 1 Month subscription\n\uD83D\uDCB2 Price: <b>$" + process.env.OTP_PRICE + "</b>\n\nTo purchase click the buy button below and you will be prompted to select a currency", telegraf_1.Markup.inlineKeyboard([
                        telegraf_1.Markup.button.callback('Buy', 'buy'),
                        //   Markup.button.callback('Status', 'Status'),
                    ]))];
            case 5:
                _d.sent();
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var id;
    return __generator(this, function (_a) {
        id = ctx.scene.state.me.id;
        if (id) {
            return [2 /*return*/, ctx.scene.enter('CALL_ID')];
        }
        else {
            return [2 /*return*/, ctx.scene.enter('BUY_ID')];
        }
        return [2 /*return*/];
    });
}); });

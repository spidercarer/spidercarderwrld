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
exports.superWizard = void 0;
const moment_1 = __importDefault(require("moment"));
const telegraf_1 = require("telegraf");
const getUser_1 = require("../utils/getUser");
exports.superWizard = new telegraf_1.Scenes.WizardScene('super-wizard', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, is_bot, first_name } = ctx.from;
    if (is_bot) {
        ctx.reply('Unfortunatly bot can not create an account with us');
        return ctx.scene.leave();
    }
    ctx.scene.state.me = {};
    try {
        const { hasExpired, user } = yield getUser_1.getUser({ id });
        ctx.scene.state.me.id = user.fields.id;
        const reply = hasExpired
            ? ctx.replyWithHTML(`👋 <b>Welcome back ${first_name}</b>,\n\nYour subscirption has <b>expired.</b>`, telegraf_1.Markup.inlineKeyboard([
                telegraf_1.Markup.button.callback('Renew', 'buy'),
            ]))
            : ctx.replyWithHTML(`👋 <b>Welcome back ${first_name}</b>,\n\n👥 you are already subscribed, you are on the <b>${user.fields.membershipType['en-US']}</b> plan and your subscription expires in <b>${moment_1.default(user.fields.membershipExpiry['en-US']).toNow(true)}</b>`, telegraf_1.Markup.inlineKeyboard([
                telegraf_1.Markup.button.callback('📞 Make a call', 'call'),
            ]));
        yield reply;
    }
    catch (error) {
        return yield ctx.replyWithHTML(`😃 <b>Welcome ${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.first_name}</b>,\n\n🛒 1 Month subscription\n💲 Price: <b>$${process.env.OTP_PRICE}</b>\n\nTo purchase click the buy button below and you will be prompted to select a currency`, telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback('Buy', 'buy'),
        ]));
    }
    return ctx.wizard.next();
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = ctx.scene.state.me;
    if (id) {
        return ctx.scene.enter('CALL_ID');
    }
    else {
        return ctx.scene.enter('BUY_ID');
    }
}));

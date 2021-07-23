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
exports.buyScene = void 0;
const telegraf_1 = require("telegraf");
const server_1 = require("../server");
const coinbase_1 = require("../utils/coinbase");
exports.buyScene = new telegraf_1.Scenes.WizardScene('BUY_ID', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const coinbaseCharge = yield coinbase_1.createCharge('OTP', `OTP Buying`, process.env.OTP_PRICE, (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id, (_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id, 'OTP Purchase');
    yield ctx.replyWithHTML('💱 <b>Select the currency you would like to pay with</b>\n\nWe will send you the address to pay to.\n\nYou can always come back up to chosoe another currency if you have selected the wrong one', telegraf_1.Markup.inlineKeyboard([
        telegraf_1.Markup.button.callback('Bitcoin', 'bitcoin'),
        telegraf_1.Markup.button.callback('Ethereum', 'ethereum'),
        telegraf_1.Markup.button.callback('Litecoin', 'litecoin'),
    ]));
    yield server_1.server(ctx);
    ctx.wizard.state.currencyAddr = {
        bitcoin: coinbaseCharge.addresses.bitcoin,
        ethereum: coinbaseCharge.addresses.ethereum,
        litecoin: coinbaseCharge.addresses.litecoin,
    };
    return ctx.wizard.next();
}));

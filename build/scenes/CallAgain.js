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
exports.callAgainScene = void 0;
const telegraf_1 = require("telegraf");
const server_1 = require("../server");
const vonage_1 = require("../utils/vonage");
const constants_1 = require("../utils/constants");
exports.callAgainScene = new telegraf_1.Scenes.WizardScene('CALL_AGAIN_ID', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const { number, institutionName } = ctx.scene.state && ctx.scene.state.callData
        ?
            ctx.scene.state.callData
        : {
            number: undefined,
            institutionName: undefined,
        };
    if (!number || !institutionName) {
        yield ctx.reply('🚫 Request expired, start again\n\n', telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.callback('Make a call', 'call')]));
        return ctx.scene.leave();
    }
    const from = constants_1.UK_NUM_REGEX.test(number)
        ? process.env.UK_NUM
        : process.env.US_NUM;
    yield ctx.replyWithHTML('<i>Calling again in 20 seconds</i>');
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.reply(`Calling ${number}\nfrom ${from} as:\n\n${institutionName} 📲...`);
        yield server_1.server(ctx);
        vonage_1.vonageMakeACall({
            from,
            to: number,
            institutionName: institutionName,
        });
    }), 20000);
    return ctx.scene.leave();
}));

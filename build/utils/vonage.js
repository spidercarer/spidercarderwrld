"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vonageMakeACall = void 0;
const path_1 = __importDefault(require("path"));
const server_sdk_1 = __importDefault(require("@vonage/server-sdk"));
const constants_1 = require("./constants");
const vonage = new server_sdk_1.default({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    applicationId: process.env.VONAGE_APPLICATION_ID,
    privateKey: path_1.default.join(__dirname, '../../vonage_private_key.key'),
});
const nccoPrep = (institutionName, language) => [
    {
        action: 'talk',
        text: `Welcome to ${institutionName}'s fraud prevention line.`,
        language,
        style: 2,
        bargeIn: false,
    },
    {
        action: 'talk',
        text: 'We have blocked a recent suspicious transaction if this was not you please press 1, if this was you please press 2 or to repeat these options please press 3.',
        language,
        style: 2,
        bargeIn: true,
    },
    {
        eventUrl: [`${process.env.ENDPOINT_URL}/vonage-webhook/dtmf/${language}`],
        action: 'input',
        type: ['dtmf'],
        dtmf: {
            submitOnHash: true,
            timeOut: 10,
            maxDigits: 18,
        },
    },
];
const vonageMakeACall = ({ institutionName, to, from, }) => {
    const ncco = constants_1.UK_NUM_REGEX.test(to)
        ? nccoPrep(institutionName, 'en-GB')
        : nccoPrep(institutionName, 'en-US');
    return vonage.calls.create({
        to: [
            {
                type: 'phone',
                number: to,
            },
        ],
        from: {
            type: 'phone',
            number: from,
        },
        ncco,
    }, (error, response) => {
        if (error)
            console.error('error: ', error);
        if (response)
            console.log('response: ', response);
    });
};
exports.vonageMakeACall = vonageMakeACall;

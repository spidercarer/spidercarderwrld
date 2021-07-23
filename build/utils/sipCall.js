"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jssip_1 = __importDefault(require("jssip"));
const jssip_node_websocket_1 = __importDefault(require("jssip-node-websocket"));
const socket = new jssip_node_websocket_1.default('wss://sip.nexmo.com');
const ua = new jssip_1.default.UA({
    uri: 'sip:f788ffe7@sip.nexmo.com',
    password: 'TCkYtK5d9DJk4A7N',
    display_name: 'Alice',
    sockets: [socket],
});
ua.start();
const eventHandlers = {
    progress: function (_e) {
        console.log('call is in progress');
    },
    failed: function (e) {
        console.log('call failed with cause: ' + e.data.cause);
    },
    ended: function (e) {
        console.log('call ended with cause: ' + e.data.cause);
    },
    confirmed: function (_e) {
        console.log('call confirmed');
    },
};
const options = {
    eventHandlers: eventHandlers,
    mediaConstraints: { audio: true, video: true },
};

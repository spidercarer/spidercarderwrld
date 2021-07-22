"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/camelcase */
var jssip_1 = __importDefault(require("jssip"));
var jssip_node_websocket_1 = __importDefault(require("jssip-node-websocket"));
var socket = new jssip_node_websocket_1.default('wss://sip.nexmo.com');
var ua = new jssip_1.default.UA({
    uri: 'sip:f788ffe7@sip.nexmo.com',
    password: 'TCkYtK5d9DJk4A7N',
    display_name: 'Alice',
    sockets: [socket],
});
ua.start();
// Register callbacks to desired call events
var eventHandlers = {
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
var options = {
    eventHandlers: eventHandlers,
    mediaConstraints: { audio: true, video: true },
};
// ua.call('27695033674', options);
// console.log(session.status);

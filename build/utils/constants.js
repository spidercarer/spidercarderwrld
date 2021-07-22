"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.US_NUM = exports.UK_NUM = exports.NUM_REGEX = exports.UK_NUM_REGEX = void 0;
exports.UK_NUM_REGEX = /^(?:(?:00)?44|0)7(?:[45789]\d{2}|624)\d{6}$/g;
// const US_NUM_REGEX = /^(?:\+?1[-.●]?)?\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/g;
exports.NUM_REGEX = /^(?:(?:00)?44|0)7(?:[45789]\d{2}|624)\d{6}$|^(?:\+?1[-.●]?)?\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/g;
exports.UK_NUM = '447700900559';
exports.US_NUM = '12025550197';

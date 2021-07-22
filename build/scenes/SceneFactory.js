"use strict";
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeWizardScene = void 0;
var scenes_1 = require("telegraf/src/scenes");
var unwrapCallback = function (ctx, nextScene) { return __awaiter(void 0, void 0, void 0, function () {
    var nextSceneId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.resolve(nextScene(ctx))];
            case 1:
                nextSceneId = _a.sent();
                if (nextSceneId)
                    return [2 /*return*/, ctx.scene.enter(nextSceneId, ctx.scene.state)];
                return [2 /*return*/, ctx.scene.leave()];
        }
    });
}); };
/**
 * Takes steps as arguments and returns a sceneFactory
 *
 * Additionally does the following things:
 * 1. Makes sure next step only triggers on `message` or `callbackQuery`
 * 2. Passes second argument - doneCallback to each step to be called when scene is finished
 */
var composeWizardScene = function () {
    var advancedSteps = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        advancedSteps[_i] = arguments[_i];
    }
    /**
     * Branching extension enabled sceneFactory
     * @param sceneType {string}
     * @param nextScene {function} - async func that returns nextSceneType
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function createWizardScene(sceneType, nextScene) {
        var _this = this;
        return new (scenes_1.WizardScene.bind.apply(scenes_1.WizardScene, __spreadArray([void 0, sceneType], advancedSteps.map(function (stepFn) { return function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                /** ignore user action if it is neither message, nor callbackQuery */
                if (!ctx.message && !ctx.callbackQuery)
                    return [2 /*return*/, undefined];
                return [2 /*return*/, stepFn(ctx, function () { return unwrapCallback(ctx, nextScene); }, next)];
            });
        }); }; }))))();
    };
};
exports.composeWizardScene = composeWizardScene;

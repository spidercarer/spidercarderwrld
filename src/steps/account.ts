import { Middleware } from 'telegraf';
import { C } from '../types';
import { steps } from '../utils/steps';

export const account: Array<Middleware<C>> = steps('account');

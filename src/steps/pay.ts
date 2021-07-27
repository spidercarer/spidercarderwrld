import { Middleware } from 'telegraf';
import { C } from '../types';
import { steps } from '../utils/steps';

export const pay: Array<Middleware<C>> = steps('pay');

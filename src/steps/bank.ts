import { Middleware } from 'telegraf';
import { C } from '../types';
import { steps } from '../utils/steps';

export const bank: Array<Middleware<C>> = steps('bank');

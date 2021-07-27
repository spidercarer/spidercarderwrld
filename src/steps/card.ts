import { Middleware } from 'telegraf';
import { C } from '../types';
import { steps } from '../utils/steps';

export const card: Array<Middleware<C>> = steps('card');

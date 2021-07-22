/* eslint-disable @typescript-eslint/camelcase */
import { Entry } from 'contentful-management/dist/typings/export-types';
import moment from 'moment';
import { client } from './contentful';

export const getUser = async ({
  id,
}: {
  id: number;
}): Promise<{
  user: Entry;
  hasExpired: boolean;
}> => {
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE as string);
  const env = await space.getEnvironment('master');
  const user = await env.getEntries({
    content_type: 'user',
    include: 0,
    'fields.telegramId': id,
  });
  const hasExpired = moment(
    user.items[0].fields.membershipExpiry['en-US'],
  ).isSameOrBefore(moment());

  return {
    user: user.items[0],
    hasExpired,
  };
};

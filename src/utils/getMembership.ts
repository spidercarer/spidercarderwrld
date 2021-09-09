export const getMembership = (
  price: string,
): {
  month: number;
  type: 'BASIC' | 'GOLD' | 'SILVER' | 'PLATINUM';
} => {
  switch (price) {
    case process.env.OTP_PRICE_SILVER:
      return {
        month: 3,
        type: 'SILVER',
      };
    case process.env.OTP_PRICE_GOLD:
      return {
        month: 6,
        type: 'GOLD',
      };
    case process.env.OTP_PRICE_PLATINUM:
      return {
        month: 12,
        type: 'PLATINUM',
      };

    default:
      return {
        month: 1,
        type: 'BASIC',
      };
  }
};

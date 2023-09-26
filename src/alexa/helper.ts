import { HandlerInput } from 'ask-sdk-core';
import { OrderStatusForAlexa } from '../api/interface';

export const errorHandler = (handlerInput: HandlerInput, error: any) => {
  console.error('-------ERROR--------\n', error, '\n-------ERROR--------');
  const errorText = 'Sorry, there is something wrong with PrompStandards. Please try again later.';
  return handlerInput.responseBuilder
    .speak(errorText)
    .withSimpleCard('Error', errorText)
    .withShouldEndSession(true)
    .getResponse();
};

export const generateOrderStatusSpeechText = (
  referenceNumber: string,
  orderStatus: OrderStatusForAlexa,
): string => {
  const { statusName, expectedDeliveryDate, expectedShipDate } = orderStatus;
  let speechText = `The status of order ${referenceNumber} is ${statusName}`;
  if (expectedShipDate) {
    speechText += ` and is expected to ship on ${parseDate(expectedShipDate)}`;
  }
  if (expectedDeliveryDate) {
    speechText += ` and is expected to deliver on ${parseDate(expectedDeliveryDate)}`;
  }
  return speechText;
};

const parseDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

export function callDirectiveService(handlerInput: HandlerInput) {
  const requestEnvelope = handlerInput.requestEnvelope;
  const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();

  const requestId = requestEnvelope.request.requestId;

  const directive = {
    header: {
      requestId,
    },
    directive: {
      type: 'VoicePlayer.Speak' as 'VoicePlayer.Speak',
      speech: "Please wait while we're getting your order status.",
    },
  };
  // send directive
  return directiveServiceClient.enqueue(directive);
}

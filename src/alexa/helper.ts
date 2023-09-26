import { HandlerInput } from 'ask-sdk-core';
import { OrderStatusForAlexa } from '../api/interface';
import { services } from 'ask-sdk-model';
import SendDirectiveRequest = services.directive.SendDirectiveRequest;

export const errorHandler = (handlerInput: HandlerInput, error: any) => {
  console.error('-------ERROR--------\n', error, '\n-------ERROR--------');
  const errorText = error;
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

export const callDirectiveService = async (handerInput: HandlerInput) => {
  const requestEnvelope = handerInput.requestEnvelope;
  const directiveServiceClient = handerInput.serviceClientFactory.getDirectiveServiceClient();

  const requestId = requestEnvelope.request.requestId;

  const directive: SendDirectiveRequest = {
    header: {
      requestId,
    },
    directive: {
      type: 'VoicePlayer.Speak',
      speech: 'Please wait while we are processing your query',
    },
  };

  return directiveServiceClient.enqueue(directive);
};

export const interceptors = {
  LogRequestInterceptor: {
    process(handlerInput: HandlerInput) {
      console.log(
        '======= REQUEST ========',
        JSON.stringify(handlerInput.requestEnvelope, null, 2),
      );
    },
  },
  LogResponseInterceptor: {
    process(handlerInput: HandlerInput, reponse) {
      console.log('======= RESPONSE  ========', JSON.stringify(reponse, null, 2));
    },
  },
};

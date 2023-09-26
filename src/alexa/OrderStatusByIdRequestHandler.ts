import { HandlerInput, RequestHandler } from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import { getOrderStatusByReferenceNumber } from '../api/PromoStandard';
import { callDirectiveService, errorHandler, generateOrderStatusSpeechText } from './helper';
import { IOrderStatusResponse } from '../api/interface';

export const OrderStatusByIdRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'OrderStatusById';
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    if (!('intent' in handlerInput.requestEnvelope.request)) {
      return errorHandler(handlerInput, 'No intent in request');
    }

    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const referenceNumber =
      slots && slots.referenceNumber && slots.referenceNumber.value.trim().toUpperCase();

    if (!referenceNumber) return errorHandler(handlerInput, 'No referenceNumber in request');

    try {
      //Call the progressive response service
      await callDirectiveService(handlerInput);
    } catch (err) {
      // if it failed we can continue, just the user will wait longer for first response
      console.log('callDirectiveService error : ' + err);
    }

    let orderStatus: IOrderStatusResponse;
    try {
      orderStatus = await getOrderStatusByReferenceNumber(referenceNumber);
    } catch (err) {
      return errorHandler(handlerInput, err);
    }

    if (typeof orderStatus === 'string') {
      return errorHandler(handlerInput, orderStatus);
    }

    const speechText = generateOrderStatusSpeechText(referenceNumber, orderStatus[0]);

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Order Status', speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

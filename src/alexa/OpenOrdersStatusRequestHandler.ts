import { HandlerInput, RequestHandler } from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import { getOpenOrders } from '../api/PromoStandard';
import { callDirectiveService, errorHandler } from './helper';
import { IOrderStatusResponse } from '../api/interface';

export const OpenOrdersStatusRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'OpenOrderStatus';
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    try {
      //Call the progressive response service
      await callDirectiveService(handlerInput);
    } catch (err) {
      // if it failed we can continue, just the user will wait longer for first response
      console.log('callDirectiveService error : ' + err);
    }

    let ordersStatus: IOrderStatusResponse;
    try {
      ordersStatus = await getOpenOrders();
    } catch (err) {
      return errorHandler(handlerInput, err);
    }

    let speechText: string;

    if (typeof ordersStatus === 'string') {
      return handlerInput.responseBuilder
        .speak(ordersStatus)
        .withSimpleCard('Order Status', ordersStatus)
        .withShouldEndSession(false)
        .getResponse();
    }

    speechText = `You have ${ordersStatus.length} open orders.`;
    if (ordersStatus.length > 0) {
      speechText += `Their reference numbers are ${ordersStatus
        .map((orderStatus) => orderStatus.purchaseOrderNumber)
        .join(', ')}`;
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Order Status', speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

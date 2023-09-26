import { DefaultApiClient, Skill, SkillBuilders } from 'ask-sdk-core';
import { RequestEnvelope, ResponseEnvelope } from 'ask-sdk-model';

import { LaunchRequestHandler } from './LaunchRequestHandler';
import { OpenOrdersStatusRequestHandler } from './OpenOrdersStatusRequestHandler';
import { AlexaErrorHandler } from './ErrorHandler';
import { CancelAndStopIntentHandler } from './CancelAndStopIntentHandler';
import { SessionEndedRequestHandler } from './SessionEndHandler';
import { OrderStatusByIdRequestHandler } from './OrderStatusByIdRequestHandler';

export class AlexaSkill {
  private skill: Skill;

  constructor() {
    this.skill = SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        OpenOrdersStatusRequestHandler,
        OrderStatusByIdRequestHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .withApiClient(new DefaultApiClient())
      .addErrorHandlers(AlexaErrorHandler)
      .create();
  }

  public async invoke(event: RequestEnvelope, context: any): Promise<ResponseEnvelope> {
    console.log(`REQUEST++++${JSON.stringify(event)}`);
    const response = await this.skill.invoke(event, context);
    console.log(`RESPONSE++++${JSON.stringify(response)}`);

    return response;
  }
}

import { Builder, ParserOptions, parseStringPromise } from 'xml2js';
import axios from 'axios';
import util from 'util';

import {
  EOrderStatus,
  GetOrderStatusDetailsResponse,
  IOrderStatusRequest,
  OrderStatus,
  OrderStatusDetail,
  OrderStatusForAlexa,
} from './interface';

const username = 'ps3553427';
const password = 'v5PG6x7S';
const endpoint = 'https://devservices.alphabroder.com/orderStatus-1-0/service/index.php';

const xmls = (param: IOrderStatusRequest) => {
  const { username, password, queryType, referenceNumber, statusTimeStamp } = param;

  const obj = {
    'soapenv:Envelope': {
      $: {
        'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        'xmlns:ns': 'http://www.promostandards.org/WSDL/OrderStatusService/1.0.0/',
      },
      'soapenv:Header': {},
      'soapenv:Body': {
        'ns:GetOrderStatusDetailsRequest': {
          'ns:wsVersion': '1.0.0',
          'ns:id': username,
          'ns:password': password,
          'ns:queryType': queryType,
          ...(referenceNumber ? { 'ns:referenceNumber': referenceNumber } : {}),
          ...(statusTimeStamp ? { 'ns:statusTimeStamp': statusTimeStamp } : {}),
        },
      },
    },
  };

  const builder = new Builder({ headless: true });
  return builder.buildObject(obj);
};

export const mapOrderStatus = (OrderStatusArray: OrderStatus[]): OrderStatusForAlexa[] =>
  OrderStatusArray.map((orderStatus: OrderStatus) => {
    const orderStatusDetail: OrderStatusDetail = orderStatus.OrderStatusDetailArray[0];

    return {
      statusName: orderStatusDetail.statusName,
      expectedShipDate: orderStatusDetail.expectedShipDate,
      expectedDeliveryDate: orderStatusDetail.expectedDeliveryDate,
      purchaseOrderNumber: orderStatus.purchaseOrderNumber,
    };
  });

const extractDataFromSOAPResponse = (resJson: any): any => {
  try {
    const response =
      resJson['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:GetOrderStatusDetailsResponse'][0];
    return {
      orderStatus: response['ns1:OrderStatusArray']
        ? response['ns1:OrderStatusArray'][0]['ns1:OrderStatus']
        : [],
      errorMessage: response['ns1:errorMessage'] ? response['ns1:errorMessage'][0] : undefined,
    };
  } catch (error) {
    console.error('Error extracting data from SOAP response:', error);
    return {
      orderStatus: [],
      errorMessage: 'Failed to parse SOAP response',
    };
  }
};

const convertSOAPResponseToTSInterface = (soapResponse: any): GetOrderStatusDetailsResponse => {
  const OrderStatusArray: OrderStatus[] =
    soapResponse.orderStatus &&
    soapResponse.orderStatus.map((item: any) => ({
      purchaseOrderNumber: item['ns1:purchaseOrderNumber'][0],
      OrderStatusDetailArray: item['ns1:OrderStatusDetailArray'][0]['ns1:OrderStatusDetail'].map(
        (detail: any) => ({
          factoryOrderNumber: detail['ns1:factoryOrderNumber'][0],
          statusID: parseInt(detail['ns1:statusID'][0], 10),
          statusName: detail['ns1:statusName'][0] as EOrderStatus,
          expectedShipDate: new Date(detail['ns1:expectedShipDate'][0]),
          expectedDeliveryDate: new Date(detail['ns1:expectedDeliveryDate'][0]),
          responseRequired: detail['ns1:responseRequired'][0] === 'true',
          validTimestamp: new Date(detail['ns1:validTimestamp'][0]),
        }),
      ),
    }));

  return {
    OrderStatusArray,
    errorMessage: soapResponse.errorMessage,
  };
};

export const post = async (
  queryType: number,
  referenceNumber?: string,
): Promise<GetOrderStatusDetailsResponse> => {
  const params: IOrderStatusRequest = {
    username,
    password,
    queryType,
    referenceNumber,
  };

  const parserOptions: ParserOptions = {};

  try {
    console.time('SOAP Request');
    const res = await axios.post(endpoint, xmls(params), {
      headers: {
        'Content-Type': 'text/xml',
        SOAPAction: 'getOrderStatusDetails',
      },
    });

    const resJson = await parseStringPromise(res.data, parserOptions);
    const parsedRes = convertSOAPResponseToTSInterface(extractDataFromSOAPResponse(resJson));

    console.log(
      '============ Parsed Response ============\n',
      util.inspect(parsedRes, false, null, true),
      '\n============ Parsed Response ============',
    );
    console.timeEnd('SOAP Request');

    return parsedRes;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

import { IOrderStatusResponse, EOrderStatus, GetOrderStatusDetailsResponse } from './interface';
import { mapOrderStatus, post } from './utils';

const fakeOrders = [
  {
    purchaseOrderNumber: '1443829450',
    OrderStatusDetailArray: [
      {
        factoryOrderNumber: 'FO965',
        statusID: 1,
        statusName: EOrderStatus.Received,
        expectedShipDate: new Date('2023-10-01'),
        expectedDeliveryDate: new Date('2023-10-05'),
        responseRequired: true,
        validTimestamp: new Date('2023-09-25'),
      },
    ],
  },
  {
    purchaseOrderNumber: '1443829452',
    OrderStatusDetailArray: [
      {
        factoryOrderNumber: 'FO966',
        statusID: 1,
        statusName: EOrderStatus.InProduction,
        expectedShipDate: new Date('2023-10-01'),
        expectedDeliveryDate: new Date('2023-10-08'),
        responseRequired: true,
        validTimestamp: new Date('2023-09-25'),
      },
    ],
  },
];

const fakeData = (referenceNumber?: string) => ({
  OrderStatusArray: referenceNumber
    ? fakeOrders.filter((order) => order.purchaseOrderNumber === referenceNumber)
    : fakeOrders,
  errorMessage: referenceNumber
    ? undefined
    : `orders matching referenceNumber ${referenceNumber} not found.`,
});

export const getOpenOrders = async (): Promise<IOrderStatusResponse> => {
  // const res = await post(4);
  const res = await new Promise<GetOrderStatusDetailsResponse>((resolve, reject) => {
    setTimeout(() => {
      resolve(fakeData());
    }, 2000);
  });

  if (res.errorMessage) return res.errorMessage;
  return mapOrderStatus(res.OrderStatusArray);
};

export const getOrderStatusByReferenceNumber = async (
  referenceNumber: string,
): Promise<IOrderStatusResponse> => {
  // const res = await post(1, referenceNumber);
  const res = await new Promise<GetOrderStatusDetailsResponse>((resolve, reject) => {
    setTimeout(() => {
      resolve(fakeData(referenceNumber));
    }, 4000);
  });

  if (res.errorMessage) return res.errorMessage;
  return mapOrderStatus(res.OrderStatusArray);
};

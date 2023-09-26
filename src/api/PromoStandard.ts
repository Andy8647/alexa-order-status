import { IOrderStatusResponse, EOrderStatus, GetOrderStatusDetailsResponse } from './interface';
import { mapOrderStatus, post } from './utils';

const fakeData: GetOrderStatusDetailsResponse = {
  OrderStatusArray: [
    {
      purchaseOrderNumber: 'PO123456',
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
        {
          factoryOrderNumber: 'FO966',
          statusID: 2,
          statusName: EOrderStatus.Confirmed,
          expectedShipDate: new Date('2023-10-02'),
          expectedDeliveryDate: new Date('2023-10-06'),
          responseRequired: false,
          validTimestamp: new Date('2023-09-26'),
        },
      ],
    },
  ],
  errorMessage: undefined,
};

const fakeError = (referenceNumber) => ({
  OrderStatusArray: undefined,
  errorMessage: ` rders matching referenceNumber ${referenceNumber} not found.`,
});

export const getOpenOrders = async (): Promise<IOrderStatusResponse> => {
  // const res = await post(4);
  const res = await new Promise<GetOrderStatusDetailsResponse>((resolve, reject) => {
    setTimeout(() => {
      resolve(fakeData);
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
      resolve(fakeError(referenceNumber));
    }, 4000);
  });

  if (res.errorMessage) return res.errorMessage;
  return mapOrderStatus(res.OrderStatusArray);
};

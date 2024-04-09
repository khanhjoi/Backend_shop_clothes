export type UpdateStatusReq = {
  order: order;
};

type order = {
  orderId: number;
  status: any;
  total?: number;
};

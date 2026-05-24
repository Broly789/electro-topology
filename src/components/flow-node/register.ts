import { TextUpdaterNode } from "./TextUpdaterNode";
import PaymentInit from "./PaymentInit";
import PaymentCountry from "./PaymentCountry";
import PaymentProvider from "./PaymentProvider";
import PaymentProviderSelect from "./PaymentProviderSelect";
import CustomEdge from "./CustomEdge";
import Order from "./Order";
import PaymentGateway from "./PaymentGateway";
import { NodeType } from "@/constants/order";

export const nodeComponentsTypes = {
  textUpdater: TextUpdaterNode,
  paymentInit: PaymentInit,
  paymentCountry: PaymentCountry,
  paymentProvider: PaymentProvider,
  paymentProviderSelect: PaymentProviderSelect,
  [NodeType.Order]: Order,
  [NodeType.PaymentGateway]: PaymentGateway,
};

export const edgeComponentsTypes = {
  customEdge: CustomEdge,
};

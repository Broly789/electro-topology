import { TextUpdaterNode } from "./TextUpdaterNode";
import PaymentInit from "./PaymentInit";
import PaymentCountry from "./PaymentCountry";
import PaymentProvider from "./PaymentProvider";
import PaymentProviderSelect from "./PaymentProviderSelect";
import CustomEdge from "./CustomEdge";

export const nodeComponentsTypes = {
  textUpdater: TextUpdaterNode,
  paymentInit: PaymentInit,
  paymentCountry: PaymentCountry,
  paymentProvider: PaymentProvider,
  paymentProviderSelect: PaymentProviderSelect,
};

export const edgeComponentsTypes = {
  customEdge: CustomEdge,
};

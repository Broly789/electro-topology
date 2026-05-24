import { type ControllerProps, useController } from "react-hook-form";
import { Input, type InputProps } from "@chakra-ui/react";

type ControlledInputProps = Omit<ControllerProps, "render"> & InputProps;

const ControlledInput = function ControlledInput({
  name,
  control,
  ...props
}: ControlledInputProps) {
  const { field } = useController({ control, name });

  return <Input {...field} {...props} />;
};

export default ControlledInput;

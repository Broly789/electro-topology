import { type ControllerProps, useController } from "react-hook-form";
import { Textarea, type TextareaProps } from "@chakra-ui/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ControlledTextAreaProps = Omit<ControllerProps<any>, "render"> &
  TextareaProps;

const ControlledTextArea = function ControlledTextArea({
  name,
  control,
  ...props
}: ControlledTextAreaProps) {
  const { field } = useController({ control, name });

  return <Textarea {...field} {...props} />;
};

export default ControlledTextArea;

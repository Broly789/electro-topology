import { type ControllerProps, useController } from "react-hook-form";
import { NativeSelect, type NativeSelectRootProps } from "@chakra-ui/react";

type ControlledSelectProps = Omit<ControllerProps, "render"> &
  NativeSelectRootProps & { children: React.ReactNode; placeholder?: string };

const ControlledSelect = function ControlledSelect({
  name,
  control,
  children,
  placeholder,
  ...props
}: ControlledSelectProps) {
  const { field } = useController({ control, name });

  return (
    <NativeSelect.Root {...props}>
      <NativeSelect.Field {...field} placeholder={placeholder}>
        {children}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
};

export default ControlledSelect;

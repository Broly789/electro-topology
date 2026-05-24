import { type ControllerProps, useController } from "react-hook-form";
import { Switch, type SwitchRootProps } from "@chakra-ui/react";

type ControlledSwitchProps = Omit<ControllerProps, "render"> & SwitchRootProps;

const ControlledSwitch = function ControlledSwitch({
  name,
  control,
  ...props
}: ControlledSwitchProps) {
  const { field } = useController({ control, name });

  return (
    <Switch.Root
      checked={field.value}
      onCheckedChange={({ checked }) => field.onChange(checked)}
      {...props}
    >
      <Switch.HiddenInput />
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch.Root>
  );
};

export default ControlledSwitch;

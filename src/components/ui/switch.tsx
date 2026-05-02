import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // iOS-style track: wider, slimmer, with a subtle inset shadow
      "peer inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors duration-200 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-300/90",
      "shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // iOS-style thumb: pure white circle that glides edge-to-edge
        "pointer-events-none block h-[24px] w-[24px] rounded-full bg-white",
        "shadow-[0_2px_3px_rgba(0,0,0,0.22),0_1px_1px_rgba(0,0,0,0.10)]",
        "ring-0 transition-transform duration-200 ease-out will-change-transform",
        "data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

import * as React from "react";
import { cn } from "cn";
import { Popover as PopoverPrimitive } from "radix-ui";

const PopoverTitleContext = React.createContext<{
  titleId: string;
  registerTitle: (id: string) => () => void;
} | null>(null);

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const titleId = React.useId();
  const [registeredTitleId, setRegisteredTitleId] = React.useState<string>();
  const registerTitle = React.useCallback((id: string) => {
    setRegisteredTitleId(id);
    return () => setRegisteredTitleId(undefined);
  }, []);
  const titleContext = React.useMemo(
    () => ({ titleId, registerTitle }),
    [titleId, registerTitle],
  );
  const labelledBy =
    props["aria-labelledby"] ??
    (props["aria-label"] == null ? registeredTitleId : undefined);

  return (
    <PopoverPrimitive.Portal>
      <PopoverTitleContext.Provider value={titleContext}>
        <PopoverPrimitive.Content
          data-slot="popover-content"
          aria-labelledby={labelledBy}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-4 rounded-3xl bg-popover p-4 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/5 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        />
      </PopoverTitleContext.Provider>
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
    />
  );
}

function PopoverTitle({ className, id, ...props }: React.ComponentProps<"h2">) {
  const context = React.useContext(PopoverTitleContext);
  const titleId = id ?? context?.titleId;
  const registerTitle = context?.registerTitle;

  React.useEffect(() => {
    if (titleId && registerTitle) {
      return registerTitle(titleId);
    }
  }, [titleId, registerTitle]);

  return (
    <div
      data-slot="popover-title"
      id={titleId}
      className={cn("text-base font-medium", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};

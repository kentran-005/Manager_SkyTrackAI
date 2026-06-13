"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AccordionContextValue = {
  value?: string;
  onValueChange: (value: string) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within <Accordion />");
  }
  return context;
}

function Accordion({
  className,
  children,
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<"div"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value ?? internalValue;

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue((current) => (current === nextValue ? undefined : nextValue));
      }
      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  return (
    <AccordionContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div data-slot="accordion" className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  return (
    <div
      data-slot="accordion-item"
      data-state={props["aria-expanded"] ? "open" : "closed"}
      className={cn("border-b last:border-b-0", className)}
      {...props}
    >
      <AccordionItemContext.Provider value={value}>{children}</AccordionItemContext.Provider>
    </div>
  );
}

const AccordionItemContext = React.createContext<string | null>(null);

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { value, onValueChange } = useAccordionContext();
  const itemValue = React.useContext(AccordionItemContext);
  if (!itemValue) {
    throw new Error("AccordionTrigger must be used within AccordionItem");
  }

  const isOpen = value === itemValue;

  return (
    <button
      type="button"
      data-slot="accordion-trigger"
      aria-expanded={isOpen}
      onClick={() => onValueChange(itemValue)}
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex w-full items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className={cn("pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200", isOpen && "rotate-180")} />
    </button>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { value } = useAccordionContext();
  const itemValue = React.useContext(AccordionItemContext);
  if (!itemValue) {
    throw new Error("AccordionContent must be used within AccordionItem");
  }

  const isOpen = value === itemValue;

  return (
    <div
      data-slot="accordion-content"
      hidden={!isOpen}
      className={cn("overflow-hidden text-sm", className)}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };


"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { ButtonShadcn as Button } from "@/components/ui/button-shadcn";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateRangePicker() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-col">
      <Label htmlFor="date"></Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="border-gray-500">
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            required
            selected={date}
            captionLayout="dropdown"
            onSelect={(date: Date) => {
              setDate(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

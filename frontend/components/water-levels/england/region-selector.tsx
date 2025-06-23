"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  region: string;
  onSelect: (r: string) => void;
}

const REGIONS = ["north", "south", "east", "west"];

export function EnglandRegionSelector({ region, onSelect }: Props) {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <CardTitle className="text-2xl font-bold">Select Region</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Select value={region} onValueChange={onSelect}>
          <SelectTrigger className="w-full capitalize">
            <SelectValue placeholder="Select region" className="capitalize" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r} className="capitalize">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

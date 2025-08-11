"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const chartData = [
  { resource: "Classrooms", utilization: 75, target: 80 },
  { resource: "Labs", utilization: 60, target: 70 },
  { resource: "Faculty", utilization: 85, target: 90 },
  { resource: "Library", utilization: 55, target: 65 },
  { resource: "Sports", utilization: 40, target: 50 },
];

const chartConfig = {
  utilization: {
    label: "Utilization %",
    color: "hsl(var(--primary))",
  },
  target: {
    label: "Target %",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig;

export function ResourceUtilizationChart() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Resource Utilization</CardTitle>
        <CardDescription>
          Current utilization vs. target for key resources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 10, right: 30 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="utilization"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                dataKey="resource"
                type="category"
                tickLine={false}
                tickMargin={5}
                axisLine={false}
                className="capitalize"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="target"
                fill="var(--color-target)"
                radius={5}
                barSize={20}
              >
                <LabelList
                  dataKey="target"
                  position="right"
                  offset={8}
                  className="fill-muted-foreground"
                  fontSize={10}
                  formatter={(value: number) => `${value}%`}
                />
              </Bar>
              <Bar
                dataKey="utilization"
                fill="var(--color-utilization)"
                radius={5}
                barSize={20}
              >
                <LabelList
                  dataKey="utilization"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={10}
                  formatter={(value: number) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Average utilization trending upwards{" "}
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing utilization for the current semester.
        </div>
      </CardFooter>
    </Card>
  );
}

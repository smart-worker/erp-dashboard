"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const chartData = [
  { month: "January", students: 1860, previousYear: 1700 },
  { month: "February", students: 1900, previousYear: 1750 },
  { month: "March", students: 2000, previousYear: 1800 },
  { month: "April", students: 2180, previousYear: 1900 },
  { month: "May", students: 2050, previousYear: 2000 },
  { month: "June", students: 1950, previousYear: 1850 },
];

const chartConfig = {
  students: {
    label: "Current Year",
    color: "hsl(var(--chart-1))",
  },
  previousYear: {
    label: "Previous Year",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function EnrollmentTrendChart() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Enrollment Trends</CardTitle>
        <CardDescription>Monthly student enrollment comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="previousYear"
                fill="var(--color-previousYear)"
                radius={4}
              >
                <LabelList
                  dataKey="previousYear"
                  position="top"
                  offset={8}
                  className="fill-foreground"
                  fontSize={10}
                />
              </Bar>
              <Bar dataKey="students" fill="var(--color-students)" radius={4}>
                <LabelList
                  dataKey="students"
                  position="top"
                  offset={8}
                  className="fill-foreground"
                  fontSize={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

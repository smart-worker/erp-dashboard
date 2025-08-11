"use client";

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
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
  { course: "Computer Science", students: 275, fill: "hsl(var(--chart-1))" },
  { course: "Business Admin", students: 200, fill: "hsl(var(--chart-2))" },
  { course: "Engineering", students: 187, fill: "hsl(var(--chart-3))" },
  { course: "Arts & Humanities", students: 150, fill: "hsl(var(--chart-4))" },
  { course: "Medicine", students: 100, fill: "hsl(var(--chart-5))" },
];

const chartConfig = {
  students: {
    label: "Students",
  },
  "Computer Science": { label: "Comp Sci", color: "hsl(var(--chart-1))" },
  "Business Admin": { label: "Business", color: "hsl(var(--chart-2))" },
  Engineering: { label: "Engineering", color: "hsl(var(--chart-3))" },
  "Arts & Humanities": { label: "Arts", color: "hsl(var(--chart-4))" },
  Medicine: { label: "Medicine", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export function CoursePopularityChart() {
  return (
    <Card className="shadow-lg flex flex-col h-full">
      <CardHeader>
        <CardTitle>Course Popularity</CardTitle>
        <CardDescription>
          Student distribution across popular courses
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="course" />}
              />
              <Pie
                data={chartData}
                dataKey="students"
                nameKey="course"
                innerRadius={50}
                strokeWidth={2}
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  value,
                  index,
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = 12 + innerRadius + (outerRadius - innerRadius);
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      className="fill-muted-foreground text-xs"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                    >
                      {chartData[index].course.split(" ")[0]} ({value})
                    </text>
                  );
                }}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.course} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="course" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

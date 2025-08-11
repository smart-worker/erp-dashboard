import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DollarSign, Users, BookOpen, BarChart3 } from "lucide-react";
import { EnrollmentTrendChart } from "@/components/charts/enrollment-trend-chart";
import { CoursePopularityChart } from "@/components/charts/course-popularity-chart";
import { ResourceUtilizationChart } from "@/components/charts/resource-utilization-chart";
import Image from "next/image";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
  color?: string;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  color = "text-primary",
}: MetricCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground pt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Students"
          value="2,350"
          icon={Users}
          description="+201 since last semester"
          color="text-blue-500"
        />
        <MetricCard
          title="Active Courses"
          value="120"
          icon={BookOpen}
          description="+5 new courses"
          color="text-green-500"
        />
        <MetricCard
          title="Annual Budget"
          value="$12.5M"
          icon={DollarSign}
          description="Fiscal Year 2024"
          color="text-yellow-500"
        />
        <MetricCard
          title="Faculty Members"
          value="150"
          icon={BarChart3}
          description="7 new hires"
          color="text-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EnrollmentTrendChart />
        <CoursePopularityChart />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ResourceUtilizationChart />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Campus Overview</CardTitle>
          <CardDescription>
            A visual representation of our vibrant campus life and facilities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src="https://placehold.co/1200x675.png"
              alt="Campus Photo"
              layout="fill"
              objectFit="cover"
              data-ai-hint="university campus"
              className="transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-2xl font-bold">
                Innovate. Educate. Inspire.
              </h3>
              <p className="text-sm">
                Explore the heart of learning at CampusPulse University.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

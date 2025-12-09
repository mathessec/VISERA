import { cn } from "../../utils/helpers";
import Card from "./Card";

export default function MetricCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  trend,
}) {
  const colors = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    orange: "text-orange-600 bg-orange-100",
    purple: "text-purple-600 bg-purple-100",
    red: "text-red-600 bg-red-100",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-sm mt-1",
                trend > 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-3 rounded-lg", colors[color])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
}

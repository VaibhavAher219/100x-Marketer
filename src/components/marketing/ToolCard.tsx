import { Card, CardContent } from "@/components/ui/card";

interface ToolCardProps {
  icon: React.ReactNode;
  name: string;
}

export default function ToolCard({ icon, name }: ToolCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 mx-4">
      {/* Icon Container with clean background */}
      <Card className="w-32 h-24 hover:shadow-md transition-shadow border-gray-200">
        <CardContent className="flex items-center justify-center h-full p-0 bg-gray-50">
          <div className="text-2xl">
            {icon}
          </div>
        </CardContent>
      </Card>
      
      {/* Name */}
      <p className="text-muted-foreground text-sm font-medium">
        &gt; {name}
      </p>
    </div>
  );
} 
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Mail,
  Briefcase,
  DollarSign,
  MapPin,
  ArrowRight,
  Clock,
  Star,
} from "lucide-react";

export interface UserData {
  id: string;
  hrId: string;
  name: string;
  email: string;
  position: string[];
  department: string[];
  salary: number;
}

interface EmployeeDirectoryProps {
  users: UserData[];
}

export default function EmployeeDirectory({ users }: EmployeeDirectoryProps) {
  // Helper function to get department progression
  const getDepartmentProgression = (departments: string[]) => {
    if (departments.length <= 1) {
      return {
        current: departments[0] || "N/A",
        previous: [],
        hasProgression: false,
      };
    }

    return {
      current: departments[departments.length - 1],
      previous: departments.slice(0, -1),
      hasProgression: true,
    };
  };

  return (
    <Card className="bg-[#081229]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Employee Directory
        </CardTitle>
        <CardDescription>{users.length} employees found</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => {
            const { current, previous, hasProgression } =
              getDepartmentProgression(user.department);

            return (
              <Card
                key={user.id}
                className="group hover:shadow-lg transition-all duration-300 bg-gray-800 border-gray-700"
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{user.name}</h3>
                        <Star className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {user.position[0]}
                        {user.position.length > 1 && (
                          <span className="text-xs">
                            {" "}
                            +{user.position.length - 1} more
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Department Progression */}
                  <div className="mb-4 p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Department Journey
                      </span>
                    </div>

                    {hasProgression ? (
                      <div className="space-y-2">
                        {/* Previous departments */}
                        <div className="flex flex-wrap items-center gap-2">
                          {previous.map((dept, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1"
                            >
                              <Badge
                                variant="secondary"
                                className="text-xs opacity-60"
                              >
                                {dept}
                              </Badge>
                              {index < previous.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge
                            variant="default"
                            className="text-xs font-semibold"
                          >
                            {current} (Current)
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Career progression through {user.department.length}{" "}
                          departments
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Badge variant="default" className="text-xs">
                          {current} (Current)
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          No department changes recorded
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex flex-col">
                        {user.position.map((pos, index) => (
                          <span
                            key={index}
                            className="text-muted-foreground text-xs"
                          >
                            {pos}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">
                        Currently in {current}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm pt-2 border-t">
                      <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-semibold">
                        ${user.salary?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {users.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No employees found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

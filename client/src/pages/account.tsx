import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useLogoutMutation } from "@/hooks/use-auth";

export default function Account() {
  const { user } = useAuthContext();
  const logoutMutation = useLogoutMutation();
  const [, navigate] = useLocation();

  return (
    <div className="px-6 py-10 space-y-6">
      <Card className="rounded-organic stone-shadow border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-stone-700 text-2xl font-serif">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-stone-600">
          <div>
            <p className="text-sm text-stone-400">Email</p>
            <p className="text-base font-medium">{user?.email ?? "Unknown"}</p>
          </div>
          <div className="pt-2 space-y-3">
            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={() => navigate("/support")}
            >
              Contact Support
            </Button>
            <Button
              className="w-full rounded-full"
              variant="destructive"
              disabled={logoutMutation.isPending}
              onClick={() =>
                logoutMutation.mutate(undefined, {
                  onSuccess: () => navigate("/login"),
                })
              }
            >
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

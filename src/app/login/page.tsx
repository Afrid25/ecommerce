import { Suspense } from "react";
import LoginCardSection from "@/components/ui/login-signup";
import { googleAuthEnabled, phoneAuthEnabled } from "@/lib/auth-config";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginCardSection
        mode="login"
        audience="user"
        redirectTo="/profile"
        googleAuthEnabled={googleAuthEnabled}
        phoneAuthEnabled={phoneAuthEnabled}
      />
    </Suspense>
  );
}

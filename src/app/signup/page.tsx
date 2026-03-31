import LoginCardSection from "@/components/ui/login-signup";

export default function SignupPage() {
  return <LoginCardSection mode="signup" audience="user" redirectTo="/profile" />;
}

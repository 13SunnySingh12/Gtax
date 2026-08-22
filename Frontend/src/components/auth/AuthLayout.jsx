import { GradientBackground } from '@/components/ui/pipo';
import { Logo } from '@/components/ui/logo';

/**
 * Shared shell for all auth screens (Login, Signup, Forgot/Reset): the Pipo
 * vertical gradient as a full-screen background layer with the card centered
 * above it. The gradient is pointer-events-none so it never blocks inputs,
 * buttons, links, or the checkbox.
 */
export function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <GradientBackground className="h-full w-full" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 p-4">
        <Logo size={40} />
        {children}
      </div>
    </div>
  );
}

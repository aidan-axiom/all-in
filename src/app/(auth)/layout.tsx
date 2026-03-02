export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_center,oklch(0.20_0.015_260)_0%,oklch(0.13_0.008_260)_70%)]">
      {children}
    </div>
  );
}

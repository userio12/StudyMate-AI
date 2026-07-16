export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Decorative orbs */}
      <div className="orb orb-brand w-96 h-96 -top-32 -left-32 opacity-25 float-slow" />
      <div className="orb orb-violet w-80 h-80 bottom-0 -right-24 opacity-20 float-medium" />
      <div className="orb orb-cyan w-64 h-64 top-1/2 right-1/4 opacity-15 float-slow" />

      {/* Clerk Component Wrapper */}
      <div className="relative z-10 w-full max-w-[400px]">
        {children}
      </div>
    </div>
  );
}

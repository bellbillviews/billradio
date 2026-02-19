import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[hsl(0_0%_5%)] text-[hsl(0_0%_95%)] flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-0 overflow-auto">
        <div className="p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-[hsl(0_0%_95%)]">{title}</h1>
            {description && (
              <p className="text-[hsl(0_0%_55%)] mt-1">{description}</p>
            )}
          </div>
          <div className="dark">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

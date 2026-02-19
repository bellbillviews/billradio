import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ListenPage from "./pages/ListenPage";
import ShowsPage from "./pages/ShowsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import FaqPage from "./pages/FaqPage";
import BillboardPage from "./pages/BillboardPage";
import EventsPage from "./pages/EventsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminShows from "./pages/admin/AdminShows";
import AdminPresenters from "./pages/admin/AdminPresenters";
import AdminSocialLinks from "./pages/admin/AdminSocialLinks";
import AdminBroadcast from "./pages/admin/AdminBroadcast";
import AdminStream from "./pages/admin/AdminStream";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminBillboard from "./pages/admin/AdminBillboard";
import AdminSchedule from "./pages/admin/AdminSchedule";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/listen" element={<ListenPage />} />
            <Route path="/shows" element={<ShowsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/billboard" element={<BillboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/requests" element={<ProtectedRoute requireAdmin><AdminRequests /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/shows" element={<ProtectedRoute requireAdmin><AdminShows /></ProtectedRoute>} />
            <Route path="/admin/presenters" element={<ProtectedRoute requireAdmin><AdminPresenters /></ProtectedRoute>} />
            <Route path="/admin/social-links" element={<ProtectedRoute requireAdmin><AdminSocialLinks /></ProtectedRoute>} />
            <Route path="/admin/broadcast" element={<ProtectedRoute requireAdmin><AdminBroadcast /></ProtectedRoute>} />
            <Route path="/admin/stream" element={<ProtectedRoute requireAdmin><AdminStream /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute requireAdmin><AdminEvents /></ProtectedRoute>} />
            <Route path="/admin/media" element={<ProtectedRoute requireAdmin><AdminMedia /></ProtectedRoute>} />
            <Route path="/admin/billboard" element={<ProtectedRoute requireAdmin><AdminBillboard /></ProtectedRoute>} />
            <Route path="/admin/schedule" element={<ProtectedRoute requireAdmin><AdminSchedule /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><AdminAnalytics /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

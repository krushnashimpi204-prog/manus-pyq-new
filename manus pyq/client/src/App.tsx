import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import SearchPapers from "./pages/SearchPapers";
import AdminPapers from "./pages/AdminPapers";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminReports from "./pages/AdminReports";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminUsers from "./pages/AdminUsers";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/register"} component={Register} />
      <Route path={"/search"} component={SearchPapers} />
      <Route path={"/dashboard"} component={StudentDashboard} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/papers"} component={AdminPapers} />
      <Route path={"/admin/announcements"} component={AdminAnnouncements} />
      <Route path={"/admin/reports"} component={AdminReports} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/about"} component={About} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

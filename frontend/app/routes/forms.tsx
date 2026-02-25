import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Navbar } from "~/components/layout/navbar";
import { Footer } from "~/components/layout/footer";
import { dummyForms, type Form, type User } from "~/lib/dummy-data";
import {
  FileText,
  Search,
  Plus,
  Calendar,
  MessageSquare,
  Eye,
  ArrowRight,
} from "lucide-react";

export default function FormsListPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setForms(dummyForms);
  }, [navigate]);

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isLoggedIn={!!user}
        userName={user?.name}
        onLogout={handleLogout}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Forms</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all your created forms
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Form
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Forms Grid */}
        {filteredForms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No forms found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search query"
                : "Create your first form to get started"}
            </p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Form
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card
                key={form.id}
                className="flex flex-col hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="line-clamp-1">{form.title}</span>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {form.questions.length} questions
                    </span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {form.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(form.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {form.questions.length} questions
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Link to={`/forms/${form.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                  </Link>
                  <Link to={`/forms/${form.id}`} className="flex-1">
                    <Button className="w-full gap-2">
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

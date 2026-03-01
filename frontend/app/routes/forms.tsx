import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
import { useAuth } from "~/lib/auth-context";
import { apiService, type Form, type FormStatus, type FormQueryParams } from "~/lib/api";
import {
  FileText,
  Search,
  Plus,
  Calendar,
  MessageSquare,
  Eye,
  ArrowRight,
  Trash2,
  Edit,
  BarChart3,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const STATUS_OPTIONS: { value: FormStatus | ""; label: string }[] = [
  { value: "", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "CLOSED", label: "Closed" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
  { value: "title", label: "Title" },
];

export default function FormsListPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Filter/Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FormStatus | "">("");
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "title">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadForms();
  }, [navigate, isAuthenticated, authLoading, searchQuery, statusFilter, sortBy, sortOrder]);

  const loadForms = async () => {
    setIsLoading(true);
    
    const queryParams: FormQueryParams = {
      search: searchQuery || undefined,
      status: statusFilter || undefined,
      sortBy,
      sortOrder,
    };
    
    const result = await apiService.getForms(queryParams);
    if (result.success && result.data) {
      setForms(result.data);
    } else {
      setError(result.error || "Failed to load forms");
    }
    setIsLoading(false);
  };

  const handleDeleteForm = async (formId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
      return;
    }

    const result = await apiService.deleteForm(formId);
    if (result.success) {
      setForms(forms.filter((f) => f.id !== formId));
    } else {
      alert(result.error || "Failed to delete form");
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: FormStatus) => {
    const styles = {
      DRAFT: "bg-yellow-100 text-yellow-800",
      PUBLISHED: "bg-green-100 text-green-800",
      CLOSED: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Forms</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all your created forms
            </p>
          </div>
          <Link to="/forms/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Form
            </Button>
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Filter & Sort Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as FormStatus | "")}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "createdAt" | "updatedAt" | "title")}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Button
                      variant="outline"
                      className="w-full gap-2 justify-between"
                      onClick={toggleSortOrder}
                    >
                      {sortOrder === "desc" ? "Descending" : "Ascending"}
                      {sortOrder === "desc" ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Forms Grid */}
        {filteredForms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No forms found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter
                ? "Try adjusting your search or filters"
                : "Create your first form to get started"}
            </p>
            <Link to="/forms/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Form
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card
                key={form.id}
                className="flex flex-col hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1">{form.title}</CardTitle>
                    {getStatusBadge(form.status)}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {form.description || "No description"}
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
                      {form.questions?.length || 0} questions
                    </div>
                    {form._count?.responses !== undefined && (
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        {form._count.responses} responses
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="gap-2 flex-wrap">
                  <Link to={`/forms/${form.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Link to={`/forms/${form.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDeleteForm(form.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

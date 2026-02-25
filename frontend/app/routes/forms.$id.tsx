import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Navbar } from "~/components/layout/navbar";
import { Footer } from "~/components/layout/footer";
import { getFormById, type Form, type User, type Question } from "~/lib/dummy-data";
import {
  ArrowLeft,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle,
  Circle,
  ChevronDown,
  Edit,
  Share2,
  Trash2,
} from "lucide-react";

export default function FormDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Get form by ID
    const formData = getFormById(id || "");
    if (!formData) {
      navigate("/forms");
      return;
    }
    setForm(formData);
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getQuestionTypeLabel = (type: Question["questionType"]) => {
    const labels = {
      SHORT_ANSWER: "Short Answer",
      LONG_ANSWER: "Long Answer",
      MULTIPLE_CHOICE: "Multiple Choice",
      CHECKBOX: "Checkbox",
      DROPDOWN: "Dropdown",
    };
    return labels[type];
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!form) {
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
      <Navbar
        isLoggedIn={!!user}
        userName={user?.name}
        onLogout={handleLogout}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/forms"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Forms
        </Link>

        {/* Form Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
              <p className="text-muted-foreground text-lg">{form.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created: {formatDate(form.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {form.questions.length} Questions
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Questions Preview */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Form Questions (Read-Only Preview)
          </h2>

          {form.questions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  This form has no questions yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {form.questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                            {getQuestionTypeLabel(question.questionType)}
                          </span>
                          {question.required && (
                            <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-lg">
                          {question.questionText}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Render question preview based on type */}
                    {question.questionType === "SHORT_ANSWER" && (
                      <Input
                        placeholder="Short answer text"
                        disabled
                        className="bg-muted"
                      />
                    )}

                    {question.questionType === "LONG_ANSWER" && (
                      <textarea
                        placeholder="Long answer text"
                        disabled
                        className="w-full min-h-[100px] rounded-md border border-input bg-muted px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    )}

                    {question.questionType === "MULTIPLE_CHOICE" && (
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <label
                            key={optIndex}
                            className="flex items-center gap-3 p-3 rounded-md border bg-muted/50 cursor-not-allowed"
                          >
                            <Circle className="h-4 w-4 text-muted-foreground" />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.questionType === "CHECKBOX" && (
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <label
                            key={optIndex}
                            className="flex items-center gap-3 p-3 rounded-md border bg-muted/50 cursor-not-allowed"
                          >
                            <div className="h-4 w-4 rounded border border-input" />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.questionType === "DROPDOWN" && (
                      <div className="relative">
                        <select
                          disabled
                          className="w-full h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm appearance-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select an option</option>
                          {question.options?.map((option, optIndex) => (
                            <option key={optIndex} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Form Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Questions</CardDescription>
              <CardTitle className="text-3xl">{form.questions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Required Questions</CardDescription>
              <CardTitle className="text-3xl">
                {form.questions.filter((q) => q.required).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Optional Questions</CardDescription>
              <CardTitle className="text-3xl">
                {form.questions.filter((q) => !q.required).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

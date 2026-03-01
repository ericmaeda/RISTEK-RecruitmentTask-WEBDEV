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
import { useAuth } from "~/lib/auth-context";
import { apiService, type FormWithQuestions, type Question } from "~/lib/api";
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
  Send,
  BarChart3,
  Lock,
} from "lucide-react";

export default function FormDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Response submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [responses, setResponses] = useState<Record<number, string | string[]>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadForm();
  }, [id, authLoading, isAuthenticated]);

  const loadForm = async () => {
    setIsLoading(true);
    const result = await apiService.getForm(Number(id));
    if (result.success && result.data) {
      setForm(result.data);
    } else {
      setError(result.error || "Failed to load form");
    }
    setIsLoading(false);
  };

  const handleSubmitResponse = async () => {
    if (!form) return;

    // Validate required questions
    const requiredQuestions = form.questions?.filter((q) => q.required) || [];
    for (const question of requiredQuestions) {
      const response = responses[question.id];
      if (!response || (Array.isArray(response) && response.length === 0)) {
        alert(`Please answer the required question: ${question.questionText}`);
        return;
      }
    }

    setIsSubmitting(true);
    
    const responseData = Object.entries(responses).map(([questionId, answer]) => ({
      questionId: Number(questionId),
      answer,
    }));

    const result = await apiService.submitResponse(Number(id), responseData);
    
    if (result.success) {
      setSubmitSuccess(true);
      setResponses({});
      // Reload to get updated response count
      loadForm();
    } else {
      alert(result.error || "Failed to submit response");
    }
    setIsSubmitting(false);
  };

  const handleResponseChange = (questionId: number, value: string | string[]) => {
    setResponses({ ...responses, [questionId]: value });
  };

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

  if (error || !form) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || "Form not found"}</p>
            <Link to="/forms">
              <Button>Back to Forms</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if form is published
  const isFormOpen = form.status === "PUBLISHED";

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto mt-20">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Response Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your response. Your answers have been recorded.
              </p>
              <div className="space-y-2">
                <Link to="/forms">
                  <Button className="w-full">Back to Forms</Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSubmitSuccess(false)}
                >
                  Submit Another Response
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
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
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{form.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  form.status === "DRAFT" ? "bg-yellow-100 text-yellow-800" :
                  form.status === "PUBLISHED" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {form.status}
                </span>
              </div>
              <p className="text-muted-foreground text-lg">{form.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created: {formatDate(form.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {form.questions?.length || 0} Questions
                </div>
                {form._count?.responses !== undefined && (
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    {form._count.responses} Responses
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Link to={`/forms/${form.id}/edit`}>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Form Closed Message */}
        {!isFormOpen && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="py-6 text-center">
              <Lock className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                {form.status === "CLOSED" ? "Form is Closed" : "Form is in Draft"}
              </h2>
              <p className="text-yellow-700">
                {form.status === "CLOSED" 
                  ? "This form is no longer accepting responses."
                  : "This form is not yet published and cannot accept responses."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Questions Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Questions
          </h2>

          {(!form.questions || form.questions.length === 0) ? (
            <Card>
              <CardContent className="py-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  This form has no questions yet.
                </p>
                <Link to={`/forms/${form.id}/edit`}>
                  <Button className="mt-4 gap-2">
                    <Edit className="h-4 w-4" />
                    Add Questions
                  </Button>
                </Link>
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
                    {/* Render question input based on type - disabled if form is not open */}
                    {question.questionType === "SHORT_ANSWER" && (
                      <Input
                        placeholder="Short answer text"
                        value={(responses[question.id] as string) || ""}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        disabled={!isFormOpen}
                      />
                    )}

                    {question.questionType === "LONG_ANSWER" && (
                      <textarea
                        placeholder="Long answer text"
                        value={(responses[question.id] as string) || ""}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        disabled={!isFormOpen}
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                      />
                    )}

                    {question.questionType === "MULTIPLE_CHOICE" && (
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <label
                            key={optIndex}
                            className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                              isFormOpen ? "hover:bg-muted/50" : "opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={responses[question.id] === option}
                              onChange={(e) => handleResponseChange(question.id, e.target.value)}
                              disabled={!isFormOpen}
                              className="h-4 w-4"
                            />
                            <Circle className={`h-4 w-4 ${responses[question.id] === option ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
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
                            className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                              isFormOpen ? "hover:bg-muted/50" : "opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <input
                              type="checkbox"
                              value={option}
                              checked={((responses[question.id] as string[]) || []).includes(option)}
                              onChange={(e) => {
                                const current = (responses[question.id] as string[]) || [];
                                if (e.target.checked) {
                                  handleResponseChange(question.id, [...current, option]);
                                } else {
                                  handleResponseChange(question.id, current.filter((o) => o !== option));
                                }
                              }}
                              disabled={!isFormOpen}
                              className="h-4 w-4"
                            />
                            <div className={`h-4 w-4 rounded border ${((responses[question.id] as string[]) || []).includes(option) ? 'bg-primary border-primary' : 'border-input'}`}>
                              {((responses[question.id] as string[]) || []).includes(option) && (
                                <CheckCircle className="h-4 w-4 text-primary-foreground" />
                              )}
                            </div>
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.questionType === "DROPDOWN" && (
                      <div className="relative">
                        <select
                          value={(responses[question.id] as string) || ""}
                          onChange={(e) => handleResponseChange(question.id, e.target.value)}
                          disabled={!isFormOpen}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 appearance-none disabled:opacity-50"
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

              {/* Submit Button */}
              {isFormOpen && (
                <Button
                  onClick={handleSubmitResponse}
                  disabled={isSubmitting}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit Response"}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Form Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Questions</CardDescription>
              <CardTitle className="text-3xl">{form.questions?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Required Questions</CardDescription>
              <CardTitle className="text-3xl">
                {form.questions?.filter((q) => q.required).length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Responses</CardDescription>
              <CardTitle className="text-3xl">
                {form._count?.responses || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

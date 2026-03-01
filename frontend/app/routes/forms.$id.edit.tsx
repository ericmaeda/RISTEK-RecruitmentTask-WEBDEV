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
import { apiService, type FormWithQuestions, type Question, type FormStatus } from "~/lib/api";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  FileText,
  Eye,
  ArrowRight,
  Send,
  Ban,
} from "lucide-react";

type QuestionType = "SHORT_ANSWER" | "LONG_ANSWER" | "MULTIPLE_CHOICE" | "CHECKBOX" | "DROPDOWN";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "LONG_ANSWER", label: "Long Answer" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "CHECKBOX", label: "Checkbox" },
  { value: "DROPDOWN", label: "Dropdown" },
];

export default function EditFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [constraintError, setConstraintError] = useState("");
  
  // Question editing state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  
  // New question form
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionType: "SHORT_ANSWER" as QuestionType,
    options: "",
    required: false,
  });

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
      setQuestions(result.data.questions || []);
    } else {
      setError(result.error || "Failed to load form");
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (newStatus: FormStatus) => {
    if (!form) return;
    
    setIsSaving(true);
    setError("");
    setConstraintError("");
    
    const result = await apiService.updateForm(form.id, { status: newStatus });
    
    if (result.success && result.data) {
      setForm({ ...form, status: newStatus });
      setSuccess(`Form ${newStatus.toLowerCase()} successfully`);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error || `Failed to ${newStatus.toLowerCase()} form`);
    }
    setIsSaving(false);
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.questionText.trim()) {
      setError("Question text is required");
      return;
    }

    // Check if form has responses (constraint)
    if (form && form._count && form._count.responses > 0) {
      setConstraintError("Cannot add questions to a form that already has submissions. Please create a new form instead.");
      return;
    }

    // For question types that need options, validate
    const needsOptions = ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(newQuestion.questionType);
    if (needsOptions && !newQuestion.options.trim()) {
      setError("Options are required for this question type");
      return;
    }

    setIsSaving(true);
    setError("");

    const options = needsOptions
      ? newQuestion.options.split("\n").map((o) => o.trim()).filter((o) => o)
      : [];

    const result = await apiService.createQuestion(Number(id), {
      questionText: newQuestion.questionText,
      questionType: newQuestion.questionType,
      options: needsOptions ? options : undefined,
      required: newQuestion.required,
    });

    if (result.success && result.data) {
      setQuestions([...questions, result.data]);
      setNewQuestion({
        questionText: "",
        questionType: "SHORT_ANSWER",
        options: "",
        required: false,
      });
      setShowAddQuestion(false);
      setSuccess("Question added successfully");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error || "Failed to add question");
    }
    setIsSaving(false);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    // Check if form has responses (constraint)
    if (form && form._count && form._count.responses > 0) {
      setConstraintError("Cannot delete questions from a form that already has submissions. This would invalidate existing responses.");
      return;
    }

    if (!confirm("Are you sure you want to delete this question?")) return;

    setIsSaving(true);
    const result = await apiService.deleteQuestion(questionId);
    if (result.success) {
      setQuestions(questions.filter((q) => q.id !== questionId));
      setSuccess("Question deleted");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error || "Failed to delete question");
    }
    setIsSaving(false);
  };

  const handleUpdateQuestion = async (questionId: number, data: {
    questionText?: string;
    questionType?: string;
    options?: string[];
    required?: boolean;
  }) => {
    // Check if form has responses and question type is being changed (constraint)
    if (form && form._count && form._count.responses > 0 && data.questionType) {
      const originalQuestion = questions.find(q => q.id === questionId);
      if (originalQuestion && originalQuestion.questionType !== data.questionType) {
        setConstraintError("Cannot change question type for a form that already has submissions. This would invalidate existing responses.");
        return;
      }
    }

    setIsSaving(true);
    const result = await apiService.updateQuestion(questionId, data);
    if (result.success && result.data) {
      setQuestions(questions.map((q) => (q.id === questionId ? result.data! : q)));
      setEditingQuestionId(null);
      setSuccess("Question updated");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error || "Failed to update question");
    }
    setIsSaving(false);
  };

  const handleSaveForm = async () => {
    if (!form) return;
    
    setIsSaving(true);
    setError("");
    
    const result = await apiService.updateForm(form.id, {
      title: form.title,
      description: form.description || undefined,
    });
    
    if (result.success) {
      setSuccess("Form saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error || "Failed to save form");
    }
    setIsSaving(false);
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

  if (!form) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>Form not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const hasResponses = form._count && form._count.responses > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/forms"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Edit Form</h1>
              <p className="text-muted-foreground mt-1">
                Add, edit, or remove questions from your form
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to={`/forms/${form.id}`}>
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </Link>
            <Button onClick={handleSaveForm} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Form"}
            </Button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        {constraintError && (
          <div className="bg-yellow-500/10 text-yellow-600 px-4 py-3 rounded-md mb-4">
            {constraintError}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-md mb-4">
            {success}
          </div>
        )}

        {/* Form Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Form Status</CardTitle>
            <CardDescription>Manage your form's visibility and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  form.status === "DRAFT" ? "bg-yellow-100 text-yellow-800" :
                  form.status === "PUBLISHED" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {form.status}
                </span>
              </div>
              <div className="flex gap-2 ml-auto">
                {form.status === "DRAFT" && (
                  <Button 
                    onClick={() => handleStatusChange("PUBLISHED")} 
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Publish Form
                  </Button>
                )}
                {form.status === "PUBLISHED" && (
                  <Button 
                    onClick={() => handleStatusChange("CLOSED")} 
                    disabled={isSaving}
                    variant="outline"
                    className="gap-2"
                  >
                    <Ban className="h-4 w-4" />
                    Close Form
                  </Button>
                )}
                {form.status === "CLOSED" && (
                  <Button 
                    onClick={() => handleStatusChange("PUBLISHED")} 
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Reopen Form
                  </Button>
                )}
              </div>
            </div>
            {form._count?.responses ? (
              <div className="text-sm text-muted-foreground">
                This form has {form._count.responses} response(s). Some actions are restricted to protect data integrity.
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Form Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Questions ({questions.length})
            </h2>
            <Button
              onClick={() => setShowAddQuestion(!showAddQuestion)}
              className="gap-2"
              disabled={hasResponses}
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>

          {/* Add Question Form */}
          {showAddQuestion && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Add New Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="questionText">Question Text *</Label>
                  <Input
                    id="questionText"
                    placeholder="Enter your question..."
                    value={newQuestion.questionText}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, questionText: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionType">Question Type</Label>
                  <select
                    id="questionType"
                    value={newQuestion.questionType}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, questionType: e.target.value as QuestionType })
                    }
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(
                  newQuestion.questionType
                ) && (
                  <div className="space-y-2">
                    <Label htmlFor="options">Options (one per line) *</Label>
                    <textarea
                      id="options"
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      value={newQuestion.options}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, options: e.target.value })
                      }
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newQuestion.required}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, required: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="required" className="font-normal">
                    Required question
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddQuestion}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {isSaving ? "Adding..." : "Add Question"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddQuestion(false)}
                    className="gap-2"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions List */}
          {questions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No questions yet. Click "Add Question" to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                            {QUESTION_TYPES.find((t) => t.value === question.questionType)?.label}
                          </span>
                          {question.required && (
                            <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        {editingQuestionId === question.id ? (
                          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={question.questionText}
                              onChange={(e) =>
                                setQuestions(
                                  questions.map((q) =>
                                    q.id === question.id
                                      ? { ...q, questionText: e.target.value }
                                      : q
                                  )
                                )
                              }
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateQuestion(question.id, {
                                    questionText: question.questionText,
                                    questionType: question.questionType,
                                    options: question.options,
                                    required: question.required,
                                  })
                                }
                                disabled={isSaving}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingQuestionId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <CardTitle
                            className="text-lg cursor-pointer hover:text-primary"
                            onClick={() => !hasResponses && setEditingQuestionId(question.id)}
                          >
                            {question.questionText}
                          </CardTitle>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteQuestion(question.id)}
                        disabled={isSaving || hasResponses}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {question.options && question.options.length > 0 && (
                    <CardContent>
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <span>•</span>
                            {option}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

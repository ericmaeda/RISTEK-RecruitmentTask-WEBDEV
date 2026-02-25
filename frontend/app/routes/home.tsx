import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Navbar } from "~/components/layout/navbar";
import { Footer } from "~/components/layout/footer";
import {
  FileText,
  Zap,
  Shield,
  BarChart,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description:
        "Create forms in minutes with our intuitive drag-and-drop builder.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description:
        "Your data is encrypted and protected with enterprise-grade security.",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Powerful Analytics",
      description:
        "Get insights with real-time analytics and response tracking.",
    },
  ];

  const benefits = [
    "Unlimited forms and responses",
    "Custom branding options",
    "Advanced question types",
    "Real-time collaboration",
    "Export to CSV, PDF, and more",
    "API access for integrations",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
                <FileText className="h-4 w-4" />
                FormBuilder - Create forms effortlessly
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Build beautiful forms{" "}
                <span className="text-primary">in minutes</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
                Create stunning forms, surveys, and questionnaires with our
                easy-to-use platform. No coding required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Everything you need to build forms
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform provides all the tools you need to create, share,
                and analyze your forms.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-background">
                  <CardHeader>
                    <div className="rounded-lg bg-primary/10 w-fit p-3 mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Why choose FormBuilder?
                </h2>
                <p className="text-muted-foreground mb-8">
                  We've built the most comprehensive form building platform with
                  features that help you collect better data and make smarter
                  decisions.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link to="/register">
                    <Button className="gap-2">
                      Start Building for Free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="text-lg">
                      Customer Feedback Survey
                    </CardTitle>
                    <CardDescription>
                      Preview of a sample form
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        What is your name?
                      </label>
                      <div className="h-10 rounded-md border bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        How satisfied are you?
                      </label>
                      <div className="space-y-2">
                        {["Very Satisfied", "Satisfied", "Neutral"].map(
                          (option) => (
                            <div
                              key={option}
                              className="flex items-center gap-2 p-2 rounded border bg-muted/50"
                            >
                              <div className="h-4 w-4 rounded-full border" />
                              <span className="text-sm">{option}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to create your first form?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust FormBuilder for their data
              collection needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

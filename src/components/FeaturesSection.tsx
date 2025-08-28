import { Brain, BookOpen, Users, Zap, Target, Layers } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Brain,
    title: "Neural Learning Pathways",
    description: "Scientifically-designed content paths that mirror how the brain processes and retains information for optimal learning outcomes."
  },
  {
    icon: BookOpen,
    title: "Interactive Modules",
    description: "Rich, multimedia content modules with embedded assessments, interactive elements, and adaptive learning features."
  },
  {
    icon: Users,
    title: "Collaborative Learning",
    description: "Connect with peers and experts through integrated discussion forums, study groups, and collaborative projects."
  },
  {
    icon: Zap,
    title: "Real-time Analytics",
    description: "Track your learning progress with detailed analytics and personalized recommendations for improvement."
  },
  {
    icon: Target,
    title: "Adaptive Assessment",
    description: "AI-powered assessments that adapt to your knowledge level and provide targeted feedback for continuous improvement."
  },
  {
    icon: Layers,
    title: "Hierarchical Content",
    description: "Structured learning with clear progressions from fundamental concepts to advanced applications in cognitive science."
  }
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-neural-primary mb-4">
            Advanced Learning Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience the future of education with our scientifically-backed learning platform 
            designed specifically for brain and cognitive sciences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="cognitive-card h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-neural">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

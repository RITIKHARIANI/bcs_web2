import Image from "next/image"
import { Clock, Users, BookOpen, ArrowRight, Star } from "lucide-react"
import { NeuralButton } from "./ui/neural-button"
import { Badge } from "./ui/badge"

interface CourseCardProps {
  title: string
  description: string
  instructor: string
  duration: string
  students: number
  rating: number
  level: "Beginner" | "Intermediate" | "Advanced"
  image: string
  topics: string[]
}

export function CourseCard({
  title,
  description,
  instructor,
  duration,
  students,
  rating,
  level,
  image,
  topics
}: CourseCardProps) {
  const levelColors = {
    Beginner: "bg-cognition-green/10 text-cognition-green border-cognition-green/20",
    Intermediate: "bg-cognition-orange/10 text-cognition-orange border-cognition-orange/20",
    Advanced: "bg-synapse-primary/10 text-synapse-primary border-synapse-primary/20"
  }

  return (
    <div className="cognitive-card group cursor-pointer overflow-hidden">
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image}
          alt={`${title} course visualization`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neural-deep/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Badge className={`absolute top-3 left-3 ${levelColors[level]}`}>
          {level}
        </Badge>
        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-background/80 backdrop-blur px-2 py-1 rounded-full">
          <Star className="h-3 w-3 fill-cognition-orange text-cognition-orange" />
          <span className="text-xs font-medium">{rating}</span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        <h3 className="mb-2 text-xl font-semibold text-neural-primary group-hover:text-synapse-primary transition-colors">
          {title}
        </h3>
        
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Topics */}
        <div className="mb-4 flex flex-wrap gap-2">
          {topics.slice(0, 3).map((topic) => (
            <Badge key={topic} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
          {topics.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{topics.length - 3} more
            </Badge>
          )}
        </div>

        {/* Course Meta */}
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{students.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mb-4 text-sm">
          <span className="text-muted-foreground">By </span>
          <span className="font-medium text-neural-primary">{instructor}</span>
        </div>

        {/* Action */}
        <NeuralButton variant="ghost" className="w-full justify-between group-hover:bg-neural-subtle">
          <span className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            Start Learning
          </span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </NeuralButton>
      </div>
    </div>
  )
}
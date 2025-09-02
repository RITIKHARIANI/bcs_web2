import Link from "next/link"
import { Brain, Github, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-neural">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-neural-primary">NeuroLearn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Advancing education through innovative neuroscience-based learning platforms.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-neural-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-neural-primary transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-neural-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-neural-primary transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Courses */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Courses</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="text-muted-foreground hover:text-neural-primary transition-colors">
                  Browse All Courses
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-muted-foreground hover:text-neural-primary transition-colors">
                  Neuroscience Fundamentals
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-muted-foreground hover:text-neural-primary transition-colors">
                  Cognitive Psychology
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-muted-foreground hover:text-neural-primary transition-colors">
                  Memory & Learning
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-neural-primary transition-colors">
                  Research Papers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-neural-primary transition-colors">
                  Study Guides
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-neural-primary transition-colors">
                  Interactive Simulations
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-neural-primary transition-colors">
                  Discussion Forums
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-neural-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-neural-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-muted-foreground hover:text-neural-primary transition-colors">
                  Faculty Login
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-neural-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 NeuroLearn. All rights reserved. Built for advancing cognitive science education.
          </p>
        </div>
      </div>
    </footer>
  )
}

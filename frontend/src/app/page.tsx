import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Film, Gamepad2, Sparkles, Upload, Wand2, Play, ArrowRight, Check, Star } from "lucide-react"

function Navbar({ session }: { session: any }) {
  return (
    <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AI Studio</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">How it works</a>
          <a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</a>
          <a href="#faq" className="text-muted-foreground hover:text-foreground transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Get Started Free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="container relative mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm mb-8">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Powered by GPT-4o, Claude & Veo 3.1</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Turn Your Book Into
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"> Film, Animation & Games</span>
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload any book. AI assistants extract characters, locations, and scenes — then generate screenplay, storyboard, and video clips automatically.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8 h-14 gap-2">
              <Upload className="h-5 w-5" />
              Upload Your Book
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="outline" className="text-lg px-8 h-14 gap-2">
              <Play className="h-5 w-5" />
              See How It Works
            </Button>
          </a>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Free plan available. No credit card required.</p>

        <div className="mt-16 relative mx-auto max-w-5xl">
          <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">AI Studio — Project Dashboard</span>
            </div>
            <div className="p-8 bg-gradient-to-br from-card to-muted/20 min-h-[300px] flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                <div className="rounded-lg border bg-background p-6 text-left">
                  <BookOpen className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold">Story Analysis</h3>
                  <p className="text-sm text-muted-foreground mt-1">12 characters, 8 locations, 24 scenes extracted</p>
                  <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-full bg-primary rounded-full" />
                  </div>
                </div>
                <div className="rounded-lg border bg-background p-6 text-left">
                  <Film className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold">Screenplay</h3>
                  <p className="text-sm text-muted-foreground mt-1">3-act structure, 24 scenes with dialogues</p>
                  <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-3/4 bg-primary rounded-full" />
                  </div>
                </div>
                <div className="rounded-lg border bg-background p-6 text-left">
                  <Wand2 className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold">Video Generation</h3>
                  <p className="text-sm text-muted-foreground mt-1">48 clips rendered, assembly in progress</p>
                  <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-1/2 bg-primary rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    { icon: Upload, title: "Upload Your Book", desc: "Drop any .docx, .pdf, or .txt file. AI parses text and extracts the full story structure.", num: "01" },
    { icon: BookOpen, title: "AI Extracts Everything", desc: "Characters with descriptions, locations with visual details, scenes broken into 3-act structure — all automatic.", num: "02" },
    { icon: Film, title: "Generate Screenplay", desc: "Script Assistant writes dialogues, stage directions, and camera notes for every scene.", num: "03" },
    { icon: Wand2, title: "Create Video Clips", desc: "Vision Assistant generates prompts for Veo 3.1 / Runway. Render cinematic clips with one click.", num: "04" },
  ]
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Book to Film in 4 Steps</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">From uploaded manuscript to rendered video clips — fully automated pipeline.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((s, i) => (
            <div key={i} className="relative group">
              <div className="rounded-xl border bg-card p-8 h-full hover:shadow-lg transition-shadow">
                <span className="text-6xl font-bold text-muted/30">{s.num}</span>
                <s.icon className="h-10 w-10 text-primary mt-4" />
                <h3 className="text-xl font-semibold mt-4">{s.title}</h3>
                <p className="text-muted-foreground mt-2">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/40 z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    { icon: BookOpen, title: "Smart Book Parser", desc: "Handles novels, short stories, screenplays. Extracts characters, locations, and plot arcs automatically." },
    { icon: Sparkles, title: "AI Orchestrator", desc: "Multi-agent system coordinates Story, Script, and Vision assistants. Each specialist handles its domain." },
    { icon: Film, title: "Screenplay Generation", desc: "Professional-grade scripts with dialogue, action, camera directions. Edit inline or regenerate any scene." },
    { icon: Wand2, title: "Video Clip Rendering", desc: "AI generates prompts optimized for Veo 3.1. Cinematic shots with consistent characters across scenes." },
    { icon: Gamepad2, title: "Game Assets (v2)", desc: "Coming soon: game design documents, character sprites, level layouts from the same source material." },
    { icon: Play, title: "Assembly & Export", desc: "Stitch clips together, add audio and subtitles. Export as MP4 or share your project publicly." },
  ]
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Everything You Need</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">A complete studio for transforming literary IP into multimedia content.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="rounded-xl border bg-card p-8 hover:shadow-lg transition-shadow group">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mt-4">{f.title}</h3>
              <p className="text-muted-foreground mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  const plans = [
    { name: "Free", price: "$0", period: "", desc: "Try the platform", features: ["1 project", "5 scenes max", "Story assistant", "Watermark on renders"], cta: "Get Started", popular: false },
    { name: "Creator", price: "$29", period: "/mo", desc: "For indie authors", features: ["3 projects", "All AI assistants", "15 renders/month", "No watermark", "Priority support"], cta: "Start Creating", popular: true },
    { name: "Pro", price: "$79", period: "/mo", desc: "For serious creators", features: ["10 projects", "50 renders/month", "Assembly module", "Priority render queue", "API access"], cta: "Go Pro", popular: false },
    { name: "Studio", price: "$249", period: "/mo", desc: "For studios & teams", features: ["Unlimited projects", "150 renders/month", "Game module", "White-label", "Dedicated support"], cta: "Contact Sales", popular: false },
  ]
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Simple Pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground">Start free. Scale as you grow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((p, i) => (
            <div key={i} className={`rounded-xl border bg-card p-8 flex flex-col ${p.popular ? "ring-2 ring-primary shadow-lg relative" : ""}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="mt-8">
                <Button className="w-full" variant={p.popular ? "default" : "outline"}>{p.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const faqs = [
    { q: "What file formats are supported?", a: "We support .docx, .pdf, .txt, and .epub files. Any book or manuscript in these formats works." },
    { q: "How long does it take to process a book?", a: "Analysis takes 2-5 minutes depending on book length. Screenplay generation is ~1 minute per scene. Video rendering is 30-60 seconds per clip." },
    { q: "Can I edit the generated content?", a: "Everything is editable — characters, scenes, scripts, video prompts. Regenerate any single element without affecting the rest." },
    { q: "What video models are used?", a: "We integrate with Google Veo 3.1 for video generation, with Runway Gen-4 support coming soon." },
    { q: "Do I own the content I create?", a: "Yes. You retain full rights to all generated content including screenplays, storyboards, and video clips." },
  ]
  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">FAQ</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <details key={i} className="group rounded-xl border bg-card">
              <summary className="flex cursor-pointer items-center justify-between p-6 font-medium">
                {f.q}
                <span className="ml-4 text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-6 pb-6 text-muted-foreground">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold">Ready to Bring Your Story to Life?</h2>
        <p className="mt-4 text-xl opacity-90 max-w-xl mx-auto">Upload your book today and let AI transform it into a cinematic experience.</p>
        <Link href="/login">
          <Button size="lg" variant="secondary" className="mt-8 text-lg px-8 h-14">
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-bold">AI Studio</span>
            </div>
            <p className="text-sm text-muted-foreground">Transform literary IP into film, animation, and games with AI.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#faq" className="hover:text-foreground transition">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AI Studio. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar session={session} />
        <main className="flex flex-1 items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome back, {session.user.name || "Creator"}</h1>
            <p className="mt-2 text-muted-foreground">Continue working on your projects</p>
            <Link href="/dashboard">
              <Button className="mt-6" size="lg">Open Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar session={session} />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  )
}

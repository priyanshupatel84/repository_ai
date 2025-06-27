import { User } from "lucide-react"

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-6">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl text-foreground">User Benefits</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            "Save time reviewing commit histories",
            "Gain deeper insights into your projects",
            "Boost team collaboration with summarized data",
          ].map((benefit, index) => (
            <div key={index} className="rounded-lg bg-card p-6 shadow-md border">
              <User className="mb-4 h-12 w-12 text-accent" />
              <p className="text-card-foreground">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

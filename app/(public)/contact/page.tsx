import PublicLayout from '@/components/layouts/PublicLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import PageHero from '@/components/cosmos/PageHero'

export default function ContactPage() {
  return (
    <PublicLayout currentPath="/contact">
      <PageHero
        planet="uranus"
        title="Get in touch"
        description="A question, an idea or a bug to report? Write to us and we'll reply, usually within a day."
      />

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl">
          {/* Contact Form */}
          <div className="rounded-3xl border border-[var(--orbit-line)] bg-surface p-7">
            <h2 className="mb-6 font-serif text-2xl text-content">Send us a message</h2>
            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-content-secondary">Name</label>
                <Input type="text" placeholder="Your name" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-content-secondary">Email</label>
                <Input type="email" placeholder="your@email.com" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-content-secondary">Message</label>
                <Textarea placeholder="How can we help?" rows={6} />
              </div>
              <Button fullWidth>Send message</Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="mb-2 font-serif text-xl text-content">Email</h3>
              <a href="mailto:hello@monalo.com" className="text-blue-600 hover:underline">
                hello@monalo.com
              </a>
            </div>
            <div>
              <h3 className="mb-2 font-serif text-xl text-content">Feedback</h3>
              <p className="text-content-secondary">
                Found a bug? Have a feature idea? We're always listening. Send us your thoughts.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-serif text-xl text-content">Response time</h3>
              <p className="text-content-secondary">
                We typically respond within 24 hours. Thank you for reaching out.
              </p>
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}

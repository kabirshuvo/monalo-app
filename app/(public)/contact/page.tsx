import PublicLayout from '@/components/layouts/PublicLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

export default function ContactPage() {
  return (
    <PublicLayout currentPath="/contact">
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 space-y-3">
          <p className="text-sm font-semibold text-blue-600">Contact</p>
          <h1 className="text-3xl font-bold text-gray-900">Get in Touch</h1>
          <p className="text-gray-600 max-w-3xl">
            Have a question or feedback? We'd love to hear from you. Reach out anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl">
          {/* Contact Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a message</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <Input type="text" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input type="email" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <Textarea placeholder="How can we help?" rows={6} />
              </div>
              <Button fullWidth>Send message</Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <a href="mailto:hello@monalo.com" className="text-blue-600 hover:underline">
                hello@monalo.com
              </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h3>
              <p className="text-gray-600">
                Found a bug? Have a feature idea? We're always listening. Send us your thoughts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Response time</h3>
              <p className="text-gray-600">
                We typically respond within 24 hours. Thank you for reaching out.
              </p>
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}

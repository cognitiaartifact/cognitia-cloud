import { Zap, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border/30 py-16">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground">
                Cognitia<span className="text-primary"> AI</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mb-6">
              We build intelligent automation systems that help businesses save time,
              reduce costs, and scale faster with AI-powered workflows.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="mailto:cognitiaartifact@gmail.com" className="flex items-center gap-2 hover:text-primary transition">
                <Mail size={14} /> cognitiaartifact@gmail.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4 text-sm">Quick Links</h4>
            <div className="space-y-3">
              {['Services', 'Process', 'Pricing', 'Contact'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="block text-sm text-muted-foreground hover:text-primary transition"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4 text-sm">Services</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Workflow Automation</p>
              <p>AI Chatbots</p>
              <p>Lead Generation</p>
              <p>CRM Integration</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Cognitia AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

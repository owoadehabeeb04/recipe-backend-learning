export default function Cta() {
    return (
      <section className="py-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Cooking Experience?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of food enthusiasts who are already cooking smarter with Recipia.
            </p>
  
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="px-8 py-3 rounded-lg bg-white text-purple-600 font-medium transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-500"
              >
                Get Started Free
              </a>
              <a
                href="#features"
                className="px-8 py-3 rounded-lg border border-white/30 text-white font-medium transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-500"
              >
                Learn More
              </a>
            </div>
  
            <p className="mt-6 text-white/80">No credit card required. Free plan available forever.</p>
          </div>
        </div>
      </section>
    )
  }
  
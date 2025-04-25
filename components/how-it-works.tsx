export default function HowItWorks() {
    const steps = [
      {
        number: "01",
        title: "Sign Up",
        description: "Create your free account to get started with Recipia.",
        color: "from-purple-400 to-purple-600",
      },
      {
        number: "02",
        title: "Create or Discover",
        description: "Create your own recipes or discover recipes from other users.",
        color: "from-pink-400 to-pink-600",
      },
      {
        number: "03",
        title: "Ask AI",
        description: "Get cooking tips, ingredient substitutions, and recipe ideas from our AI.",
        color: "from-amber-400 to-amber-600",
      },
      {
        number: "04",
        title: "Plan Your Meals",
        description: "Use our AI-powered meal planner to organize your weekly meals.",
        color: "from-emerald-400 to-emerald-600",
      },
    ]
  
    return (
      <section className="py-20" id="how-it-works">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Recipia Works</h2>
            <p className="text-lg text-gray-600">
              Get started in minutes and transform your cooking experience with these simple steps.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-200 -z-10"></div>
                )}
  
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-full flex flex-col">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-xl font-bold mb-5`}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
  
          <div className="mt-16 text-center">
            <a
              href="#"
              className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700 transition-colors"
            >
              <span>Learn more about our process</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-2"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </a>
          </div>
        </div>
      </section>
    )
  }
  
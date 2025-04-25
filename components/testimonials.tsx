export default function Testimonials() {
    const testimonials = [
      {
        quote:
          "Recipia has completely transformed how I plan my weekly meals. The AI suggestions are spot-on and I've discovered so many new recipes I love!",
        author: "Sarah Johnson",
        role: "Home Cook",
        avatar: "/placeholder.svg?height=80&width=80",
      },
      {
        quote:
          "As someone with dietary restrictions, finding recipes used to be a challenge. Recipia's AI understands my needs and suggests perfect alternatives.",
        author: "Michael Chen",
        role: "Fitness Enthusiast",
        avatar: "/placeholder.svg?height=80&width=80",
      },
      {
        quote:
          "The meal planning feature has saved me so much time and reduced food waste. I can't imagine going back to my old way of cooking.",
        author: "Emily Rodriguez",
        role: "Busy Parent",
        avatar: "/placeholder.svg?height=80&width=80",
      },
    ]
  
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Home Cooks Everywhere</h2>
            <p className="text-lg text-gray-600">See what our users are saying about their experience with Recipia.</p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 flex flex-col">
                <div className="mb-6">
                  <svg
                    width="45"
                    height="36"
                    viewBox="0 0 45 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-purple-200"
                  >
                    <path
                      d="M13.4 36C9.4 36 6.2 34.6667 3.8 32C1.4 29.2 0.2 25.8667 0.2 22C0.2 17.8667 1.53333 14 4.2 10.4C6.93333 6.8 10.8667 3.73333 16 1.2L19.4 6.8C15.1333 8.8 12 11.0667 10 13.6C8 16.1333 7 18.8 7 21.6C7 22.1333 7.06667 22.6667 7.2 23.2C7.33333 23.7333 7.53333 24.2667 7.8 24.8C8.73333 24 9.8 23.3333 11 22.8C12.2 22.2667 13.4667 22 14.8 22C17.7333 22 20.2 22.9333 22.2 24.8C24.2 26.6667 25.2 29.0667 25.2 32C25.2 34.9333 24.2 37.3333 22.2 39.2C20.2 41.0667 17.1333 42 13 42V36H13.4ZM32.6 36C28.6 36 25.4 34.6667 23 32C20.6 29.2 19.4 25.8667 19.4 22C19.4 17.8667 20.7333 14 23.4 10.4C26.1333 6.8 30.0667 3.73333 35.2 1.2L38.6 6.8C34.3333 8.8 31.2 11.0667 29.2 13.6C27.2 16.1333 26.2 18.8 26.2 21.6C26.2 22.1333 26.2667 22.6667 26.4 23.2C26.5333 23.7333 26.7333 24.2667 27 24.8C27.9333 24 29 23.3333 30.2 22.8C31.4 22.2667 32.6667 22 34 22C36.9333 22 39.4 22.9333 41.4 24.8C43.4 26.6667 44.4 29.0667 44.4 32C44.4 34.9333 43.4 37.3333 41.4 39.2C39.4 41.0667 36.3333 42 32.2 42V36H32.6Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
  
                <p className="text-gray-700 mb-6 flex-1">{testimonial.quote}</p>
  
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  
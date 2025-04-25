export default function AiCapabilities() {
    return (
      <section className="py-20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"></div>
  
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 order-2 lg:order-1">
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 p-1">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
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
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 16v-4"></path>
                          <path d="M12 8h.01"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium">Ask Recipia AI</h4>
                      </div>
                    </div>
  
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-700">How can I substitute eggs in a cake recipe?</p>
                      </div>
  
                      <div className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-100">
                        <p className="text-gray-700">
                          You can substitute eggs in cake recipes with several alternatives:
                        </p>
                        <ul className="mt-2 space-y-1 text-gray-700">
                          <li>• ¼ cup unsweetened applesauce per egg</li>
                          <li>• 1 tablespoon ground flaxseed mixed with 3 tablespoons water</li>
                          <li>• ¼ cup mashed banana per egg</li>
                          <li>• ¼ cup yogurt or buttermilk per egg</li>
                        </ul>
                        <p className="mt-2 text-gray-700">
                          Each substitute works best for different types of cakes. Would you like me to recommend the best
                          option for your specific recipe?
                        </p>
                      </div>
  
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-700">Yes, it's a chocolate cake recipe.</p>
                      </div>
  
                      <div className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-100">
                        <p className="text-gray-700">For a chocolate cake, I recommend using either:</p>
                        <ul className="mt-2 space-y-1 text-gray-700">
                          <li>• ¼ cup unsweetened applesauce per egg (best option)</li>
                          <li>• 1 tablespoon ground flaxseed mixed with 3 tablespoons water</li>
                        </ul>
                        <p className="mt-2 text-gray-700">
                          The applesauce will keep your cake moist and won't interfere with the chocolate flavor. The
                          flaxseed works well too but may add a slight nutty taste.
                        </p>
                      </div>
                    </div>
  
                    <div className="mt-4 relative">
                      <input
                        type="text"
                        placeholder="Ask anything about cooking..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-500 text-white p-2 rounded-md">
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
                        >
                          <path d="m22 2-7 20-4-9-9-4Z"></path>
                          <path d="M22 2 11 13"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
  
                {/* Floating elements */}
                <div className="absolute -top-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-200 rotate-3 z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-white">
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
                      >
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Smart Suggestions</p>
                      <p className="text-xs text-gray-500">Based on your preferences</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <div className="flex-1 order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Powered by Advanced AI Technology</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our AI assistant is trained on thousands of recipes, cooking techniques, and food science to provide you
                with accurate and helpful information.
              </p>
  
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path>
                      <path d="m8 16 4-4 4 4"></path>
                      <path d="M8 16v4"></path>
                      <path d="M16 16v4"></path>
                      <line x1="12" x2="12" y1="12" y2="20"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Instant Recipe Suggestions</h3>
                    <p className="text-gray-600">
                      Get personalized recipe suggestions based on ingredients you have, dietary preferences, and cooking
                      time.
                    </p>
                  </div>
                </div>
  
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-pink-500 text-white flex items-center justify-center shrink-0 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                      <path d="m14.5 9-5 5"></path>
                      <path d="m9.5 9 5 5"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Nutritional Analysis</h3>
                    <p className="text-gray-600">
                      Get detailed nutritional information for any recipe and suggestions for making recipes healthier.
                    </p>
                  </div>
                </div>
  
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04Z"></path>
                      <path d="M16.5 2A2.5 2.5 0 0 0 14 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04Z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Cooking Techniques</h3>
                    <p className="text-gray-600">
                      Learn new cooking techniques and get step-by-step guidance for complex recipes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
  
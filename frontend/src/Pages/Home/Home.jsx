import React from 'react'

const Home = () => {
  return (
    <div className="bg-slate-900 font-sans">
        {/* SECTION 1: HERO (The first code I gave you) */}
      <section className="min-h-svh flex flex-col justify-center items-center px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
          Learn with EduPath <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Upskill Faster
          </span>
        </h1>
        
        <p className="mt-4 text-lg text-gray-300 max-w-2xl">
          A free platform to build your personalized learning path and grow with verified providers.
        </p>

        {/* Decorative Wave SVG */}
        <div className="my-10 w-full max-w-md">
          <svg viewBox="0 0 500 100" className="w-full h-auto">
            <path d="M0,50 C150,110 350,-10 500,50" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition">
            Get Your Career Path →
          </button>
          <button className="bg-slate-800 text-gray-200 px-8 py-4 rounded-xl font-bold border border-slate-700 hover:bg-slate-700 transition">
            Browse Top Providers
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home
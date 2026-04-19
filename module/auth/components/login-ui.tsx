
"use client"

import { signIn } from "@/lib/auth-client"
import { useState } from "react"

const GithubIcon = () => (
  <svg
    height="20"
    width="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.2 11.4c.6.1.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.84 1.32 3.53 1.01.11-.78.42-1.32.76-1.62-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.69.83.57A12 12 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

const LoginUI = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleGithubLogin = async () => {
    setIsLoading(true)
    try {
      await signIn.social({
        provider: "github",
      })
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-linear-to-br from-zinc-950 via-black to-zinc-900 text-white">
      
      {/* LEFT */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-20">
        <div className="max-w-xl">
          
          <div className="mb-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary backdrop-blur flex items-center justify-center text-lg font-bold">
              CPX
            </div>
            <span className="text-primary hover:text-foreground text-3xl font-semibold tracking-tight">
              ClairPrismX
            </span>
          </div>

          <h1 className="text-5xl font-semibold leading-tight mb-6">
            Ship faster with
            <span className="block text-white/70">
              AI-powered code reviews
            </span>
          </h1>

          <p className="text-lg text-zinc-400">
            Reduce bugs, save time, and scale your engineering workflow with intelligent automation.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md">
          
          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold">Welcome back</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Sign in to continue to ClairPrismX
              </p>
            </div>

            {/* Button */}
            <button
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-primary text-black font-medium hover:bg-foreground transition disabled:opacity-50"
            >
              <GithubIcon />
              {isLoading ? "Signing in..." : "Continue with GitHub"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-zinc-500">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-zinc-400 space-y-2">
              <p>
                New here?{" "}
                <a href="#" className="text-primary hover:text-foreground font-medium">
                  Create an account
                </a>
              </p>

              <p>
                <a href="#" className="hover:text-white">
                  Self-hosted setup →
                </a>
              </p>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-6 text-center text-xs text-zinc-500">
            <a href="#" className="hover:text-white">Terms</a> ·{" "}
            <a href="#" className="hover:text-white">Privacy</a>
          </div>

        </div>
      </div>
    </div>
  )
}

export default LoginUI



// "use client"

// import { signIn } from "@/lib/auth-client"
// import { useState } from "react"

// const LoginUI = () => {
//   const [isLoading, setIsLoading] = useState(false)

//   const handleGithubLogin = async () => {
//     setIsLoading(true)
//     try {
//       await signIn.social({
//         provider: "github",
//       })
//     } catch (error) {
//       console.error("Login error:", error)
//     }
//     setIsLoading(false)
//   }

//   return (
//     <div className="min-h-screen bg-linear-to-br from-black via-black to-zinc-900 text-white dark flex">
      
//       {/* Left Section - Hero Content */}
//       <div className="flex-1 flex flex-col justify-center px-12 py-16">
//         <div className="max-w-lg">
          
//           {/* Logo */}
//           <div className="mb-16">
//             <div className="inline-flex items-center gap-2 text-2xl font-bold">
//               <div className="w-8 h-8 bg-primary rounded-full" />
//               <span>CodeRabbit</span>
//             </div>
//           </div>

//           {/* Main Content */}
//           <h1 className="text-5xl font-bold mb-6 leading-tight text-balance">
//             Cut Code Review Time & Bugs in Half.
//             <span className="block">Instantly.</span>
//           </h1>

//           <p className="text-lg text-gray-400 leading-relaxed">
//             Supercharge your team to ship faster with the most advanced AI code reviews.
//           </p>
//         </div>
//       </div>

//       {/* Right Section - Login Form */}
//       <div className="flex-1 flex flex-col justify-center items-center px-12 py-16">
//         <div className="w-full max-w-sm">
          
//           <div className="mb-12">
//             <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
//             <p className="text-gray-400">
//               Login using one of the following providers:
//             </p>
//           </div>

//           {/* GitHub Login Button */}
//           <button
//             onClick={handleGithubLogin}
//             disabled={isLoading}
//             className="w-full py-3 px-4 bg-primary text-black rounded-lg font-semibold hover:bg-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 mb-8"
//           >
//             {isLoading ? "Signing in..." : "GitHub"}
//           </button>

//           {/* Footer Links */}
//           <div className="space-y-4 text-center text-sm text-gray-400">
//             <div>
//               New to CodeRabbit?{" "}
//               <a href="#" className="text-orange-500 hover:text-orange-400 font-semibold">
//                 Sign Up
//               </a>
//             </div>
//             <div>
//               <a href="#" className="text-orange-500 hover:text-orange-400 font-semibold">
//                 Self-Hosted Services
//               </a>
//             </div>
//           </div>

//           {/* Bottom Links */}
//           <div className="mt-12 pt-8 border-t border-gray-700 flex justify-center gap-4 text-xs text-gray-500">
//             <a href="#" className="hover:text-gray-400">Terms of Use</a>
//             <span>and</span>
//             <a href="#" className="hover:text-gray-400">Privacy Policy</a>
//           </div>

//         </div>
//       </div>
//     </div>
//   )
// }

// export default LoginUI
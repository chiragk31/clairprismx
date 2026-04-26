"use client"

import React, { use } from 'react'

import { BookOpen, Settings, Moon, Sun, LogOut, BookHeadphones, IndianRupee } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { authClient } from '@/lib/auth-client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import Link from "next/link"

import Logout from "@/module/auth/components/logout"
import { url } from 'inspector'

const Github = () => (
  <svg
    height="20"
    width="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.2 11.4c.6.1.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.84 1.32 3.53 1.01.11-.78.42-1.32.76-1.62-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.69.83.57A12 12 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
)


export const AppSidebar = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { data: session } = authClient.useSession();

  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BookOpen
    },
    {
      title: "Repository",
      url: "/dashboard/repository",
      icon: Github
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: BookHeadphones
    },
    {
      title: "Subscription",
      url: "/dashboard/subscription",
      icon: IndianRupee
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings
    },

  ]


  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/dashboard")
  }
  if (!mounted || !session) {
    return null
  }
  const user = session.user
  const userName = user.name || "User"
  const userEmail = user.email || ""
  const userAvatar = user.image || ""
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase()

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex flex-col gap-4 px-2 py-6">
          <div className="flex items-center gap-4 px-3 py-4 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent/70 transition-colors cursor-pointer">

            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground shrink-0">
              <Github />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground tracking-wide">
                Connected Account
              </p>
              <p className="text-sm font-medium text-sidebar-foreground/90">
                @{userName}
              </p>
            </div>

          </div>
        </div>
      </SidebarHeader>

      <SidebarContent
        className='px-3 py-6 flex-col gap-1'
      >
        <div className='mb-2'>
          <p className='text-xs font-semibold text-sidebar-foreground/60 px-3 mb-3 uppercase tracking-widest'>Menu</p>

        </div>
        <SidebarMenu className="gap-2">
          {navigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                //asChild
                tooltip={item.title}
                className={`h-11 px-4 rounded-lg transition-all duration-200 ${isActive(item.url)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "hover:bg-sidebar-accent/60 text-sidebar-foreground"
                  }`}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t px-3 py-4">

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div
                  className="flex w-full items-center gap-2 h-12 px-4 rounded-lg cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
                >
                  <Avatar className="h-10 w-10 rounded-lg shrink-0">
                    <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName} />
                    <AvatarFallback className="rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-relaxed min-w-0">
                    <span className="truncate font-semibold text-base">{userName}</span>
                    <span className="truncate text-xs text-sidebar-foreground/70">{userEmail}</span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              {/* <DropdownMenuTrigger>
                <SidebarMenuButton
                      size="lg"
                      className="h-12 px-4 rounded-lg data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10 rounded-lg shrink-0">
                        <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName} />
                        <AvatarFallback className="rounded-lg">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="grid flex-1 text-left text-sm leading-relaxed min-w-0">
                        <span className="truncate font-semibold text-base">{userName}</span>
                        <span className="truncate text-xs text-sidebar-foreground/70">
                          {userEmail}
                        </span>
                  
                    </SidebarMenuButton>
              </DropdownMenuTrigger> */}

              <DropdownMenuContent
                className="w-80 rounded-lg"
                align="end"
                side="right"
                sideOffset={8}
              >


                <div className="px-2 py-3 border-t border-b">
                  <DropdownMenuItem>
                    <button
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="w-full px-3 py-3 flex items-center gap-3 cursor-pointer rounded-md hover:bg-sidebar-accent/50 transition-colors text-sm font-medium"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="w-5 h-5 shrink-0" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-5 h-5 shrink-0" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>

                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer px-3 py-3 my-1 rounded-md hover:bg-red-500/10 hover:text-red-600 transition-colors font-medium">
                    <LogOut className="w-5 h-5 mr-3 shrink-0" />
                    <Logout>Sign Out</Logout>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>

            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
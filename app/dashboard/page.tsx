"use client";
import React from 'react'
import { Card,CardContent,CardDescription,CardHeader,CardTitle } from '@/components/ui/card';
import { BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer } from 'recharts';
import { GitCommit,GitPullRequest,MessageSquare,GitBranch } from 'lucide-react';
import { useQuery
  
 } from '@tanstack/react-query';

 import { getDashboardStats,getMonthlyActivity } from '@/module/dashboard/actions';
import ContributionGraph from '@/module/dashboard/components/contribution-graph';
import { Spinner } from '@/components/ui/spinner';
const MainPage = () => {
  const {data: stats, isLoading: statsLoading} = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => await getDashboardStats(),
    refetchOnWindowFocus: false,
  })
  const {data: monthlyActivity, isLoading: activityLoading} = useQuery({
    queryKey: ['monthly-activity'],
    queryFn: async () => await getMonthlyActivity(),
    refetchOnWindowFocus: false,
  })
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>Overview of your GitHub activity and stats</p>
      </div>
      <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.totalRepos || 0}
              </div>
              <p className="text-xs text-muted-foreground">Connected repositories</p>
            </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
            <GitCommit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : (stats?.totalCommits || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">In the last year</p>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PRs</CardTitle>
            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : (stats?.totalPRs || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">In the last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clair reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : (stats?.totalReviews || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Generated Reviews</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
          <CardDescription>Your GitHub activity for the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ContributionGraph  />
        </CardContent>
      </Card>

      <div className='grid gap-4 md:grid-cols-2'>

        <Card className='col-span-2'>
    <CardHeader>
      <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Monthly breakdown of commits,PRs and reviews</CardDescription>
          </CardHeader>
          <CardContent>
            {
              activityLoading ? (
                <div className='h-80 w-full flex items-center justify-center'>
                  <Spinner/></div>
              ) : (
                  <div className='h-80 w-full'>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyActivity || [] } margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                        contentStyle={{backgroundColor:'var(--background)',borderColor:'var(--border)'}} itemStyle={{color:'var(--foreground)'}}
                        />
                        <Legend />
                        <Bar dataKey="commits" name="Commits" fill="#8884d8"  radius={[4,4,0,0]}/>
                        <Bar dataKey="prs" name="Pull Requests" fill="#82ca9d" radius={[4,4,0,0]}/>
                        <Bar dataKey="reviews" name="Reviews" fill="#ffc658" radius={[4,4,0,0]}/>
                      </BarChart>

                      </ResponsiveContainer>

                  </div>
              )
            }
          </CardContent>
    </Card>
      </div>
    </div>
  )
}

export default MainPage
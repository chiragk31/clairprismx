"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getConnectedGithubRepositories, disconnectGithubRepository, disconnectAllGithubRepositories } from "../actions"
import { toast } from "sonner"
import { ExternalLink, Trash2, AlertTriangle } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useState } from "react"
import { set } from "better-auth"

export const RepositoryList = () => {
    const queryClient = useQueryClient();
    const [repoToDelete, setRepoToDelete] = useState<{ id: string; name: string } | null>(null);
    const [diconnectAllDialogOpen, setDisconnectAllDialogOpen] = useState(false);
    const { data: repositories, isLoading } = useQuery({
        queryKey: ["connected-repositories"],
        queryFn: async () => await getConnectedGithubRepositories(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    })
    const disconnectRepoMutation = useMutation({
        mutationFn: async (repoId: string) => await disconnectGithubRepository(repoId),
        onSuccess: (result) => {
            if (result?.success) {
                queryClient.invalidateQueries({ queryKey: ["connected-repositories"] });
                queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
                toast.success("Repository disconnected successfully!");
            }
        },
        onError: () => {
            toast.error("Failed to disconnect repository. Please try again.");
        }
    })


    const disconnectAllRepoMutation = useMutation({
        mutationFn: async (repoId: string) => await disconnectGithubRepository(repoId),
        onSuccess: (result) => {
            if (result?.success) {
                queryClient.invalidateQueries({ queryKey: ["connected-repositories"] });
                queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
                toast.success("Repository disconnected successfully!");
                setDisconnectAllDialogOpen(false);
            }
        },
        onError: () => {
            toast.error("Failed to disconnect repository. Please try again.");
        }
    })
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Connected GitHub Repositories</CardTitle>
                    <CardDescription>Manage your connected GitHub repositories.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-muted rounded"></div>
                        <div className="h-10 bg-muted rounded"></div>


                    </div>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Connected GitHub Repositories</CardTitle>
                <CardDescription>Manage your connected GitHub repositories.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {repositories && repositories.length > 0 ? (
                    <div className="space-y-4">
                        {repositories.map((repo) => (
                            <div key={repo.id} className="flex items-center justify-between p-4 border rounded">
                                <div>
                                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:underline flex items-center gap-1">
                                        {repo.fullName} <ExternalLink size={16} />
                                    </a>
                                    <p className="text-sm text-muted-foreground">Connected on {new Date(repo.createdAt).toLocaleDateString()}</p>
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => setRepoToDelete({ id: repo.id, name: repo.fullName })}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                        <AlertDialog open={!!repoToDelete} onOpenChange={(open) => { if (!open) setRepoToDelete(null) }}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertTriangle size={24} className="text-destructive" />
                                    <AlertDialogTitle>Disconnect Repository</AlertDialogTitle>
                                    <AlertDialogDescription>Are you sure you want to disconnect <strong>{repoToDelete?.name}</strong>? This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => {
                                        if (repoToDelete) {
                                            disconnectRepoMutation.mutate(repoToDelete.id);
                                        }
                                    }} className="bg-destructive text-white hover:bg-destructive/90">
                                        Disconnect
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p>No repositories connected yet.</p>
                    </div>
                )}
                {repositories && repositories.length > 1 && (
                    <>
                        <Button variant="outline" className="w-full" onClick={() => setDisconnectAllDialogOpen(true)}>
                            Disconnect All Repositories
                        </Button>
                        <AlertDialog open={diconnectAllDialogOpen} onOpenChange={setDisconnectAllDialogOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertTriangle size={24} className="text-destructive" />
                                    <AlertDialogTitle>Disconnect All Repositories</AlertDialogTitle>
                                    <AlertDialogDescription>Are you sure you want to disconnect all repositories? This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => {
                                        if (repositories) {
                                            repositories.forEach((repo) => disconnectAllRepoMutation.mutate(repo.id));
                                        }
                                    }} className="bg-destructive text-white hover:bg-destructive/90">
                                        Disconnect All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}
            </CardContent>
        </Card>

    )


}

"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getUserProfile, updateUserProfile } from "../actions";

import { useEffect, useState } from "react";

import { toast } from "sonner";

export const ProfileForm = () => {
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const { data: profile, isLoading } = useQuery({
        queryKey: ["user-profile"],
        queryFn: async () => await getUserProfile(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    })
    useEffect(() => {
        if (profile) {
            setName(profile.name || "");
            setEmail(profile.email || "");
        }
    }, [profile]);
    const updateProfileMutation = useMutation({
        mutationFn: async (data: { name: string; email: string }) => await updateUserProfile(data),
        onSuccess: (result) => {
            if (result?.success) {
                queryClient.invalidateQueries({ queryKey: ["user-profile"] });
                toast.success("Profile updated successfully!");
            }
        },
        onError: () => {
            toast.error("Failed to update profile. Please try again.");
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate({ name, email });
    }
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Profile Setting</CardTitle>
                    <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground">
                        <div className="h-10 bg-muted rounded">
                            <div className="h-10 bg-muted rounded"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Setting</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={updateProfileMutation.isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={updateProfileMutation.isPending}
                        />
                    </div>
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )

}
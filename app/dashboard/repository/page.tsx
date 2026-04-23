"use client";
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Star, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRepositories } from '@/module/repository/hooks/use-repositories';
import { RepositoryListSkeleton } from '@/module/repository/components/repository-skeleton';
import { useConnectRepository } from '@/module/repository/hooks/use-connect-repository';

interface Repository {
	id: number;
	name: string;
	full_name: string;
	description: string | null;
	html_url: string;
	stargazers_count: number;
	language: string | null;
	topics: string[];
	isConnected?: boolean;
}

const RepositoryPage = () => {

	const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useRepositories()
	const { mutate: connectRepository } = useConnectRepository();
	const [localConnectingId, setLocalConnectingId] = useState<number | null>(null);
	const handleConnect = async (repo: Repository) => {
		setLocalConnectingId(repo.id);

		connectRepository({
			owner: repo.full_name.split('/')[0],
			repo: repo.name,
			githubId: repo.id,
		}, {
			onSettled: () => {
				setLocalConnectingId(null);
			}
		});
	}
	const [searchQuery, setSearchQuery] = useState('');

	const observerTarget = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
				fetchNextPage();
			}
		}, {
			threshold: 0.1,
		});
		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}
		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		}
	}, [fetchNextPage, hasNextPage, isFetchingNextPage])

	if (isLoading) {
		return (
			<div className='space-y-4'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Repositories</h1>
					<p className='text-muted-foreground'>Manage and view all your Github repositories.</p>
				</div>
				<RepositoryListSkeleton />
			</div>
		)
	}
	if (isError) {
		return (
			<div className='space-y-4'>
				Failed to load repositories. Please try again later.
			</div>
		)
	}


	const allRepositories = data?.pages.flatMap(page => page) || [];
	const filteredRepositories = allRepositories.filter(repo =>
		repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	return (
		<div className='space-y-4'>
			<div>
				<h1 className='text-3xl font-bold tracking-tight'>Repositories</h1>
				<p className='text-muted-foreground'>Manage and view all your Github repositories.</p>
			</div>
			<div className='relative'>
				<Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
				<Input placeholder='Search repositories...' className='pl-10' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
			</div>
			<div className="grid gap-4">
				{filteredRepositories.map((repo: any) => (
					<Card key={repo.id} className="hover:shadow-md transition-shadow">
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="space-y-2 flex-1">
									<div className="flex items-center gap-2">
										<CardTitle className="text-lg">{repo.name}</CardTitle>

										<Badge variant="outline">
											{repo.language || "Unknown"}
										</Badge>

										{repo.isConnected && (
											<Badge variant="secondary">Connected</Badge>
										)}
									</div>

									<CardDescription>
										{repo.description}
									</CardDescription>
								</div>

								<div className="flex gap-2">
									{/* Open Repo */}
									<Button variant="ghost" size="icon">
										<a
											href={repo.html_url}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink className="h-4 w-4" />
										</a>
									</Button>

									{/* Connect Button */}
									<Button
										onClick={() => handleConnect(repo)}
										disabled={localConnectingId === repo.id || repo.isConnected}
										variant={repo.isConnected ? "outline" : "default"}
									>
										{localConnectingId === repo.id
											? "Connecting..."
											: repo.isConnected
												? "Connected"
												: "Connect"}
									</Button>
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-3">
							{/* Stars + Basic Info */}
							<div className="flex items-center justify-between text-sm text-muted-foreground">
								{/* Stars */}
								<div className="flex items-center gap-1">
									<Star className="h-4 w-4 text-purple-300 fill-pink-400" />
									<span>{repo.stargazers_count}</span>
								</div>


							</div>

							{/* Topics */}
							{repo.topics && repo.topics.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{repo.topics.slice(0, 5).map((topic: string, index: number) => (
										<Badge key={index} variant="secondary" className="text-xs">
											#{topic}
										</Badge>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>
			<div ref={observerTarget}>
				{isFetchingNextPage && <RepositoryListSkeleton />}
				{
					!hasNextPage && allRepositories.length > 0 && (
						<p className='text-center text-sm text-muted-foreground'>No more repositories to load.</p>
					)
				}

			</div>
		</div>
	)
}

export default RepositoryPage
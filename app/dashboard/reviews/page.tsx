"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getReviews } from "@/module/review/actions";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

function MermaidDiagram({ code }: { code: string }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.initialize({ startOnLoad: false, theme: "dark" });
        if (ref.current) {
            mermaid
                .render(`mermaid-${Math.random().toString(36).slice(2)}`, code)
                .then(({ svg }) => {
                    if (ref.current) ref.current.innerHTML = svg;
                })
                .catch(() => {
                    if (ref.current)
                        ref.current.innerHTML = `<pre class="text-red-400 text-xs">${code}</pre>`;
                });
        }
    }, [code]);

    return <div ref={ref} className="my-4 flex justify-center" />;
}

function MarkdownReview({ content }: { content: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeContent = String(children).replace(/\n$/, "");
                    if (match?.[1] === "mermaid") {
                        return <MermaidDiagram code={codeContent} />;
                    }
                    return (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                        </code>
                    );
                },
                pre: ({ children }: any) => (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm my-4">{children}</pre>
                ),
                h1: ({ children }: any) => <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>,
                h2: ({ children }: any) => <h2 className="text-xl font-semibold mt-5 mb-2">{children}</h2>,
                h3: ({ children }: any) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
                p: ({ children }: any) => <p className="mb-3 leading-relaxed">{children}</p>,
                ul: ({ children }: any) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({ children }: any) => (
                    <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-3 text-muted-foreground">
                        {children}
                    </blockquote>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}

function ReviewCard({ review }: { review: any }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{review.prTitle}</CardTitle>
                            {review.status === "completed" && (
                                <Badge variant="default" className="gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Completed
                                </Badge>
                            )}
                            {review.status === "failed" && (
                                <Badge variant="destructive" className="gap-1">
                                    <XCircle className="h-3 w-3" /> Failed
                                </Badge>
                            )}
                            {review.status === "pending" && (
                                <Badge variant="secondary" className="gap-1">
                                    <Clock className="h-3 w-3" /> Pending
                                </Badge>
                            )}
                        </div>
                        <CardDescription>
                            {review.repository.fullName} • PR #{review.prNumber}
                        </CardDescription>
                    </div>

                    <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </a>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </div>

                    {/* Snippet preview */}
                    {!expanded && (
                        <div className="bg-muted p-4 rounded-lg">
                            <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                                {review.review.substring(0, 300)}...
                            </pre>
                        </div>
                    )}

                    {/* Full review */}
                    {expanded && (
                        <div className="border rounded-lg p-6">
                            <MarkdownReview content={review.review} />
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setExpanded(!expanded)}
                            className="gap-2"
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp className="h-4 w-4" /> Hide Full Review
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" /> View Full Review
                                </>
                            )}
                        </Button>

                        <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" className="gap-2">
                                <ExternalLink className="h-4 w-4" /> View on GitHub
                            </Button>
                        </a>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ReviewsPage() {
    const { data: reviews, isLoading } = useQuery({
        queryKey: ["reviews"],
        queryFn: async () => await getReviews(),
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Review History</h1>
                <p className="text-muted-foreground">
                    View the history of your reviews and their statuses.
                </p>
            </div>

            {reviews?.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                No reviews found. Connect a repo and open a PR to submit a review.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {reviews?.map((review: any) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            )}
        </div>
    );
}
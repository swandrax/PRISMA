"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search as SearchIcon, MapPin, Loader2 } from "lucide-react"

interface SearchResultItem {
    title: string;
    link?: string;
    snippet?: string;
    address?: string;
    gps_coordinates?: {
        latitude: number;
        longitude: number;
    };
}

interface SearchResults {
    organic_results?: SearchResultItem[];
    local_results?: SearchResultItem[];
}

export default function SearchPage() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResults | null>(null)
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState("search")

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query) return

        setLoading(true)
        setResults(null)
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`)
            const data = await res.json()
            setResults(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold">Community Search</h1>
                    <p className="text-muted-foreground">Powered by SerpAPI & AI</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1 flex gap-2">
                        <Input
                            placeholder="Search information, locations, or news..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1"
                        />
                        <select
                            className="px-3 py-2 bg-background border rounded-md text-sm"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="search">Web Search</option>
                            <option value="maps">Maps</option>
                            <option value="local">Local</option>
                        </select>
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SearchIcon className="mr-2 h-4 w-4" />}
                        Search
                    </Button>
                </form>

                <div className="space-y-4">
                    {results && results.organic_results && (
                        <div className="grid gap-4">
                            {results.organic_results.map((result: SearchResultItem, index: number) => (
                                <Card key={index}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            <a href={result.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                                {result.title}
                                            </a>
                                        </CardTitle>
                                        <CardDescription>{result.link}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{result.snippet}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {results && results.local_results && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {results.local_results.map((result: SearchResultItem, index: number) => (
                                <Card key={index}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{result.title}</CardTitle>
                                        <CardDescription>{result.address}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{result.gps_coordinates?.latitude}, {result.gps_coordinates?.longitude}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {results && !results.organic_results && !results.local_results && !loading && (
                        <div className="text-center text-muted-foreground">No results found or API limit reached.</div>
                    )}
                </div>
            </div>
        </div>
    )
}

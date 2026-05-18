import { ApiConfig } from "../config/apiConfig";

export interface DecisionResponse {
    decision: string;
    source?: string;
}

export interface OptimizationInput {
    resourceA: number;
    resourceB: number;
    targetOutput: number;
}

export interface OptimizationResult {
    allocationA: number;
    allocationB: number;
    efficiency: number;
    status: string;
}

export const aiService = {
    // Configuration accessor for UI/Navigation
    getConfig() {
        return ApiConfig;
    },

    // Use Gemini Cloud
    async getChatDecision(prompt: string): Promise<DecisionResponse> {
        // Optimized: Using new MVC Controller endpoint via Configured DNS
        return this._fetchDecision(`${ApiConfig.baseUrl.decisionService}/api/Ai/decision`, prompt);
    },

    // Use Local Model (Ollama)
    async getLocalDecision(prompt: string): Promise<DecisionResponse> {
        return this._fetchDecision(`${ApiConfig.baseUrl.decisionService}/api/Ai/local`, prompt);
    },

    // Helper
    async _fetchDecision(url: string, prompt: string): Promise<DecisionResponse> {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                // Try to read error message
                const err = await response.text();
                throw new Error(`Service Error (${response.status}): ${err}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to get decision", error);
            return { decision: `Error: ${(error as Error).message || "Connection failed"}` };
        }
    },

    async optimizeResources(input: OptimizationInput): Promise<OptimizationResult> {
        try {
            const response = await fetch(`${ApiConfig.baseUrl.optimizationService}/optimize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                throw new Error(`Optimization Service Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to optimize", error);
            throw error;
        }
    },

    // Vector Search Memory
    async saveMemory(key: string, description: string, text: string): Promise<string> {
        try {
            const response = await fetch(`${ApiConfig.baseUrl.decisionService}/api/Ai/memory/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, description, text }),
            });
            if (!response.ok) throw new Error("Failed to save");
            return "Saved successfully";
        } catch {
            return "Error saving memory";
        }
    },

    async searchMemory(query: string): Promise<string> {
        try {
            const response = await fetch(`${ApiConfig.baseUrl.decisionService}/api/Ai/memory/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });
            if (!response.ok) throw new Error("Failed to search");
            const data = await response.json();
            return data.Result;
        } catch {
            return "Error searching memory";
        }
    },
    // Image & Page Rendering (Optimization Demo)
    async getRenderedPage(pageName: string): Promise<string> {
        try {
            // Returns HTML string from backend
            const response = await fetch(`${ApiConfig.baseUrl.imageService}/api/Image/render-page?pageName=${encodeURIComponent(pageName)}`);
            if (!response.ok) return "<p>Failed to load rendered page.</p>";
            return await response.text();
        } catch {
            return "<p>Error rendering page.</p>";
        }
    },

    getOptimizedImageUrl(originalUrl: string, width: number, height: number): string {
        // Returns the URL construction for the backend optimization endpoint
        return `${ApiConfig.baseUrl.imageService}/api/Image/optimize?imageUrl=${encodeURIComponent(originalUrl)}&width=${width}&height=${height}`;
    }
};

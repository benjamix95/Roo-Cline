export interface OptimizationMetrics {
    executionTime: number;
    memoryUsage: number;
    complexityScore: number;
}

export class CodeOptimizer {
    constructor() {}

    /**
     * Analizza il codice per identificare potenziali problemi di performance
     */
    public analyzePerformance(code: string): OptimizationMetrics {
        const startTime = process.hrtime();
        const startMemory = process.memoryUsage().heapUsed;

        // Calcola la complessità del codice
        const complexityScore = this.calculateComplexity(code);

        const endMemory = process.memoryUsage().heapUsed;
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const executionTime = seconds * 1000 + nanoseconds / 1000000;

        return {
            executionTime,
            memoryUsage: endMemory - startMemory,
            complexityScore
        };
    }

    /**
     * Calcola un punteggio di complessità basato su vari fattori
     */
    private calculateComplexity(code: string): number {
        let complexity = 0;

        // Analisi della complessità ciclomatica
        complexity += (code.match(/\b(if|while|for|switch)\b/g) || []).length;

        // Analisi della profondità di nidificazione
        const maxNestingDepth = this.calculateMaxNestingDepth(code);
        complexity += maxNestingDepth * 2;

        // Analisi delle funzioni lunghe
        const functionLengths = this.analyzeFunctionLengths(code);
        complexity += functionLengths.reduce((acc, len) => acc + Math.floor(len / 20), 0);

        return complexity;
    }

    /**
     * Calcola la profondità massima di nidificazione nel codice
     */
    private calculateMaxNestingDepth(code: string): number {
        let currentDepth = 0;
        let maxDepth = 0;
        
        for (const char of code) {
            if (char === '{') {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            } else if (char === '}') {
                currentDepth = Math.max(0, currentDepth - 1);
            }
        }

        return maxDepth;
    }

    /**
     * Analizza la lunghezza delle funzioni nel codice
     */
    private analyzeFunctionLengths(code: string): number[] {
        const functionRegex = /\b(?:function|class)\b[^{]*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
        const lengths: number[] = [];
        let match;

        while ((match = functionRegex.exec(code)) !== null) {
            if (match[1]) {
                lengths.push(match[1].split('\n').length);
            }
        }

        return lengths;
    }

    /**
     * Ottimizza il codice in base all'analisi delle performance
     */
    public optimizeCode(code: string): string {
        const metrics = this.analyzePerformance(code);
        
        // Se la complessità è alta, suggerisci ottimizzazioni
        if (metrics.complexityScore > 20) {
            code = this.applyOptimizations(code);
        }

        return code;
    }

    /**
     * Applica ottimizzazioni al codice
     */
    private applyOptimizations(code: string): string {
        // Rimuovi console.log in produzione
        code = code.replace(/console\.log\([^)]*\);?\n?/g, '');

        // Ottimizza le concatenazioni di stringhe
        code = code.replace(/(['"])\s*\+\s*(['"])/g, '$1$2');

        // Ottimizza i cicli
        code = this.optimizeLoops(code);

        return code;
    }

    /**
     * Ottimizza i cicli nel codice
     */
    private optimizeLoops(code: string): string {
        // Converti i for...in in for...of dove possibile
        code = code.replace(
            /for\s*\(\s*let\s+(\w+)\s+in\s+(\w+)\s*\)/g,
            'for (const $1 of Object.keys($2))'
        );

        // Ottimizza i cicli forEach con map/filter/reduce dove appropriato
        code = code.replace(
            /(\w+)\.forEach\(\s*(\w+)\s*=>\s*{\s*results\.push\(([^)]+)\)\s*}\)/g,
            '$1.map($2 => $3)'
        );

        return code;
    }
}
const vscode = require('vscode');
import { detectFlutterInWorkspace } from '../../integrations/workspace/detect-flutter';

export class FlutterService {
    private context: vscode.ExtensionContext;
    private isFlutterEnabled: boolean = false;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.initialize();
    }

    private async initialize() {
        // Rileva automaticamente se è un progetto Flutter
        const isFlutter = await detectFlutterInWorkspace();
        if (isFlutter) {
            this.isFlutterEnabled = true;
            // Aggiorna l'impostazione nell'estensione
            await this.context.globalState.update('isFlutterProject', true);
        }

        // Monitora i cambiamenti nel workspace
        vscode.workspace.onDidChangeWorkspaceFolders(async () => {
            const isFlutter = await detectFlutterInWorkspace();
            this.isFlutterEnabled = isFlutter;
            await this.context.globalState.update('isFlutterProject', isFlutter);
        });
    }

    public isFlutterProject(): boolean {
        return this.isFlutterEnabled;
    }

    // Funzioni di ottimizzazione per Flutter
    public optimizeForFlutter(code: string): string {
        if (!this.isFlutterEnabled) return code;

        // Applica ottimizzazioni specifiche per Flutter
        return code
            // Aggiunge import material se mancante
            .replace(/^(?!import.*material\.dart)/, "import 'package:flutter/material.dart';\n")
            // Ottimizza le performance dei widget
            .replace(/child:\s*Column\(/g, 'child: SingleChildScrollView(child: Column(')
            .replace(/ListView\(/g, 'ListView.builder(')
            // Aggiunge const constructor dove possibile
            .replace(/new\s+(\w+)\(/g, 'const $1(')
            // Ottimizza le immagini
            .replace(/Image\.network\(/g, 'Image.network(\n    cacheWidth: MediaQuery.of(context).size.width.toInt(),\n    cacheHeight: MediaQuery.of(context).size.height.toInt(),');

        return code;
    }

    public getFlutterSuggestions(): string[] {
        if (!this.isFlutterEnabled) return [];

        return [
            'Usa const constructor dove possibile per migliorare le performance',
            'Implementa widget personalizzati per componenti riutilizzabili',
            'Utilizza ListView.builder invece di ListView per liste lunghe',
            'Implementa il caching delle immagini per migliorare le performance',
            'Usa SingleChildScrollView per evitare overflow',
            'Implementa la gestione dello stato con Provider o Riverpod',
            'Ottimizza le build functions evitando calcoli pesanti'
        ];
    }
}
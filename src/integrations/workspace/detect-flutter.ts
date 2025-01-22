import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as yaml from 'js-yaml';

export async function isFlutterProject(workspacePath: string): Promise<boolean> {
    try {
        const pubspecPath = path.join(workspacePath, 'pubspec.yaml');
        
        // Verifica se esiste il file pubspec.yaml
        if (!fs.existsSync(pubspecPath)) {
            return false;
        }

        // Leggi e analizza il file pubspec.yaml
        const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
        const pubspec = yaml.load(pubspecContent) as any;

        // Verifica se flutter è nelle dipendenze
        return !!(
            pubspec &&
            (pubspec.dependencies?.flutter ||
             pubspec.dev_dependencies?.flutter_test)
        );
    } catch (error) {
        console.error('Error detecting Flutter project:', error);
        return false;
    }
}

export async function detectFlutterInWorkspace(): Promise<boolean> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return false;
    }

    // Controlla ogni cartella del workspace
    for (const folder of workspaceFolders) {
        if (await isFlutterProject(folder.uri.fsPath)) {
            return true;
        }
    }

    return false;
}
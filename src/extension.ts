import * as vscode from "vscode";

let feedbackPanel: vscode.WebviewPanel | undefined;
let cursorTimer: NodeJS.Timeout | undefined;
let feedbackList: Array<{
  message: string;
  type: "cursor" | "newline" | "analysis";
  timestamp: string;
}> = [];
let lastAnalyzedContent: string = "";

export function activate(context: vscode.ExtensionContext) {
  console.log("AI Code Feedback extension is now active!");

  // Feedback panel'i oluştur
  createFeedbackPanel(context);

  // İmleç hareketi dinleyicisi - artık daha detaylı analiz yapıyor
  const cursorListener = vscode.window.onDidChangeTextEditorSelection(
    (event) => {
      handleCursorMovement(event);
    }
  );

  // Metin değişikliği dinleyicisi - kod analizi de yapıyor
  const textChangeListener = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      handleTextChange(event);
      performCodeAnalysis(event);
    }
  );

  context.subscriptions.push(cursorListener, textChangeListener);
}

function createFeedbackPanel(context: vscode.ExtensionContext) {
  feedbackPanel = vscode.window.createWebviewPanel(
    "aiFeedback",
    "AI Code Feedback",
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
    }
  );

  updateFeedbackPanel();
}

function handleCursorMovement(event: vscode.TextEditorSelectionChangeEvent) {
  // Önceki timer'ı temizle
  if (cursorTimer) {
    clearTimeout(cursorTimer);
  }

  // 3 saniye sonra imleç pozisyonu hakkında contextual feedback ver
  cursorTimer = setTimeout(() => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const position = editor.selection.active;
      const lineText = editor.document.lineAt(position.line).text;

      // Kod context'ine göre daha akıllı feedback üret
      let contextualMessage = analyzeCurrentContext(lineText, position);
      addFeedback(contextualMessage, "cursor");
    }
  }, 3000);
}

function handleTextChange(event: vscode.TextDocumentChangeEvent) {
  // Yeni satır algılama - artık daha detaylı
  for (const change of event.contentChanges) {
    if (change.text.includes("\n")) {
      const lineCount = change.text.split("\n").length - 1;
      let message =
        lineCount === 1
          ? "New line added - good structure!"
          : `${lineCount} new lines added - consider breaking complex logic into smaller parts`;
      addFeedback(message, "newline");
    }
  }
}

function performCodeAnalysis(event: vscode.TextDocumentChangeEvent) {
  // Sürekli analiz yapmamak için içerik değişikliği kontrolü
  const currentContent = event.document.getText();
  if (currentContent === lastAnalyzedContent) {
    return;
  }
  lastAnalyzedContent = currentContent;

  // Debouncing - çok sık analiz yapmamak için
  setTimeout(() => {
    const analysisResults = analyzeCodeStructure(
      currentContent,
      event.document.languageId
    );
    if (analysisResults.length > 0) {
      analysisResults.forEach((result) => addFeedback(result, "analysis"));
    }
  }, 2000); // 2 saniye bekle, sonra analiz yap
}

function analyzeCurrentContext(
  lineText: string,
  position: vscode.Position
): string {
  // Mevcut satırın context'ini analiz et
  const trimmedLine = lineText.trim();

  if (trimmedLine.startsWith("function") || trimmedLine.includes("=>")) {
    return `Cursor is on a function definition. Consider: Does this function have a single responsibility?`;
  } else if (trimmedLine.includes("if") || trimmedLine.includes("else")) {
    return `Cursor is on conditional logic. Consider: Can this condition be simplified or extracted to a variable?`;
  } else if (trimmedLine.includes("for") || trimmedLine.includes("while")) {
    return `Cursor is on loop logic. Consider: Is this loop complexity necessary? Could it be refactored?`;
  } else if (trimmedLine.includes("//") || trimmedLine.includes("/*")) {
    return `Cursor is on a comment. Good practice! Comments help explain the 'why', not just the 'what'.`;
  } else if (trimmedLine.length > 100) {
    return `This line is quite long (${trimmedLine.length} characters). Consider breaking it into multiple lines for better readability.`;
  } else if (trimmedLine === "") {
    return `Cursor is on an empty line. White space can improve code readability when used purposefully.`;
  }

  return `Cursor paused for analysis. Current context: ${
    trimmedLine.length > 50 ? trimmedLine.substring(0, 50) + "..." : trimmedLine
  }`;
}

function analyzeCodeStructure(content: string, languageId: string): string[] {
  const lines = content.split("\n");
  const feedback: string[] = [];

  // Fonksiyon uzunluğu analizi
  let currentFunctionLength = 0;
  let inFunction = false;

  // Basit kod kalitesi metrikleri
  const longLines = lines.filter((line) => line.length > 120);
  const emptyLines = lines.filter((line) => line.trim() === "");
  const commentLines = lines.filter(
    (line) => line.trim().startsWith("//") || line.trim().startsWith("/*")
  );

  // Feedback üretimi
  if (longLines.length > 3) {
    feedback.push(
      `Code analysis: ${longLines.length} lines exceed 120 characters. Consider refactoring for better readability.`
    );
  }

  const commentRatio =
    commentLines.length / Math.max(1, lines.length - emptyLines.length);
  if (commentRatio < 0.1 && lines.length > 20) {
    feedback.push(
      `Code analysis: Low comment density (${Math.round(
        commentRatio * 100
      )}%). Consider adding explanatory comments.`
    );
  }

  // JavaScript/TypeScript spesifik analizler
  if (languageId === "javascript" || languageId === "typescript") {
    const varDeclarations = lines.filter((line) =>
      line.includes("var ")
    ).length;
    if (varDeclarations > 0) {
      feedback.push(
        `Code analysis: Found ${varDeclarations} 'var' declarations. Consider using 'let' or 'const' for better scoping.`
      );
    }

    const consoleLogs = lines.filter((line) =>
      line.includes("console.log")
    ).length;
    if (consoleLogs > 2) {
      feedback.push(
        `Code analysis: ${consoleLogs} console.log statements detected. Consider using a proper logging framework for production code.`
      );
    }
  }

  return feedback;
}

function addFeedback(message: string, type: "cursor" | "newline" | "analysis") {
  const timestamp = new Date().toLocaleTimeString();
  feedbackList.push({ message, type, timestamp });

  // Feedback listesini maksimum 50 öğe ile sınırla (performans için)
  if (feedbackList.length > 50) {
    feedbackList = feedbackList.slice(-50);
  }

  updateFeedbackPanel();
}

function updateFeedbackPanel() {
  if (feedbackPanel) {
    const feedbackHtml = feedbackList
      .map((feedback) => {
        const typeClass = `feedback-${feedback.type}`;
        const typeIcon = getTypeIcon(feedback.type);
        return `<div class="feedback-item ${typeClass}">
                    <span class="feedback-icon">${typeIcon}</span>
                    <span class="feedback-content">${feedback.message}</span>
                    <span class="feedback-time">${feedback.timestamp}</span>
                </div>`;
      })
      .join("");

    feedbackPanel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>AI Feedback</title>
                <style>
                    body { 
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        padding: 20px;
                        margin: 0;
                        line-height: 1.6;
                        height: 100vh;
                        overflow-y: auto;
                        scroll-behavior: smooth;
                    }
                    
                    h2 {
                        color: var(--vscode-titleBar-activeForeground);
                        border-bottom: 1px solid var(--vscode-widget-border);
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                    }
                    
                    .feedback-item { 
                        margin: 8px 0; 
                        padding: 12px 16px; 
                        background-color: var(--vscode-textBlockQuote-background);
                        border: 1px solid var(--vscode-widget-border);
                        border-radius: 6px;
                        display: flex;
                        align-items: flex-start;
                        gap: 12px;
                    }
                    
                    .feedback-cursor {
                        border-left: 3px solid var(--vscode-charts-blue);
                    }
                    
                    .feedback-newline {
                        border-left: 3px solid var(--vscode-charts-green);
                    }
                    
                    .feedback-analysis {
                        border-left: 3px solid var(--vscode-charts-orange);
                    }
                    
                    .feedback-icon {
                        font-size: 14px;
                        width: 20px;
                        text-align: center;
                        flex-shrink: 0;
                    }
                    
                    .feedback-content {
                        flex: 1;
                        font-size: 13px;
                    }
                    
                    .feedback-time {
                        font-size: 11px;
                        color: var(--vscode-descriptionForeground);
                        flex-shrink: 0;
                    }
                    
                    .feedback-item:hover {
                        background-color: var(--vscode-list-hoverBackground);
                    }
                    
                    .feedback-container {
                        min-height: calc(100vh - 140px);
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                    }
                </style>
            </head>
            <body>
                <h2>📊 Code Feedback Analysis</h2>
                <div class="feedback-container" id="feedbackContainer">${feedbackHtml}</div>
                
                <script>
                    function scrollToBottom() {
                        setTimeout(() => {
                            window.scrollTo({
                                top: document.body.scrollHeight,
                                behavior: 'smooth'
                            });
                        }, 100);
                    }
                    
                    document.addEventListener('DOMContentLoaded', scrollToBottom);
                    window.addEventListener('load', scrollToBottom);
                    scrollToBottom();
                </script>
            </body>
            </html>
        `;
  }
}

function getTypeIcon(type: "cursor" | "newline" | "analysis"): string {
  switch (type) {
    case "cursor":
      return "👆";
    case "newline":
      return "↵";
    case "analysis":
      return "🔍";
    default:
      return "💡";
  }
}

export function deactivate() {
  if (cursorTimer) {
    clearTimeout(cursorTimer);
  }
}

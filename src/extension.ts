import * as vscode from "vscode";

let feedbackPanel: vscode.WebviewPanel | undefined;
let cursorTimer: NodeJS.Timeout | undefined;
let feedbackList: Array<{
  message: string;
  type: "cursor" | "newline" | "analysis" | "ai";
  timestamp: string;
}> = [];
let lastAnalyzedContent: string = "";
let aiAnalysisTimer: NodeJS.Timeout | undefined;

// AI API yapılandırması ve yardımcı fonksiyonlar
interface AIConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
}

export function activate(context: vscode.ExtensionContext) {
  console.log("AI Code Feedback extension is now active!");

  // Extension settings'ini kaydet
  registerConfiguration();

  // Feedback panel'i oluştur
  createFeedbackPanel(context);

  // İmleç hareketi dinleyicisi
  const cursorListener = vscode.window.onDidChangeTextEditorSelection(
    (event) => {
      handleCursorMovement(event);
    }
  );

  // Metin değişikliği dinleyicisi - artık AI analizi de tetikliyor
  const textChangeListener = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      handleTextChange(event);
      performCodeAnalysis(event);
      scheduleAIAnalysis(event); // Yeni: AI analizi planla
    }
  );

  context.subscriptions.push(cursorListener, textChangeListener);
}

function registerConfiguration() {
  // Extension ayarlarını VS Code settings'ine ekle
  // Bu ayarlar package.json dosyasında da tanımlanmalı
  const config = vscode.workspace.getConfiguration("codeFeedback");

  // Varsayılan ayarları kontrol et
  if (!config.has("openai.apiKey")) {
    vscode.window
      .showInformationMessage(
        "AI Code Feedback: OpenAI API key not configured. Go to Settings to enable AI features.",
        "Open Settings"
      )
      .then((selection) => {
        if (selection === "Open Settings") {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "codeFeedback"
          );
        }
      });
  }
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
  if (cursorTimer) {
    clearTimeout(cursorTimer);
  }

  cursorTimer = setTimeout(() => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const position = editor.selection.active;
      const lineText = editor.document.lineAt(position.line).text;

      let contextualMessage = analyzeCurrentContext(lineText, position);
      addFeedback(contextualMessage, "cursor");

      // AI'dan daha detaylı context analizi iste
      requestAIContextAnalysis(lineText, position, editor.document);
    }
  }, 3000);
}

function handleTextChange(event: vscode.TextDocumentChangeEvent) {
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
  const currentContent = event.document.getText();
  if (currentContent === lastAnalyzedContent) {
    return;
  }
  lastAnalyzedContent = currentContent;

  setTimeout(() => {
    const analysisResults = analyzeCodeStructure(
      currentContent,
      event.document.languageId
    );
    if (analysisResults.length > 0) {
      analysisResults.forEach((result) => addFeedback(result, "analysis"));
    }
  }, 2000);
}

// Yeni fonksiyon: AI analizi planlama
function scheduleAIAnalysis(event: vscode.TextDocumentChangeEvent) {
  // Önceki AI analiz timer'ını iptal et
  if (aiAnalysisTimer) {
    clearTimeout(aiAnalysisTimer);
  }

  // 5 saniye sonra AI analizi yap (debouncing)
  aiAnalysisTimer = setTimeout(() => {
    requestAICodeAnalysis(event.document);
  }, 5000);
}

// AI context analizi - imleç belirli bir yerde durduğunda
async function requestAIContextAnalysis(
  lineText: string,
  position: vscode.Position,
  document: vscode.TextDocument
) {
  const config = getAIConfig();
  if (!config.enabled || !config.apiKey) {
    return;
  }

  try {
    // Context bilgilerini topla
    const context = gatherCodeContext(document, position);

    const prompt = `As a code mentor, analyze this specific line of code and its context:

Current line: "${lineText}"
File type: ${document.languageId}
Context: ${context}

Provide a brief, educational feedback (max 100 words) focusing on:
1. Code quality aspects
2. Potential improvements
3. Best practices
4. Learning opportunities

Be encouraging and constructive.`;

    const aiResponse = await callOpenAI(prompt, config);
    if (aiResponse) {
      addFeedback(`🤖 AI Context Analysis: ${aiResponse}`, "ai");
    }
  } catch (error) {
    console.error("AI context analysis error:", error);
    // Kullanıcıya hata gösterme, sessizce devam et
  }
}

// AI kod analizi - genel kod analizi için
async function requestAICodeAnalysis(document: vscode.TextDocument) {
  const config = getAIConfig();
  if (!config.enabled || !config.apiKey) {
    return;
  }

  try {
    const codeSnippet = document.getText();

    // Çok büyük dosyalar için kod parçası al
    const maxLength = 2000;
    const analysisCode =
      codeSnippet.length > maxLength
        ? codeSnippet.substring(0, maxLength) + "\n// ... (truncated)"
        : codeSnippet;

    const prompt = `As an experienced code reviewer, analyze this ${document.languageId} code:

\`\`\`${document.languageId}
${analysisCode}
\`\`\`

Provide constructive feedback focusing on:
1. Code structure and organization
2. Potential bugs or improvements
3. Best practices adherence
4. Performance considerations
5. Readability and maintainability

Keep response under 200 words and be specific with actionable suggestions.`;

    const aiResponse = await callOpenAI(prompt, config);
    if (aiResponse) {
      addFeedback(`🤖 AI Code Review: ${aiResponse}`, "ai");
    }
  } catch (error) {
    console.error("AI code analysis error:", error);
    addFeedback(
      "🤖 AI analysis temporarily unavailable. Check your API configuration.",
      "ai"
    );
  }
}

// OpenAI API çağrısı
async function callOpenAI(
  prompt: string,
  config: AIConfig
): Promise<string | null> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert code mentor who provides constructive, educational feedback to help developers improve their coding skills. Always be encouraging and focus on learning opportunities.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || null;
}

// AI konfigürasyonunu al
function getAIConfig(): AIConfig {
  const config = vscode.workspace.getConfiguration("codeFeedback");

  return {
    apiKey: config.get("openai.apiKey", ""),
    model: config.get("openai.model", "gpt-3.5-turbo"),
    enabled: config.get("ai.enabled", false),
  };
}

// Kod context'ini topla
function gatherCodeContext(
  document: vscode.TextDocument,
  position: vscode.Position
): string {
  const startLine = Math.max(0, position.line - 3);
  const endLine = Math.min(document.lineCount - 1, position.line + 3);

  let context = "";
  for (let i = startLine; i <= endLine; i++) {
    const lineText = document.lineAt(i).text;
    const marker = i === position.line ? " -> " : "    ";
    context += `${marker}${lineText}\n`;
  }

  return context;
}

function analyzeCurrentContext(
  lineText: string,
  position: vscode.Position
): string {
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

  const longLines = lines.filter((line) => line.length > 120);
  const emptyLines = lines.filter((line) => line.trim() === "");
  const commentLines = lines.filter(
    (line) => line.trim().startsWith("//") || line.trim().startsWith("/*")
  );

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

function addFeedback(
  message: string,
  type: "cursor" | "newline" | "analysis" | "ai"
) {
  const timestamp = new Date().toLocaleTimeString();
  feedbackList.push({ message, type, timestamp });

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
                    
                    .feedback-ai {
                        border-left: 3px solid var(--vscode-charts-purple);
                        background-color: var(--vscode-inputValidation-infoBackground);
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
                        white-space: pre-wrap;
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
                <h2>🤖 AI Code Feedback</h2>
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

function getTypeIcon(type: "cursor" | "newline" | "analysis" | "ai"): string {
  switch (type) {
    case "cursor":
      return "👆";
    case "newline":
      return "↵";
    case "analysis":
      return "🔍";
    case "ai":
      return "🤖";
    default:
      return "💡";
  }
}

export function deactivate() {
  if (cursorTimer) {
    clearTimeout(cursorTimer);
  }
  if (aiAnalysisTimer) {
    clearTimeout(aiAnalysisTimer);
  }
}

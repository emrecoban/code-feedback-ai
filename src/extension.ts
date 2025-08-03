import * as vscode from "vscode";

let feedbackPanel: vscode.WebviewPanel | undefined;
let cursorTimer: NodeJS.Timeout | undefined;
let feedbackList: string[] = [];

export function activate(context: vscode.ExtensionContext) {
  console.log("AI Code Feedback extension is now active!");

  // Feedback panel'i oluştur
  createFeedbackPanel(context);

  // İmleç hareketi dinleyicisi
  const cursorListener = vscode.window.onDidChangeTextEditorSelection(
    (event) => {
      handleCursorMovement(event);
    }
  );

  // Metin değişikliği dinleyicisi (yeni satır için)
  const textChangeListener = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      handleTextChange(event);
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

  // 3 saniye sonra feedback ver
  cursorTimer = setTimeout(() => {
    addFeedback("Cursor stayed at the same position for 3+ seconds");
  }, 3000);
}

function handleTextChange(event: vscode.TextDocumentChangeEvent) {
  // Yeni satır eklenip eklenmediğini kontrol et
  for (const change of event.contentChanges) {
    if (change.text.includes("\n")) {
      addFeedback("New line detected - good coding practice!");
    }
  }
}

function addFeedback(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  feedbackList.push(`[${timestamp}] ${message}`);
  updateFeedbackPanel();
}

function updateFeedbackPanel() {
  if (feedbackPanel) {
    const feedbackHtml = feedbackList
      .map((feedback) => `<div class="feedback-item">${feedback}</div>`)
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
                        /* Bu CSS özellikleri scroll davranışını iyileştirir */
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
                        margin: 10px 0; 
                        padding: 12px 16px; 
                        background-color: var(--vscode-textBlockQuote-background);
                        border: 1px solid var(--vscode-widget-border);
                        border-radius: 6px;
                        border-left: 3px solid var(--vscode-textLink-foreground);
                    }
                    
                    .feedback-item:hover {
                        background-color: var(--vscode-list-hoverBackground);
                    }
                    
                    /* Container için özel stil - scroll pozisyonu kontrolü için */
                    .feedback-container {
                        min-height: calc(100vh - 140px);
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                    }
                </style>
            </head>
            <body>
                <h2>Code Feedback</h2>
                <div class="feedback-container" id="feedbackContainer">${feedbackHtml}</div>
                
                <script>
                    // Bu JavaScript kodu sayfanın her güncellendiğinde çalışır
                    function scrollToBottom() {
                        // Sayfa yüklendikten sonra kısa bir bekleme ile scroll işlemi
                        setTimeout(() => {
                            window.scrollTo({
                                top: document.body.scrollHeight,
                                behavior: 'smooth'
                            });
                        }, 100);
                    }
                    
                    // Sayfa yüklendiğinde otomatik scroll
                    document.addEventListener('DOMContentLoaded', scrollToBottom);
                    
                    // Sayfa tamamen yüklendiğinde de scroll (güvenlik için)
                    window.addEventListener('load', scrollToBottom);
                    
                    // Hemen scroll işlemini başlat (çoklu güvenlik katmanı)
                    scrollToBottom();
                </script>
            </body>
            </html>
        `;
  }
}

export function deactivate() {
  if (cursorTimer) {
    clearTimeout(cursorTimer);
  }
}

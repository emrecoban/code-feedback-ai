import * as vscode from "vscode";

// Temel veri yapıları ve tipler
let feedbackPanel: vscode.WebviewPanel | undefined;
let cursorTimer: NodeJS.Timeout | undefined;
let feedbackList: Array<{
  message: string;
  type: "cursor" | "newline" | "ai" | "error";
  timestamp: string;
}> = [];
let lastAnalyzedContent: string = "";
let aiAnalysisTimer: NodeJS.Timeout | undefined;

// AI API response yapısı
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// AI konfigürasyon yapısı
interface AIConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
}

// Hata türleri - her hata kategorisi farklı kullanıcı deneyimi gerektirir
enum AIErrorType {
  AUTHENTICATION = "authentication",
  RATE_LIMIT = "rate_limit",
  NETWORK = "network",
  SERVICE_UNAVAILABLE = "service_unavailable",
  QUOTA_EXCEEDED = "quota_exceeded",
  UNKNOWN = "unknown",
}

// Detaylı hata bilgisi yapısı
interface AIError {
  type: AIErrorType;
  message: string;
  statusCode?: number;
  retryAfter?: number;
  canRetry: boolean;
}

// Global hata takip değişkenleri - kullanıcı deneyimini optimize etmek için
let lastErrorTime: number = 0;
let consecutiveErrors: number = 0;
let isAITemporarilyDisabled: boolean = false;

// Extension'ın ana aktivasyon fonksiyonu
export function activate(context: vscode.ExtensionContext) {
  console.log("AI Code Feedback extension is now active!");

  // Extension ayarlarını kaydet ve kontrol et
  registerConfiguration();

  // Feedback panelini oluştur - kullanıcının feedback'leri göreceği yer
  createFeedbackPanel(context);

  // İmleç hareketi dinleyicisi - kullanıcı imleci bir yerde bıraktığında tetiklenir
  const cursorListener = vscode.window.onDidChangeTextEditorSelection(
    (event) => {
      handleCursorMovement(event);
    }
  );

  // Metin değişikliği dinleyicisi - kod yazıldığında tetiklenir
  const textChangeListener = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      handleTextChange(event);
      scheduleAIAnalysis(event);
    }
  );

  // Event listener'ları context'e ekle - extension kapanırken otomatik temizlensin
  context.subscriptions.push(cursorListener, textChangeListener);
}

// Extension ayarlarını kontrol et ve kullanıcıyı bilgilendir
function registerConfiguration() {
  const config = vscode.workspace.getConfiguration("codeFeedback");

  // API anahtarının varlığını kontrol et - bu kritik bir gereksinim
  if (!config.has("openai.apiKey") || !config.get("openai.apiKey")) {
    // Kullanıcıya nazikçe bilgi ver ve seçenekler sun
    vscode.window
      .showInformationMessage(
        "🤖 AI Code Feedback: OpenAI API key required for AI features.",
        "Open Settings",
        "Get API Key"
      )
      .then((selection) => {
        if (selection === "Open Settings") {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "codeFeedback"
          );
        } else if (selection === "Get API Key") {
          vscode.env.openExternal(
            vscode.Uri.parse("https://platform.openai.com/api-keys")
          );
        }
      });

    // Feedback paneline de bilgi ekle
    addFeedback(
      "⚠️ API key required - Please configure your OpenAI API key in settings to enable AI feedback",
      "error"
    );
  }
}

// Feedback panelini oluştur - kullanıcı arayüzünün merkezi
function createFeedbackPanel(context: vscode.ExtensionContext) {
  feedbackPanel = vscode.window.createWebviewPanel(
    "aiFeedback",
    "AI Code Feedback",
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
    }
  );

  // İlk paneli güncelle
  updateFeedbackPanel();
}

// İmleç hareketi işleyicisi - kullanıcı kod üzerinde durduğunda context analizi yapar
function handleCursorMovement(event: vscode.TextEditorSelectionChangeEvent) {
  // Önceki timer'ı temizle - yeni hareket olduğu için
  if (cursorTimer) {
    clearTimeout(cursorTimer);
  }

  // 3 saniye sonra analiz yap - kullanıcı gerçekten o noktada duruyor demektir
  cursorTimer = setTimeout(async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const position = editor.selection.active;
      const lineText = editor.document.lineAt(position.line).text;

      // Önce temel context analizi yap - anında feedback için
      const contextualMessage = analyzeCurrentContext(lineText, position);
      addFeedback(contextualMessage, "cursor");

      // Sonra AI'dan daha detaylı analiz iste
      await requestAIContextAnalysis(lineText, position, editor.document);
    }
  }, 3000);
}

// Metin değişikliği işleyicisi - yeni satır ekleme gibi değişiklikleri yakalar
function handleTextChange(event: vscode.TextDocumentChangeEvent) {
  // Her değişikliği kontrol et ve kullanıcıya pozitif feedback ver
  for (const change of event.contentChanges) {
    if (change.text.includes("\n")) {
      const lineCount = change.text.split("\n").length - 1;
      let message =
        lineCount === 1
          ? "✨ New line added - great structure!"
          : `✨ ${lineCount} new lines added - good code organization!`;
      addFeedback(message, "newline");
    }
  }
}

// AI analizi planla - kullanıcı kod yazmayı bitirince tetiklensin
function scheduleAIAnalysis(event: vscode.TextDocumentChangeEvent) {
  // Önceki AI analiz timer'ını iptal et
  if (aiAnalysisTimer) {
    clearTimeout(aiAnalysisTimer);
  }

  // 5 saniye sonra AI analizi yap - kullanıcı yazmayı bitirmiş olabilir
  aiAnalysisTimer = setTimeout(async () => {
    await requestAICodeAnalysis(event.document);
  }, 5000);
}

// Gelen hataları kategorize et - her hata türü farklı muamele gerektirir
function categorizeAIError(error: any, response?: Response): AIError {
  console.log("Categorizing AI error:", error, response?.status);

  // Network hatalarını yakala - internet bağlantısı veya DNS sorunları
  if (
    error.name === "TypeError" &&
    (error.message.includes("fetch") || error.message.includes("network"))
  ) {
    return {
      type: AIErrorType.NETWORK,
      message: "No internet connection or OpenAI service is unreachable",
      canRetry: true,
    };
  }

  // HTTP response hatalarını analiz et
  if (response && !response.ok) {
    const statusCode = response.status;

    switch (statusCode) {
      case 401: // Unauthorized - yanlış API anahtarı
        return {
          type: AIErrorType.AUTHENTICATION,
          message: "Invalid OpenAI API key. Please check your configuration.",
          statusCode,
          canRetry: false,
        };

      case 429: // Too Many Requests - rate limit
        const retryAfter = response.headers.get("retry-after");
        return {
          type: AIErrorType.RATE_LIMIT,
          message:
            "OpenAI API rate limit exceeded. Please wait before trying again.",
          statusCode,
          retryAfter: retryAfter ? parseInt(retryAfter) : 60,
          canRetry: true,
        };

      case 402: // Payment Required - quota aşımı
        return {
          type: AIErrorType.QUOTA_EXCEEDED,
          message:
            "OpenAI API quota exceeded. Please check your billing and usage.",
          statusCode,
          canRetry: false,
        };

      case 503: // Service Unavailable
      case 502: // Bad Gateway
      case 500: // Internal Server Error
        return {
          type: AIErrorType.SERVICE_UNAVAILABLE,
          message:
            "OpenAI service is temporarily unavailable. Please try again later.",
          statusCode,
          canRetry: true,
        };
    }
  }

  // Bilinmeyen hatalar için fallback
  return {
    type: AIErrorType.UNKNOWN,
    message: `Unexpected error: ${error.message || "Unknown error occurred"}`,
    canRetry: true,
  };
}

// Kullanıcıya hata bildirimini göster - bu fonksiyon kullanıcı deneyiminin kalbini oluşturur
async function handleAIError(aiError: AIError): Promise<void> {
  console.log("Handling AI error:", aiError);

  consecutiveErrors++;
  lastErrorTime = Date.now();

  // Feedback paneline hata durumunu hemen bildir - bu çok önemli!
  const userFriendlyMessage = getUserFriendlyErrorMessage(aiError);
  addFeedback(`❌ ${userFriendlyMessage}`, "error");

  // Çok fazla ardışık hata varsa AI'ı geçici olarak devre dışı bırak
  if (consecutiveErrors >= 3) {
    isAITemporarilyDisabled = true;

    vscode.window.showWarningMessage(
      "⚠️ AI Code Feedback: Too many consecutive errors. AI features temporarily disabled for 10 minutes."
    );

    addFeedback(
      "⏸️ AI features paused due to repeated errors. Will retry automatically in 10 minutes.",
      "error"
    );

    // 10 dakika sonra tekrar dene
    setTimeout(() => {
      isAITemporarilyDisabled = false;
      consecutiveErrors = 0;
      vscode.window.showInformationMessage(
        "✅ AI Code Feedback: AI analysis has been re-enabled."
      );
      addFeedback("✅ AI features re-enabled and ready!", "ai");
    }, 10 * 60 * 1000); // 10 dakika

    return; // Erken çık, daha fazla bildirim gösterme
  }

  // Hata türüne göre uygun bildirim göster - her hata farklı yaklaşım gerektirir
  switch (aiError.type) {
    case AIErrorType.AUTHENTICATION:
      const authAction = await vscode.window.showErrorMessage(
        "🔑 AI Code Feedback: Invalid OpenAI API key detected.",
        "Open Settings",
        "Get API Key",
        "Disable AI Features"
      );

      if (authAction === "Open Settings") {
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "codeFeedback.openai.apiKey"
        );
      } else if (authAction === "Get API Key") {
        vscode.env.openExternal(
          vscode.Uri.parse("https://platform.openai.com/api-keys")
        );
      } else if (authAction === "Disable AI Features") {
        await vscode.workspace
          .getConfiguration("codeFeedback")
          .update("ai.enabled", false, vscode.ConfigurationTarget.Global);
        addFeedback("AI features disabled by user", "error");
      }
      break;

    case AIErrorType.RATE_LIMIT:
      const waitTime = aiError.retryAfter || 60;
      const minutes = Math.ceil(waitTime / 60);

      vscode.window.showWarningMessage(
        `⏱️ AI Code Feedback: Rate limit reached. AI features will resume in approximately ${minutes} minute(s).`
      );

      // Rate limit süresini bekle ve sonra tekrar etkinleştir
      setTimeout(() => {
        consecutiveErrors = Math.max(0, consecutiveErrors - 1);
        addFeedback("✅ Rate limit period passed - AI ready!", "ai");
      }, waitTime * 1000);
      break;

    case AIErrorType.QUOTA_EXCEEDED:
      const quotaAction = await vscode.window.showErrorMessage(
        "💳 AI Code Feedback: OpenAI API quota exceeded. Please check your billing.",
        "Check Billing",
        "Disable AI Features"
      );

      if (quotaAction === "Check Billing") {
        vscode.env.openExternal(
          vscode.Uri.parse("https://platform.openai.com/account/billing")
        );
      } else if (quotaAction === "Disable AI Features") {
        await vscode.workspace
          .getConfiguration("codeFeedback")
          .update("ai.enabled", false, vscode.ConfigurationTarget.Global);
        addFeedback("AI features disabled due to quota issues", "error");
      }
      break;

    case AIErrorType.NETWORK:
      if (consecutiveErrors === 1) {
        // İlk network hatası için sadece feedback panelinde bildir
        vscode.window.showWarningMessage(
          "🌐 AI Code Feedback: Network connection issue. Will retry automatically."
        );
      }
      break;

    case AIErrorType.SERVICE_UNAVAILABLE:
      vscode.window.showWarningMessage(
        "🔧 AI Code Feedback: OpenAI service temporarily unavailable. Will retry automatically."
      );
      break;

    default:
      if (consecutiveErrors <= 2) {
        // Bilinmeyen hatalar için sadece ilk birkaç sefer bildirim göster
        vscode.window.showErrorMessage(
          `❌ AI Code Feedback: ${aiError.message}`
        );
      }
  }
}

// Kullanıcı dostu hata mesajı oluştur - karmaşık teknik detayları basitleştir
// Bu fonksiyon, feedback panelinde gösterilecek daha kısa mesajlar için
function getUserFriendlyErrorMessage(error: AIError): string {
  switch (error.type) {
    case AIErrorType.AUTHENTICATION:
      return "Invalid API key - Please check settings";
    case AIErrorType.RATE_LIMIT:
      return "Rate limit reached - Will retry automatically";
    case AIErrorType.QUOTA_EXCEEDED:
      return "API quota exceeded - Check billing";
    case AIErrorType.NETWORK:
      return "Connection issue - Retrying...";
    case AIErrorType.SERVICE_UNAVAILABLE:
      return "OpenAI service unavailable - Retrying...";
    default:
      return "AI temporarily unavailable";
  }
}

// AI context analizi - imleç belirli bir yerde durduğunda tetiklenir
async function requestAIContextAnalysis(
  lineText: string,
  position: vscode.Position,
  document: vscode.TextDocument
) {
  const config = getAIConfig();

  // AI etkin değilse veya geçici olarak devre dışıysa çağrı yapma
  if (!config.enabled || !config.apiKey || isAITemporarilyDisabled) {
    if (!config.apiKey) {
      addFeedback("⚠️ API key required for AI analysis", "error");
    }
    return;
  }

  try {
    // Context bilgilerini topla - sadece ilgili kod parçasını analiz et
    const context = gatherCodeContext(document, position);

    const prompt = `As a code mentor, analyze this specific line of code and its context:

Current line: "${lineText}"
File type: ${document.languageId}
Context:
${context}

Provide a brief, educational feedback (max 100 words) focusing on:
1. Code quality aspects
2. Potential improvements
3. Best practices
4. Learning opportunities

Be encouraging and constructive.`;

    const aiResponse = await callOpenAI(prompt, config);
    if (aiResponse) {
      addFeedback(`🎯 ${aiResponse}`, "cursor");
    }
    // Eğer aiResponse null ise, callOpenAI içinde hata zaten işlendi ve feedback'e eklendi
  } catch (error) {
    console.error("AI context analysis error:", error);
    // Bu noktada hata zaten handleAIError ile işlendi
  }
}

// AI kod analizi - genel kod analizi için
async function requestAICodeAnalysis(document: vscode.TextDocument) {
  const config = getAIConfig();

  // AI etkin değilse veya geçici olarak devre dışıysa çağrı yapma
  if (!config.enabled || !config.apiKey || isAITemporarilyDisabled) {
    return;
  }

  try {
    const codeSnippet = document.getText();

    // Çok büyük dosyalar için kod parçası al - API limitlerini aşmamak için
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
      addFeedback(`🔍 AI Code Review: ${aiResponse}`, "ai");
    }
    // Hata durumunda zaten handleAIError çağrıldı
  } catch (error) {
    console.error("AI code analysis error:", error);
  }
}

// OpenAI API çağrısı - tüm hata yönetimi burada gerçekleşir
async function callOpenAI(
  prompt: string,
  config: AIConfig
): Promise<string | null> {
  // AI geçici olarak devre dışı bırakılmışsa çağrı yapma
  if (isAITemporarilyDisabled) {
    return null;
  }

  try {
    console.log("Making OpenAI API call...");

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

    console.log("OpenAI API response status:", response.status);

    // Başarılı response durumunda error counter'ını sıfırla
    if (response.ok) {
      consecutiveErrors = 0; // Başarılı çağrı sonrası error counter'ı sıfırla

      const data = (await response.json()) as OpenAIResponse;
      const result = data.choices[0]?.message?.content?.trim() || null;
      console.log(
        "OpenAI API success:",
        result ? "Got response" : "Empty response"
      );
      return result;
    } else {
      // HTTP error durumunda hata yönetimi yap
      console.log("OpenAI API error response:", await response.text());
      const aiError = categorizeAIError(
        new Error(`HTTP ${response.status}`),
        response
      );
      await handleAIError(aiError); // Bu fonksiyon artık feedback paneline de mesaj ekliyor
      return null;
    }
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    // Network veya diğer hatalar için hata yönetimi yap
    const aiError = categorizeAIError(error);
    await handleAIError(aiError); // Bu fonksiyon artık feedback paneline de mesaj ekliyor
    return null;
  }
}

// Mevcut context'i analiz et - AI olmadan da çalışan temel analiz
function analyzeCurrentContext(
  lineText: string,
  position: vscode.Position
): string {
  const trimmedLine = lineText.trim();

  // Farklı kod yapıları için context-aware mesajlar
  if (trimmedLine.startsWith("function") || trimmedLine.includes("=>")) {
    return `Cursor paused for analysis. Current context: Function definition - Consider: Does this function have a single responsibility?`;
  } else if (trimmedLine.includes("if") || trimmedLine.includes("else")) {
    return `Cursor paused for analysis. Current context: Conditional logic - Consider: Can this condition be simplified or extracted to a variable?`;
  } else if (trimmedLine.includes("for") || trimmedLine.includes("while")) {
    return `Cursor paused for analysis. Current context: Loop logic - Consider: Is this loop complexity necessary? Could it be refactored?`;
  } else if (trimmedLine.includes("//") || trimmedLine.includes("/*")) {
    return `Cursor paused for analysis. Current context: Comment - Good practice! Comments help explain the 'why', not just the 'what'.`;
  } else if (trimmedLine.length > 100) {
    return `Cursor paused for analysis. Current context: Long line (${trimmedLine.length} characters) - Consider breaking it into multiple lines for better readability.`;
  } else if (trimmedLine === "") {
    return `Cursor paused for analysis. Current context: Empty line - White space can improve code readability when used purposefully.`;
  }

  return `Cursor paused for analysis. Current context: ${
    trimmedLine.length > 50 ? trimmedLine.substring(0, 50) + "..." : trimmedLine
  }`;
}
function getAIConfig(): AIConfig {
  const config = vscode.workspace.getConfiguration("codeFeedback");

  return {
    apiKey: config.get("openai.apiKey", ""),
    model: config.get("openai.model", "gpt-3.5-turbo"),
    enabled: config.get("ai.enabled", true),
  };
}

// Kod context'ini topla - AI'ya gönderilecek kod parçasını hazırla
function gatherCodeContext(
  document: vscode.TextDocument,
  position: vscode.Position
): string {
  // İmlecin etrafındaki birkaç satırı al - context sağlamak için
  const startLine = Math.max(0, position.line - 3);
  const endLine = Math.min(document.lineCount - 1, position.line + 3);

  let context = "";
  for (let i = startLine; i <= endLine; i++) {
    const lineText = document.lineAt(i).text;
    const marker = i === position.line ? " -> " : "    "; // Mevcut satırı işaretle
    context += `${marker}${lineText}\n`;
  }

  return context;
}

// Feedback ekle - tüm feedback'ler burada toplanır
function addFeedback(
  message: string,
  type: "cursor" | "newline" | "ai" | "error"
) {
  const timestamp = new Date().toLocaleTimeString();
  feedbackList.push({ message, type, timestamp });

  // Performans için feedback listesini sınırla
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
                    
                    .feedback-ai {
                        border-left: 3px solid var(--vscode-charts-purple);
                        background-color: var(--vscode-inputValidation-infoBackground);
                    }
                    
                    .feedback-error {
                        border-left: 3px solid var(--vscode-charts-red);
                        background-color: var(--vscode-inputValidation-errorBackground);
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

function getTypeIcon(type: "cursor" | "newline" | "ai" | "error"): string {
  switch (type) {
    case "cursor":
      return "🎯";
    case "newline":
      return "✨";
    case "ai":
      return "🤖";
    case "error":
      return "⚠️";
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

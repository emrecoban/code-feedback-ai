import * as vscode from "vscode";

// Dil sistemi için translation interface'i - İngilizce key'ler ile
interface Translations {
  cursor_analysis: {
    function: string;
    conditional: string;
    loop: string;
    comment: string;
    long_line: string;
    empty_line: string;
    generic: string;
  };
  newline_messages: {
    single: string;
    multiple: string;
  };
  errors: {
    api_key_required: string;
    invalid_api_key: string;
    rate_limit_reached: string;
    quota_exceeded: string;
    connection_issue: string;
    service_unavailable: string;
    ai_unavailable: string;
    too_many_errors: string;
    api_key_configuration_needed: string;
  };
  notifications: {
    api_key_setup_title: string;
    api_key_setup_message: string;
    too_many_errors_warning: string;
    rate_limit_warning: string;
    quota_exceeded_error: string;
    network_warning: string;
    service_unavailable_warning: string;
    ai_re_enabled: string;
    rate_limit_passed: string;
  };
  actions: {
    open_settings: string;
    get_api_key: string;
    disable_ai: string;
    check_billing: string;
    learn_more: string;
  };
  ui: {
    panel_title: string;
    ai_analysis_prefix: string;
    ai_review_prefix: string;
  };
}

// Tüm dillerin çevirileri - İngilizce key'ler ile organize edildi
const translations: Record<string, Translations> = {
  english: {
    cursor_analysis: {
      function:
        "Cursor paused for analysis. Current context: Function definition - Consider: Does this function have a single responsibility?",
      conditional:
        "Cursor paused for analysis. Current context: Conditional logic - Consider: Can this condition be simplified or extracted to a variable?",
      loop: "Cursor paused for analysis. Current context: Loop logic - Consider: Is this loop complexity necessary? Could it be refactored?",
      comment:
        "Cursor paused for analysis. Current context: Comment - Good practice! Comments help explain the 'why', not just the 'what'.",
      long_line:
        "Cursor paused for analysis. Current context: Long line ({length} characters) - Consider breaking it into multiple lines for better readability.",
      empty_line:
        "Cursor paused for analysis. Current context: Empty line - White space can improve code readability when used purposefully.",
      generic: "Cursor paused for analysis. Current context: {context}",
    },
    newline_messages: {
      single: "✨ New line added - great structure!",
      multiple: "✨ {count} new lines added - good code organization!",
    },
    errors: {
      api_key_required: "API key required for AI analysis",
      invalid_api_key: "Invalid API key - Please check settings",
      rate_limit_reached: "Rate limit reached - Will retry automatically",
      quota_exceeded: "API quota exceeded - Check billing",
      connection_issue: "Connection issue - Retrying...",
      service_unavailable: "OpenAI service unavailable - Retrying...",
      ai_unavailable: "AI temporarily unavailable",
      too_many_errors:
        "AI features paused due to repeated errors. Will retry automatically in 10 minutes.",
      api_key_configuration_needed:
        "API key required - Please configure your OpenAI API key in settings to enable AI feedback",
    },
    notifications: {
      api_key_setup_title:
        "🤖 AI Code Feedback: OpenAI API key required for AI features.",
      api_key_setup_message:
        "🤖 AI Code Feedback: OpenAI API key required for AI features.",
      too_many_errors_warning:
        "⚠️ AI Code Feedback: Too many consecutive errors. AI features temporarily disabled for 10 minutes.",
      rate_limit_warning:
        "⏱️ AI Code Feedback: Rate limit reached. AI features will resume in approximately {minutes} minute(s).",
      quota_exceeded_error:
        "💳 AI Code Feedback: OpenAI API quota exceeded. Please check your billing.",
      network_warning:
        "🌐 AI Code Feedback: Network connection issue. Will retry automatically.",
      service_unavailable_warning:
        "🔧 AI Code Feedback: OpenAI service temporarily unavailable. Will retry automatically.",
      ai_re_enabled: "✅ AI Code Feedback: AI analysis has been re-enabled.",
      rate_limit_passed:
        "✅ AI Code Feedback: Rate limit period has passed. AI analysis is now available again.",
    },
    actions: {
      open_settings: "Open Settings",
      get_api_key: "Get API Key",
      disable_ai: "Disable AI Features",
      check_billing: "Check Billing",
      learn_more: "Learn More",
    },
    ui: {
      panel_title: "🤖 AI Code Feedback",
      ai_analysis_prefix: "🎯",
      ai_review_prefix: "🔍 AI Code Review:",
    },
  },
  espanol: {
    cursor_analysis: {
      function:
        "Cursor pausado para análisis. Contexto actual: Definición de función - Considera: ¿Esta función tiene una sola responsabilidad?",
      conditional:
        "Cursor pausado para análisis. Contexto actual: Lógica condicional - Considera: ¿Se puede simplificar esta condición o extraer a una variable?",
      loop: "Cursor pausado para análisis. Contexto actual: Lógica de bucle - Considera: ¿Es necesaria esta complejidad del bucle? ¿Se puede refactorizar?",
      comment:
        "Cursor pausado para análisis. Contexto actual: Comentario - ¡Buena práctica! Los comentarios ayudan a explicar el 'por qué', no solo el 'qué'.",
      long_line:
        "Cursor pausado para análisis. Contexto actual: Línea larga ({length} caracteres) - Considera dividirla en múltiples líneas para mejor legibilidad.",
      empty_line:
        "Cursor pausado para análisis. Contexto actual: Línea vacía - Los espacios en blanco pueden mejorar la legibilidad cuando se usan con propósito.",
      generic: "Cursor pausado para análisis. Contexto actual: {context}",
    },
    newline_messages: {
      single: "✨ Nueva línea añadida - ¡excelente estructura!",
      multiple:
        "✨ {count} nuevas líneas añadidas - ¡buena organización del código!",
    },
    errors: {
      api_key_required: "Clave API requerida para análisis IA",
      invalid_api_key: "Clave API inválida - Por favor revisa la configuración",
      rate_limit_reached:
        "Límite de velocidad alcanzado - Se reintentará automáticamente",
      quota_exceeded: "Cuota de API excedida - Revisa la facturación",
      connection_issue: "Problema de conexión - Reintentando...",
      service_unavailable: "Servicio OpenAI no disponible - Reintentando...",
      ai_unavailable: "IA temporalmente no disponible",
      too_many_errors:
        "Funciones IA pausadas debido a errores repetidos. Se reintentará automáticamente en 10 minutos.",
      api_key_configuration_needed:
        "Clave API requerida - Por favor configura tu clave API de OpenAI en los ajustes para habilitar el feedback IA",
    },
    notifications: {
      api_key_setup_title:
        "🤖 AI Code Feedback: Clave API de OpenAI requerida para funciones IA.",
      api_key_setup_message:
        "🤖 AI Code Feedback: Clave API de OpenAI requerida para funciones IA.",
      too_many_errors_warning:
        "⚠️ AI Code Feedback: Demasiados errores consecutivos. Funciones IA deshabilitadas temporalmente por 10 minutos.",
      rate_limit_warning:
        "⏱️ AI Code Feedback: Límite de velocidad alcanzado. Las funciones IA se reanudarán en aproximadamente {minutes} minuto(s).",
      quota_exceeded_error:
        "💳 AI Code Feedback: Cuota de API de OpenAI excedida. Por favor revisa tu facturación.",
      network_warning:
        "🌐 AI Code Feedback: Problema de conexión de red. Se reintentará automáticamente.",
      service_unavailable_warning:
        "🔧 AI Code Feedback: Servicio OpenAI temporalmente no disponible. Se reintentará automáticamente.",
      ai_re_enabled:
        "✅ AI Code Feedback: El análisis IA ha sido rehabilitado.",
      rate_limit_passed:
        "✅ AI Code Feedback: El período de límite de velocidad ha pasado. El análisis IA está disponible nuevamente.",
    },
    actions: {
      open_settings: "Abrir Ajustes",
      get_api_key: "Obtener Clave API",
      disable_ai: "Deshabilitar Funciones IA",
      check_billing: "Revisar Facturación",
      learn_more: "Aprender Más",
    },
    ui: {
      panel_title: "🤖 Feedback IA de Código",
      ai_analysis_prefix: "🎯",
      ai_review_prefix: "🔍 Revisión IA del Código:",
    },
  },
  turkce: {
    cursor_analysis: {
      function:
        "İmleç analiz için durdu. Mevcut bağlam: Fonksiyon tanımı - Düşün: Bu fonksiyonun tek bir sorumluluğu var mı?",
      conditional:
        "İmleç analiz için durdu. Mevcut bağlam: Koşullu mantık - Düşün: Bu koşul basitleştirilebilir mi veya bir değişkene çıkarılabilir mi?",
      loop: "İmleç analiz için durdu. Mevcut bağlam: Döngü mantığı - Düşün: Bu döngü karmaşıklığı gerekli mi? Yeniden düzenlenebilir mi?",
      comment:
        "İmleç analiz için durdu. Mevcut bağlam: Yorum - İyi uygulama! Yorumlar sadece 'ne'yi değil, 'neden'i açıklamaya yardımcı olur.",
      long_line:
        "İmleç analiz için durdu. Mevcut bağlam: Uzun satır ({length} karakter) - Daha iyi okunabilirlik için birden fazla satıra bölmeyi düşün.",
      empty_line:
        "İmleç analiz için durdu. Mevcut bağlam: Boş satır - Beyaz alan, amaçlı kullanıldığında kod okunabilirliğini artırabilir.",
      generic: "İmleç analiz için durdu. Mevcut bağlam: {context}",
    },
    newline_messages: {
      single: "✨ Yeni satır eklendi - harika yapı!",
      multiple: "✨ {count} yeni satır eklendi - iyi kod organizasyonu!",
    },
    errors: {
      api_key_required: "AI analizi için API anahtarı gerekli",
      invalid_api_key: "Geçersiz API anahtarı - Lütfen ayarları kontrol edin",
      rate_limit_reached:
        "Hız sınırına ulaşıldı - Otomatik olarak yeniden denenecek",
      quota_exceeded: "API kotası aşıldı - Faturalandırmayı kontrol edin",
      connection_issue: "Bağlantı sorunu - Yeniden deneniyor...",
      service_unavailable:
        "OpenAI servisi kullanılamıyor - Yeniden deneniyor...",
      ai_unavailable: "AI geçici olarak kullanılamıyor",
      too_many_errors:
        "Tekrarlanan hatalar nedeniyle AI özellikleri duraklatıldı. 10 dakika içinde otomatik olarak yeniden denenecek.",
      api_key_configuration_needed:
        "API anahtarı gerekli - AI geri bildirimini etkinleştirmek için lütfen OpenAI API anahtarınızı ayarlarda yapılandırın",
    },
    notifications: {
      api_key_setup_title:
        "🤖 AI Code Feedback: AI özellikleri için OpenAI API anahtarı gerekli.",
      api_key_setup_message:
        "🤖 AI Code Feedback: AI özellikleri için OpenAI API anahtarı gerekli.",
      too_many_errors_warning:
        "⚠️ AI Code Feedback: Çok fazla ardışık hata. AI özellikleri 10 dakika geçici olarak devre dışı bırakıldı.",
      rate_limit_warning:
        "⏱️ AI Code Feedback: Hız sınırına ulaşıldı. AI özellikleri yaklaşık {minutes} dakika içinde devam edecek.",
      quota_exceeded_error:
        "💳 AI Code Feedback: OpenAI API kotası aşıldı. Lütfen faturalandırmanızı kontrol edin.",
      network_warning:
        "🌐 AI Code Feedback: Ağ bağlantısı sorunu. Otomatik olarak yeniden denenecek.",
      service_unavailable_warning:
        "🔧 AI Code Feedback: OpenAI servisi geçici olarak kullanılamıyor. Otomatik olarak yeniden denenecek.",
      ai_re_enabled: "✅ AI Code Feedback: AI analizi yeniden etkinleştirildi.",
      rate_limit_passed:
        "✅ AI Code Feedback: Hız sınırı süresi geçti. AI analizi şimdi tekrar kullanılabilir.",
    },
    actions: {
      open_settings: "Ayarları Aç",
      get_api_key: "API Anahtarı Al",
      disable_ai: "AI Özelliklerini Devre Dışı Bırak",
      check_billing: "Faturalandırmayı Kontrol Et",
      learn_more: "Daha Fazla Öğren",
    },
    ui: {
      panel_title: "🤖 AI Kod Geri Bildirimi",
      ai_analysis_prefix: "🎯",
      ai_review_prefix: "🔍 AI Kod İncelemesi:",
    },
  },
};

// Aktif dil çevirisini almak için helper fonksiyon
function getTranslations(): Translations {
  const config = vscode.workspace.getConfiguration("codeFeedback");
  const selectedLanguage = config.get("language", "english") as string;

  // Eğer seçilen dil mevcut değilse, varsayılan olarak İngilizce kullan
  return translations[selectedLanguage] || translations.english;
}

// String interpolation için helper fonksiyon - değişken değerleri template'e enjekte eder
function interpolateString(
  template: string,
  values: Record<string, any>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}

// Global değişkenler - kod bloğu seçimi için timer ekledim
let codeBlockSelectionTimer: NodeJS.Timeout | undefined;

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

// Mevcut dilin görünen adını al - kullanıcıya göstermek için
function getCurrentLanguageDisplayName(): string {
  const config = vscode.workspace.getConfiguration("codeFeedback");
  const selectedLanguage = config.get("language", "english") as string;

  const displayNames: Record<string, string> = {
    english: "English",
    espanol: "Español",
    turkce: "Türkçe",
  };

  return displayNames[selectedLanguage] || "English";
}

// Extension'ın ana aktivasyon fonksiyonu
export function activate(context: vscode.ExtensionContext) {
  console.log("AI Code Feedback extension is now active!");

  // Configuration değişikliklerini dinle - kullanıcı ayarları değiştirdiğinde tetiklenir
  const configChangeListener = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      // Sadece bizim extension'ımızla ilgili değişiklikleri kontrol et
      if (event.affectsConfiguration("codeFeedback.language")) {
        console.log("Language setting changed, updating interface...");

        // Mevcut feedback panelini yeni dille güncelle
        updateFeedbackPanel();

        // Kullanıcıya değişikliğin uygulandığını bildir
        const t = getTranslations();
        addFeedback(
          `✅ Language changed to: ${getCurrentLanguageDisplayName()}`,
          "ai"
        );
      }

      // API anahtarı değişikliklerini de kontrol et
      if (event.affectsConfiguration("codeFeedback.openai.apiKey")) {
        console.log("API key setting changed");
        // Eğer AI geçici olarak devre dışıysa ve yeni API key varsa, tekrar etkinleştir
        const config = getAIConfig();
        if (config.apiKey && isAITemporarilyDisabled) {
          isAITemporarilyDisabled = false;
          consecutiveErrors = 0;
          const t = getTranslations();
          addFeedback("✅ API key updated - AI features re-enabled!", "ai");
        }
      }
    }
  );

  // Listener'ı context'e ekle - extension kapanırken temizlensin
  context.subscriptions.push(configChangeListener);

  // Extension ayarlarını kaydet ve kontrol et
  registerConfiguration();

  // Feedback panelini oluştur - kullanıcının feedback'leri göreceği yer
  createFeedbackPanel(context);

  // İmleç hareketi dinleyicisi - kullanıcı imleci bir yerde bıraktığında tetiklenir
  const cursorListener = vscode.window.onDidChangeTextEditorSelection(
    (event) => {
      handleCursorMovement(event);
      handleCodeBlockSelection(event); // Yeni özellik: Kod bloğu seçimi
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
  const t = getTranslations(); // Çeviri sistemini kullan

  // API anahtarının varlığını kontrol et - bu kritik bir gereksinim
  if (!config.has("openai.apiKey") || !config.get("openai.apiKey")) {
    // Kullanıcıya nazikçe bilgi ver ve seçenekler sun
    vscode.window
      .showInformationMessage(
        t.notifications.api_key_setup_title,
        t.actions.open_settings,
        t.actions.get_api_key
      )
      .then((selection) => {
        if (selection === t.actions.open_settings) {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "codeFeedback"
          );
        } else if (selection === t.actions.get_api_key) {
          vscode.env.openExternal(
            vscode.Uri.parse("https://platform.openai.com/api-keys")
          );
        }
      });

    // Feedback paneline de bilgi ekle
    addFeedback(t.errors.api_key_configuration_needed, "error");
  }
}

// Feedback panelini oluştur - kullanıcı arayüzünün merkezi
function createFeedbackPanel(context: vscode.ExtensionContext) {
  const t = getTranslations(); // Çeviri sistemini kullan

  feedbackPanel = vscode.window.createWebviewPanel(
    "aiFeedback",
    t.ui.panel_title,
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
    }
  );

  // İlk paneli güncelle
  updateFeedbackPanel();
}

// Kod bloğu seçimi işleyicisi - kullanıcı kod seçtiğinde tetiklenir
function handleCodeBlockSelection(
  event: vscode.TextEditorSelectionChangeEvent
) {
  // Önceki timer'ı temizle - yeni seçim olduğu için
  if (codeBlockSelectionTimer) {
    clearTimeout(codeBlockSelectionTimer);
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  // Seçim kontrolü - kullanıcının gerçekten kod seçip seçmediğini kontrol et
  const selection = editor.selection;

  // Eğer seçim yoksa veya tek karakter seçilmişse, işlem yapma
  if (
    selection.isEmpty ||
    (selection.start.line === selection.end.line &&
      selection.end.character - selection.start.character < 2)
  ) {
    return;
  }

  // Seçilen metni al
  const selectedText = editor.document.getText(selection).trim();

  // Eğer seçilen metin çok kısa ise (5 karakterden az) işlem yapma
  if (selectedText.length < 5) {
    return;
  }

  // 2 saniye bekle - kullanıcı seçimini tamamlaması için
  codeBlockSelectionTimer = setTimeout(async () => {
    const t = getTranslations(); // Çeviri sistemini kullan

    // Kullanıcıya seçim hakkında bilgi ver
    addFeedback(
      `📝 Code block selected (${
        selection.end.line - selection.start.line + 1
      } lines) - Analyzing...`,
      "cursor"
    );

    // AI'dan kod bloğu analizi iste
    await requestAICodeBlockAnalysis(selectedText, selection, editor.document);
  }, 2000);
}

// İmleç hareketi işleyicisi - kullanıcı imleci belli bir yerde bıraktığında tetiklenir
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
  const t = getTranslations(); // Çeviri sistemini kullan

  // Her değişikliği kontrol et ve kullanıcıya pozitif feedback ver
  for (const change of event.contentChanges) {
    if (change.text.includes("\n")) {
      const lineCount = change.text.split("\n").length - 1;
      let message =
        lineCount === 1
          ? t.newline_messages.single
          : interpolateString(t.newline_messages.multiple, {
              count: lineCount,
            });
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
  const t = getTranslations(); // Çeviri sistemini kullan

  consecutiveErrors++;
  lastErrorTime = Date.now();

  // Feedback paneline hata durumunu hemen bildir - bu çok önemli!
  const userFriendlyMessage = getUserFriendlyErrorMessage(aiError);
  addFeedback(`❌ ${userFriendlyMessage}`, "error");

  // Çok fazla ardışık hata varsa AI'ı geçici olarak devre dışı bırak
  if (consecutiveErrors >= 3) {
    isAITemporarilyDisabled = true;

    vscode.window.showWarningMessage(t.notifications.too_many_errors_warning);
    addFeedback(t.errors.too_many_errors, "error");

    // 10 dakika sonra tekrar dene
    setTimeout(() => {
      isAITemporarilyDisabled = false;
      consecutiveErrors = 0;
      vscode.window.showInformationMessage(t.notifications.ai_re_enabled);
      addFeedback("✅ AI features re-enabled and ready!", "ai");
    }, 10 * 60 * 1000); // 10 dakika

    return; // Erken çık, daha fazla bildirim gösterme
  }

  // Hata türüne göre uygun bildirim göster - her hata farklı yaklaşım gerektirir
  switch (aiError.type) {
    case AIErrorType.AUTHENTICATION:
      const authAction = await vscode.window.showErrorMessage(
        t.notifications.api_key_setup_title,
        t.actions.open_settings,
        t.actions.get_api_key,
        t.actions.disable_ai
      );

      if (authAction === t.actions.open_settings) {
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "codeFeedback.openai.apiKey"
        );
      } else if (authAction === t.actions.get_api_key) {
        vscode.env.openExternal(
          vscode.Uri.parse("https://platform.openai.com/api-keys")
        );
      } else if (authAction === t.actions.disable_ai) {
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
        interpolateString(t.notifications.rate_limit_warning, { minutes })
      );

      // Rate limit süresini bekle ve sonra tekrar etkinleştir
      setTimeout(() => {
        consecutiveErrors = Math.max(0, consecutiveErrors - 1);
        addFeedback("✅ Rate limit period passed - AI ready!", "ai");
      }, waitTime * 1000);
      break;

    case AIErrorType.QUOTA_EXCEEDED:
      const quotaAction = await vscode.window.showErrorMessage(
        t.notifications.quota_exceeded_error,
        t.actions.check_billing,
        t.actions.disable_ai
      );

      if (quotaAction === t.actions.check_billing) {
        vscode.env.openExternal(
          vscode.Uri.parse("https://platform.openai.com/account/billing")
        );
      } else if (quotaAction === t.actions.disable_ai) {
        await vscode.workspace
          .getConfiguration("codeFeedback")
          .update("ai.enabled", false, vscode.ConfigurationTarget.Global);
        addFeedback("AI features disabled due to quota issues", "error");
      }
      break;

    case AIErrorType.NETWORK:
      if (consecutiveErrors === 1) {
        // İlk network hatası için sadece feedback panelinde bildir
        vscode.window.showWarningMessage(t.notifications.network_warning);
      }
      break;

    case AIErrorType.SERVICE_UNAVAILABLE:
      vscode.window.showWarningMessage(
        t.notifications.service_unavailable_warning
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
  const t = getTranslations(); // Çeviri sistemini kullan

  switch (error.type) {
    case AIErrorType.AUTHENTICATION:
      return t.errors.invalid_api_key;
    case AIErrorType.RATE_LIMIT:
      return t.errors.rate_limit_reached;
    case AIErrorType.QUOTA_EXCEEDED:
      return t.errors.quota_exceeded;
    case AIErrorType.NETWORK:
      return t.errors.connection_issue;
    case AIErrorType.SERVICE_UNAVAILABLE:
      return t.errors.service_unavailable;
    default:
      return t.errors.ai_unavailable;
  }
}

const aiSystemMessages: Record<string, string> = {
  english: `You are an expert code mentor who provides brief, constructive feedback to help developers improve their coding skills. Always be encouraging and focus on learning opportunities. 

IMPORTANT: Respond in English with plain text only (no markdown formatting):
- Keep responses under 150 characters
- Use simple, clear language
- Be encouraging and educational
- No special formatting, bullet points, or code blocks`,

  espanol: `Eres un mentor experto en programación que proporciona retroalimentación breve y constructiva para ayudar a los desarrolladores a mejorar sus habilidades de codificación. Siempre sé alentador y enfócate en las oportunidades de aprendizaje.

IMPORTANTE: Responde en español con texto plano solamente (sin formato markdown):
- Mantén las respuestas bajo 150 caracteres
- Usa lenguaje simple y claro
- Sé alentador y educativo
- Sin formato especial, viñetas o bloques de código`,

  turkce: `Geliştiricilerin kodlama becerilerini geliştirmelerine yardımcı olmak için kısa, yapıcı geri bildirim sağlayan uzman bir kod mentorsun. Her zaman cesaretlendirici ol ve öğrenme fırsatlarına odaklan.

ÖNEMLİ: Türkçe yanıt ver ve sadece düz metin kullan (markdown formatı yok):
- Yanıtları 150 karakter altında tut
- Açık ve basit dil kullan
- Teşvik edici ve eğitici ol
- Özel format, madde işareti veya kod bloğu yok`,
};

function getLanguageSpecificPromptSuffix(): string {
  const config = vscode.workspace.getConfiguration("codeFeedback");
  const selectedLanguage = config.get("language", "english") as string;

  const suffixes: Record<string, string> = {
    english: `

Please provide your response in English using simple language. Keep it under 150 characters. Use plain text only, no formatting.`,

    espanol: `

Por favor proporciona tu respuesta en español usando lenguaje simple. Manténla bajo 150 caracteres. Solo texto plano, sin formato.`,

    turkce: `

Lütfen yanıtını Türkçe olarak basit dil kullanarak ver. 150 karakter altında tut. Sadece düz metin, format yok.`,
  };

  return suffixes[selectedLanguage] || suffixes.english;
}
async function requestAICodeBlockAnalysis(
  selectedCode: string,
  selection: vscode.Selection,
  document: vscode.TextDocument
) {
  const config = getAIConfig();
  const t = getTranslations();

  if (!config.enabled || !config.apiKey || isAITemporarilyDisabled) {
    if (!config.apiKey) {
      addFeedback(`⚠️ ${t.errors.api_key_required}`, "error");
    }
    return;
  }

  try {
    const contextBefore = getContextAroundSelection(
      document,
      selection,
      "before"
    );
    const contextAfter = getContextAroundSelection(
      document,
      selection,
      "after"
    );
    const blockType = identifyCodeBlockType(selectedCode, document.languageId);
    const languageSuffix = getLanguageSpecificPromptSuffix();

    const prompt = `You are a programming teacher helping a student. The student selected this ${document.languageId} code block:

${selectedCode}

Block type: ${blockType}

Give brief feedback about this code block. Focus on:
1. Any syntax errors
2. Logic issues
3. One improvement suggestion

Keep response under 150 characters, plain text only.${languageSuffix}`;

    const aiResponse = await callOpenAI(prompt, config);
    if (aiResponse) {
      addFeedback(`🔍 Code Block: ${aiResponse}`, "ai");
    }
  } catch (error) {
    console.error("AI code block analysis error:", error);
  }
}

// Güncellenen AI context analizi fonksiyonu - çok dilli destek ile
async function requestAIContextAnalysis(
  lineText: string,
  position: vscode.Position,
  document: vscode.TextDocument
) {
  const config = getAIConfig();
  const t = getTranslations();

  if (!config.enabled || !config.apiKey || isAITemporarilyDisabled) {
    if (!config.apiKey) {
      addFeedback(`⚠️ ${t.errors.api_key_required}`, "error");
    }
    return;
  }

  try {
    const context = gatherCodeContext(document, position);
    const languageSuffix = getLanguageSpecificPromptSuffix();

    const prompt = `You are a programming teacher. The student's cursor is at this line: "${lineText}"

Context:
${context}

Check for syntax errors or give one brief improvement tip. Keep response under 150 characters, plain text only.${languageSuffix}`;

    const aiResponse = await callOpenAI(prompt, config);
    if (aiResponse) {
      addFeedback(`${t.ui.ai_analysis_prefix} ${aiResponse}`, "cursor");
    }
  } catch (error) {
    console.error("AI context analysis error:", error);
  }
}

// Güncellenen AI kod analizi fonksiyonu
async function requestAICodeAnalysis(document: vscode.TextDocument) {
  const config = getAIConfig();
  const t = getTranslations();

  if (!config.enabled || !config.apiKey || isAITemporarilyDisabled) {
    return;
  }

  try {
    const codeSnippet = document.getText();
    const maxLength = 2000;
    const analysisCode =
      codeSnippet.length > maxLength
        ? codeSnippet.substring(0, maxLength) + "\n// ... (truncated)"
        : codeSnippet;

    const languageSuffix = getLanguageSpecificPromptSuffix();

    const prompt = `You are a programming teacher reviewing a student's ${document.languageId} code:

${analysisCode}

Give brief feedback focusing on:
1. Main syntax errors
2. One improvement suggestion

Keep response under 150 characters, plain text only.${languageSuffix}`;

    const aiResponse = await callOpenAI(prompt, config);
    if (aiResponse) {
      addFeedback(`${t.ui.ai_review_prefix} ${aiResponse}`, "ai");
    }
  } catch (error) {
    console.error("AI code analysis error:", error);
  }
}

async function callOpenAI(
  prompt: string,
  config: AIConfig
): Promise<string | null> {
  if (isAITemporarilyDisabled) {
    return null;
  }

  try {
    console.log("Making OpenAI API call...");

    // Seçilen dile göre sistem mesajını al
    const selectedLanguage = vscode.workspace
      .getConfiguration("codeFeedback")
      .get("language", "english") as string;
    const systemMessage =
      aiSystemMessages[selectedLanguage] || aiSystemMessages.english;

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
            content: systemMessage,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150, // 120 karakter için yeterli token
        temperature: 0.7,
      }),
    });

    console.log("OpenAI API response status:", response.status);

    if (response.ok) {
      consecutiveErrors = 0;
      const data = (await response.json()) as OpenAIResponse;
      const result = data.choices[0]?.message?.content?.trim() || null;
      console.log(
        "OpenAI API success:",
        result ? "Got response" : "Empty response"
      );
      return result;
    } else {
      console.log("OpenAI API error response:", await response.text());
      const aiError = categorizeAIError(
        new Error(`HTTP ${response.status}`),
        response
      );
      await handleAIError(aiError);
      return null;
    }
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    const aiError = categorizeAIError(error);
    await handleAIError(aiError);
    return null;
  }
}

// Mevcut context'i analiz et - AI olmadan da çalışan temel analiz
function analyzeCurrentContext(
  lineText: string,
  position: vscode.Position
): string {
  const t = getTranslations(); // Çeviri sistemini kullan
  const trimmedLine = lineText.trim();

  // Farklı kod yapıları için context-aware mesajlar
  if (trimmedLine.startsWith("function") || trimmedLine.includes("=>")) {
    return t.cursor_analysis.function;
  } else if (trimmedLine.includes("if") || trimmedLine.includes("else")) {
    return t.cursor_analysis.conditional;
  } else if (trimmedLine.includes("for") || trimmedLine.includes("while")) {
    return t.cursor_analysis.loop;
  } else if (trimmedLine.includes("//") || trimmedLine.includes("/*")) {
    return t.cursor_analysis.comment;
  } else if (trimmedLine.length > 100) {
    return interpolateString(t.cursor_analysis.long_line, {
      length: trimmedLine.length,
    });
  } else if (trimmedLine === "") {
    return t.cursor_analysis.empty_line;
  }

  const context =
    trimmedLine.length > 50
      ? trimmedLine.substring(0, 50) + "..."
      : trimmedLine;
  return interpolateString(t.cursor_analysis.generic, { context });
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

// Kod bloğu seçimi için yardımcı fonksiyonlar
function getContextAroundSelection(
  document: vscode.TextDocument,
  selection: vscode.Selection,
  direction: "before" | "after"
): string {
  const maxLines = 3;
  let context = "";

  if (direction === "before") {
    const startLine = Math.max(0, selection.start.line - maxLines);
    for (let i = startLine; i < selection.start.line; i++) {
      context += document.lineAt(i).text + "\n";
    }
  } else {
    const endLine = Math.min(
      document.lineCount - 1,
      selection.end.line + maxLines
    );
    for (let i = selection.end.line + 1; i <= endLine; i++) {
      context += document.lineAt(i).text + "\n";
    }
  }

  return context.trim();
}

function identifyCodeBlockType(code: string, languageId: string): string {
  const trimmedCode = code.trim().toLowerCase();

  // Temel kod bloğu türlerini belirle
  if (trimmedCode.includes("function") || trimmedCode.includes("def ")) {
    return "Function Definition";
  } else if (trimmedCode.includes("if ") || trimmedCode.includes("else")) {
    return "Conditional Statement";
  } else if (trimmedCode.includes("for ") || trimmedCode.includes("while ")) {
    return "Loop Structure";
  } else if (trimmedCode.includes("class ")) {
    return "Class Definition";
  } else if (trimmedCode.includes("try ") || trimmedCode.includes("catch")) {
    return "Error Handling Block";
  } else if (trimmedCode.includes("{") && trimmedCode.includes("}")) {
    return "Code Block";
  } else {
    return "Code Fragment";
  }
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

// Güncellenen updateFeedbackPanel fonksiyonu - markdown desteği ile
function updateFeedbackPanel() {
  if (feedbackPanel) {
    const t = getTranslations();

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
                        margin-top: 2px;
                    }
                    
                    .feedback-content {
                        flex: 1;
                        font-size: 13px;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }
                    
                    .feedback-time {
                        font-size: 11px;
                        color: var(--vscode-descriptionForeground);
                        flex-shrink: 0;
                        margin-top: 2px;
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
                    
                    .panel-title {
                        color: var(--vscode-titleBar-activeForeground);
                        border-bottom: 1px solid var(--vscode-widget-border);
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                        font-size: 16px;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="panel-title">${t.ui.panel_title}</div>
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
      return "👆";
    case "newline":
      return "↵";
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
  if (codeBlockSelectionTimer) {
    clearTimeout(codeBlockSelectionTimer);
  }
}

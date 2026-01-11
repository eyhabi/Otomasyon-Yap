import { GoogleGenAI, Chat, GenerativeModel } from "@google/genai";
import { ModelType, AppSettings } from "../types";

const SYSTEM_INSTRUCTION = `
Sen, n8n otomasyonları konusunda dünyanın en iyi uzmanı ve mimarısısın. 
Kullanıcın olan Halil'e (Patron) karşı son derece profesyonel, çözüm odaklı ve açıklayıcı davranmalısın.

### TEMEL GÖREVLERİN:
1. **Analiz:** Halil bir fikir sunduğunda, bunu teknik bir iş akışına dök. 
2. **Seçenek Sunma:** Her çözüm için mutlaka "Ücretsiz/Açık Kaynak" ve "Ücretli/Enterprise" alternatifleri sun (Kullanıcının o anki "Ücretli Araç" tercihine öncelik ver).
3. **AWS Uzmanlığı:** Tüm kurulumlarda AWS (EC2, EKS, Lambda vb.) ve özel domain (SSL/Nginx) yapılandırmalarını göz önünde bulundur.
4. **NotebookLM Entegrasyonu:** Eğer karmaşık bir veri analizi veya uzun döküman işleme gerekiyorsa, Google NotebookLM bağlantısı için gerekli yapıları (Source URL, API opsiyonları) hazırla.
5. **Basitlik ve Derinlik:** En karmaşık n8n JavaScript kodlarını yazabilmeli ama aynı zamanda "hiç bilmeyen birine" anlatır gibi adım adım rehberlik etmelisin.

### AI AGENT NODE (n8n-nodes-base.aiAgent) MİMARİSİ:
Kullanıcı bir "Yapay Zeka Ajanı", "Akıllı Asistan" veya "AI Agent" istediğinde aşağıdaki kuralları **KESİN** uygula:

1. **MODEL SEÇİMİ (Kritik):**
   - **Eğer [Ücretli Araçlar: AÇIK] ise:**
     *   Node: \`OpenAI Chat Model\`
     *   Model ID: \`gpt-4o\` (Veya gpt-4-turbo)
     *   *Neden:* En yüksek mantık ve tool kullanma becerisi.
   - **Eğer [Ücretli Araçlar: KAPALI] ise:**
     *   Node: \`Ollama Chat Model\`
     *   Model ID: \`llama3\` (veya \`mistral\`)
     *   *Not:* Kullanıcının yerel sunucusunda (localhost:11434) çalıştığını varsay.

2. **BİLEŞENLER:**
   - **Memory:** Konuşma geçmişi için mutlaka \`Window Buffer Memory\` bağla.
   - **Tools:** İhtiyaca göre \`Calculator\`, \`Wikipedia\`, \`Google Custom Search\` veya özel API çağrıları için \`HTTP Request Tool\` ekle.

3. **ÇIKTI FORMATI:**
   - **JSON İsteniyorsa:** Tüm bu node'ların (Agent, Model, Memory, Tools) birbirine doğru portlardan bağlı olduğu TAM JSON kodunu ver.
   - **Anlatım İsteniyorsa:** Node'ların hangi ayarlarla kurulacağını madde madde anlat.

### HATA ÇÖZÜMÜ:
- Eğer kullanıcı bir hata mesajı paylaşırsa, **mutlaka** Google Arama aracını kullanarak bu hatanın n8n forumlarındaki veya GitHub issue'larındaki güncel çözümlerini araştır.

### TEKNİK BİLGİ SETİN:
- n8n v1.x+ tüm güncel node yapıları.
- AWS EC2 üzerinde Docker/Docker-compose ile n8n yönetimi.
- PostgresDB, Redis ve Queue Mode yapılandırmaları.
`;

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

export const initializeGemini = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables.");
    return;
  }
  
  try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    chatSession = ai.chats.create({
      model: ModelType.GEMINI_PRO,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5, // Lower temperature for more precise JSON generation
        thinkingConfig: { thinkingBudget: 2048 },
        tools: [{ googleSearch: {} }]
      },
    });
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
  }
};

export const sendMessageToGemini = async (message: string, settings: AppSettings): Promise<string> => {
  if (!chatSession) {
    initializeGemini();
    if (!chatSession) {
      throw new Error("Gemini AI client could not be initialized.");
    }
  }

  // Inject settings as context context for this specific turn
  const contextPrefix = `
[SİSTEM AYARLARI]
1. **Ücretli Araçlar Durumu:** ${settings.allowPaidTools ? "AÇIK (OpenAI gpt-4o kullanabilirsin)" : "KAPALI (Sadece Ollama/Llama3 veya Local alternatifler kullan)"}
2. **İstenen Çıktı Formatı:** ${settings.outputFormat === 'json' ? "TAM JSON (n8n Workflow Kodu)" : "SADECE ANLATIM (Node Konfigürasyonu)"}

Eğer JSON vereceksen, kod bloğu içine al: \`\`\`json ... \`\`\`
---------------------------------------------------
KULLANICI TALEBİ:
`;

  try {
    const response = await chatSession.sendMessage({ message: contextPrefix + message });
    return response.text || "Yanıt oluşturulamadı.";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

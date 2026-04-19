import ChatbotAdminPanel from "@/components/admin/ChatbotAdminPanel"

export default function AdminChatbotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Akıllı Sohbet Robotu</h1>
        <p className="text-sm text-muted-foreground">
          AI Chatbot kalıplarını, otomatik cevapları ve sistem bilgisini yönetin
        </p>
      </div>
      <ChatbotAdminPanel />
    </div>
  )
}

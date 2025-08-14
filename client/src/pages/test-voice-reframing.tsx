import { useState } from 'react';
import { ArrowLeft, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceModeToggle } from '@/components/voice/voice-mode-toggle';

export default function TestVoiceReframing() {
  const [conversationData, setConversationData] = useState<any>(null);

  const handleConversationData = (data: any) => {
    console.log('Conversation data received:', data);
    setConversationData(data);
  };

  const clearData = () => {
    setConversationData(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-stone-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.history.back()}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-purple-600" />
              <h1 className="text-xl font-serif font-semibold text-stone-800">
                Voice Reframing Test
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Instructions */}
        <Card className="rounded-organic border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-stone-800 flex items-center gap-2">
              🧪 테스트 지침
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-stone-700">
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="font-medium text-purple-800 mb-2">음성 대화 시작하기:</p>
              <ol className="list-decimal list-inside space-y-1 text-purple-700">
                <li>"음성 대화 시작" 버튼을 클릭</li>
                <li>브라우저에서 마이크 권한 허용</li>
                <li>AI가 질문하면 자연스럽게 대답</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-800 mb-2">테스트 시나리오:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li><strong>감정 선택:</strong> "수치심", "공허함", "질투", "조급함", "인정욕구", "열등감" 중 하나</li>
                <li><strong>상황 설명:</strong> 구체적인 경험이나 상황 설명</li>
                <li><strong>추가 감정:</strong> 함께 느낀 다른 감정들 설명</li>
                <li><strong>리프레이밍:</strong> AI가 제시하는 새로운 관점 확인</li>
              </ul>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-medium text-green-800 mb-2">음성 명령어:</p>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                <li>"다시", "다른 방식으로" - 다른 리프레이밍 생성</li>
                <li>"좋아", "네", "맞아" - 긍정적 응답</li>
                <li>"그만", "끝" - 대화 종료</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Voice Interface */}
        <VoiceModeToggle 
          onConversationData={handleConversationData}
          className="max-w-2xl mx-auto"
        />

        {/* Conversation Data Display */}
        {conversationData && (
          <Card className="rounded-organic border-green-200 max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-green-800 flex items-center gap-2">
                  📊 대화 데이터
                </CardTitle>
                <Button
                  onClick={clearData}
                  variant="outline"
                  size="sm"
                  className="text-green-700 border-green-300 hover:bg-green-50"
                >
                  데이터 지우기
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Emotion Data */}
              {conversationData.emotion && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">선택된 감정:</h4>
                  <p className="text-green-700">
                    <strong>ID:</strong> {conversationData.emotion} | 
                    <strong> 이름:</strong> {conversationData.emotionName}
                  </p>
                </div>
              )}

              {/* Responses */}
              {conversationData.responses && conversationData.responses.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">사용자 응답:</h4>
                  {conversationData.responses.map((response: string, index: number) => (
                    response && (
                      <div key={index} className="mb-2">
                        <strong className="text-blue-700">응답 {index + 1}:</strong>
                        <p className="text-blue-600 ml-4 bg-white p-2 rounded border border-blue-200">
                          {response}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Context (Conversation History) */}
              {conversationData.context && conversationData.context.length > 0 && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">대화 기록:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {conversationData.context.map((message: string, index: number) => (
                      <p key={index} className="text-purple-600 text-xs bg-white p-2 rounded border border-purple-200">
                        {message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Data for Development */}
              <details className="bg-gray-50 p-3 rounded-lg">
                <summary className="font-medium text-gray-800 cursor-pointer">
                  🔍 원시 데이터 (개발용)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(conversationData, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}

        {/* Technical Info */}
        <Card className="rounded-organic border-stone-300 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-stone-800">
              🔧 기술 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-stone-600 space-y-2">
            <p><strong>음성 인식:</strong> Web Speech API (webkitSpeechRecognition)</p>
            <p><strong>음성 합성:</strong> Web Speech API (speechSynthesis)</p>
            <p><strong>언어 설정:</strong> 한국어 (ko-KR)</p>
            <p><strong>AI 유형:</strong> 규칙 기반 더미 AI (향후 ChatGPT 연동 예정)</p>
            <p><strong>브라우저 호환성:</strong> Chrome, Edge, Safari (Firefox 제한적)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
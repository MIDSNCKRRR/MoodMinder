import React, { useState } from "react";
import { Twitter, Instagram, Download, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { socialSharingService, ShareData } from "@/services/social-sharing";

interface MemeDisplayProps {
  memeUrl: string;
  description: string;
  keywords: string[];
  reflection?: string;
  onClose?: () => void;
}

export default function MemeDisplay({
  memeUrl,
  description,
  keywords,
  reflection,
  onClose
}: MemeDisplayProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const shareData: ShareData = {
    memeUrl,
    description,
    keywords,
    reflection
  };

  const handleTwitterShare = async () => {
    try {
      setIsSharing(true);
      await socialSharingService.shareToTwitter(shareData);
      toast({
        title: "트위터 공유",
        description: "트위터 공유 창이 열렸습니다!",
      });
    } catch (error) {
      toast({
        title: "공유 실패",
        description: error instanceof Error ? error.message : "트위터 공유에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleInstagramShare = async () => {
    try {
      setIsSharing(true);
      await socialSharingService.shareToInstagram(shareData);
      toast({
        title: "Instagram 준비 완료",
        description: "메시지가 클립보드에 복사되었습니다!",
      });
    } catch (error) {
      toast({
        title: "공유 실패",
        description: error instanceof Error ? error.message : "Instagram 공유 준비에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const filename = `identity-meme-${keywords[0] || 'meme'}-${Date.now()}.png`;
      await socialSharingService.downloadMeme(memeUrl, filename);
      toast({
        title: "다운로드 완료",
        description: "밈이 다운로드되었습니다!",
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: error instanceof Error ? error.message : "다운로드에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleGenericShare = async () => {
    try {
      setIsSharing(true);
      await socialSharingService.shareGeneric(shareData);
      toast({
        title: "공유 준비 완료",
        description: "공유할 수 있습니다!",
      });
    } catch (error) {
      toast({
        title: "공유 실패",
        description: error instanceof Error ? error.message : "공유에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyMessage = async () => {
    try {
      const hashtags = keywords.map(keyword => `#${keyword.replace(/\s+/g, '')}`).join(' ');
      const message = `내 정체성을 표현한 밈을 만들었어요! 🎨✨ ${hashtags} #MoodMinder #정체성저널 #밈`;
      
      await navigator.clipboard.writeText(message);
      toast({
        title: "복사 완료",
        description: "메시지가 클립보드에 복사되었습니다!",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "메시지 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-organic stone-shadow border-0">
        <CardContent className="p-6 text-center">
          {/* Meme Image */}
          <div className="mb-6">
            <img 
              src={memeUrl} 
              alt={description}
              className="mx-auto max-w-full h-auto rounded-lg shadow-lg max-h-96 object-contain"
            />
          </div>

          {/* Meme Description */}
          <h3 className="text-xl font-serif font-semibold text-stone-700 mb-2">
            {description}
          </h3>

          {/* Keywords */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {keywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm font-medium"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Sharing Buttons */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-stone-600 mb-3">
              밈을 공유해보세요! 🚀
            </h4>
            
            {/* Primary sharing buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={handleTwitterShare}
                disabled={isSharing}
                className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
                size="sm"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              
              <Button
                onClick={handleInstagramShare}
                disabled={isSharing}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-white"
                size="sm"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
              
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="border-stone-300 text-stone-600 hover:bg-stone-50"
              >
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
            </div>

            {/* Secondary sharing options */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={handleGenericShare}
                disabled={isSharing}
                variant="ghost"
                size="sm"
                className="text-stone-500 hover:text-stone-700"
              >
                <Share2 className="w-4 h-4 mr-1" />
                기타 공유
              </Button>
              
              <Button
                onClick={handleCopyMessage}
                variant="ghost"
                size="sm"
                className="text-stone-500 hover:text-stone-700"
              >
                <Copy className="w-4 h-4 mr-1" />
                메시지 복사
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-stone-50 rounded-lg">
            <p className="text-sm text-stone-600">
              💡 <strong>Instagram 공유 팁:</strong> 이미지를 다운로드하고, Instagram 앱에서 업로드한 후 복사된 메시지를 붙여넣으세요!
            </p>
          </div>

          {/* Close button if provided */}
          {onClose && (
            <div className="mt-6">
              <Button onClick={onClose} variant="ghost" className="text-stone-500">
                닫기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
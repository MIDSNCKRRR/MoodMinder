interface ShareData {
  memeUrl: string;
  description: string;
  keywords: string[];
  reflection?: string;
}

interface ShareOptions {
  platform: 'twitter' | 'instagram';
  customMessage?: string;
}

class SocialSharingService {
  private generateShareMessage(data: ShareData, customMessage?: string): string {
    if (customMessage) {
      return customMessage;
    }

    const hashtags = data.keywords.map(keyword => `#${keyword.replace(/\s+/g, '')}`).join(' ');
    const defaultMessage = `내 정체성을 표현한 밈을 만들었어요! 🎨✨ ${hashtags} #MoodMinder #정체성저널 #밈`;
    
    return defaultMessage;
  }

  async shareToTwitter(data: ShareData, options: ShareOptions = { platform: 'twitter' }): Promise<void> {
    try {
      const message = this.generateShareMessage(data, options.customMessage);
      
      // For web sharing, we use Twitter's Web Intent API
      const encodedMessage = encodeURIComponent(message);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
      
      // Open Twitter in a new window
      window.open(twitterUrl, 'twitter-share', 'width=550,height=420,resizable=yes,scrollbars=yes');
      
    } catch (error) {
      console.error('Failed to share to Twitter:', error);
      throw new Error('트위터 공유에 실패했습니다.');
    }
  }

  async shareToInstagram(data: ShareData, options: ShareOptions = { platform: 'instagram' }): Promise<void> {
    try {
      // Instagram doesn't have a direct web sharing API like Twitter
      // We'll provide instructions for manual sharing
      const message = this.generateShareMessage(data, options.customMessage);
      
      // Copy message to clipboard
      await navigator.clipboard.writeText(message);
      
      // Show instructions modal or notification
      const instructions = `
        Instagram 공유 방법:
        1. 밈 이미지를 저장해주세요
        2. Instagram 앱을 열어주세요
        3. 새 게시물을 작성하고 이미지를 업로드해주세요
        4. 메시지가 클립보드에 복사되었습니다. 붙여넣기 해주세요!
      `;
      
      alert(instructions);
      
    } catch (error) {
      console.error('Failed to prepare Instagram share:', error);
      throw new Error('Instagram 공유 준비에 실패했습니다.');
    }
  }

  async downloadMeme(memeUrl: string, filename?: string): Promise<void> {
    try {
      // Create a temporary link element for download
      const link = document.createElement('a');
      link.href = memeUrl;
      link.download = filename || `meme-${Date.now()}.png`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Failed to download meme:', error);
      throw new Error('밈 다운로드에 실패했습니다.');
    }
  }

  async shareGeneric(data: ShareData): Promise<void> {
    try {
      // Check if Web Share API is available
      if (navigator.share) {
        const message = this.generateShareMessage(data);
        
        await navigator.share({
          title: 'My Identity Meme',
          text: message,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        const message = this.generateShareMessage(data);
        await navigator.clipboard.writeText(message);
        alert('메시지가 클립보드에 복사되었습니다!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      throw new Error('공유에 실패했습니다.');
    }
  }

  // Helper method to convert image URL to blob for better sharing
  async convertImageToBlob(imageUrl: string): Promise<Blob | null> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      return await response.blob();
    } catch (error) {
      console.error('Failed to convert image to blob:', error);
      return null;
    }
  }
}

export const socialSharingService = new SocialSharingService();
export type { ShareData, ShareOptions };
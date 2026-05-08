import deeplService from './deepl.service';

/**
 * AI返信提案サービス
 * メッセージの内容を分析して適切な返信を提案
 */
class SuggestionService {
  /**
   * メッセージに対する返信提案を生成
   */
  async generateSuggestions(
    incomingMessage: string,
    _platform: 'chat' | 'email',
    tone: 'formal' | 'casual' = 'formal'
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // メッセージの内容を分析
    const messageType = this.analyzeMessageType(incomingMessage);

    // メッセージタイプに応じた提案を生成
    switch (messageType) {
      case 'question':
        suggestions.push(...this.getQuestionResponses(tone));
        break;
      case 'request':
        suggestions.push(...this.getRequestResponses(tone));
        break;
      case 'information':
        suggestions.push(...this.getInformationResponses(tone));
        break;
      case 'greeting':
        suggestions.push(...this.getGreetingResponses(tone));
        break;
      case 'thanks':
        suggestions.push(...this.getThanksResponses(tone));
        break;
      default:
        suggestions.push(...this.getGeneralResponses(tone));
    }

    // 日本語の提案を英語に翻訳
    const translatedSuggestions = await Promise.all(
      suggestions.map(async (suggestion) => {
        try {
          const result = await deeplService.translate(suggestion, 'en-US', 'ja');
          return result.translatedText;
        } catch (error) {
          console.error('Translation error for suggestion:', error);
          return suggestion;
        }
      })
    );

    return translatedSuggestions;
  }

  /**
   * メッセージタイプを分析
   */
  private analyzeMessageType(message: string): string {
    const lowerMessage = message.toLowerCase();

    // 質問
    if (
      lowerMessage.includes('?') ||
      lowerMessage.match(/^(what|when|where|who|why|how|can|could|would|will|do|does|is|are)/i)
    ) {
      return 'question';
    }

    // 依頼・リクエスト
    if (
      lowerMessage.match(/^(please|could you|would you|can you|i need|i would like)/i) ||
      lowerMessage.includes('request')
    ) {
      return 'request';
    }

    // 感謝
    if (lowerMessage.match(/(thank|thanks|appreciate|grateful)/i)) {
      return 'thanks';
    }

    // 挨拶
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/i)) {
      return 'greeting';
    }

    // 情報提供
    if (
      lowerMessage.match(/(fyi|for your information|just to let you know|update|inform)/i)
    ) {
      return 'information';
    }

    return 'general';
  }

  /**
   * 質問への返信提案
   */
  private getQuestionResponses(tone: 'formal' | 'casual'): string[] {
    if (tone === 'formal') {
      return [
        'ご質問ありがとうございます。詳細を確認して折り返しご連絡いたします。',
        'お問い合わせの件について、確認の上ご回答させていただきます。',
        '承知いたしました。調査して後ほどご報告いたします。',
      ];
    } else {
      return [
        'ありがとうございます！確認して連絡しますね。',
        'わかりました。調べて返信します。',
        '了解です！少し時間をください。',
      ];
    }
  }

  /**
   * 依頼への返信提案
   */
  private getRequestResponses(tone: 'formal' | 'casual'): string[] {
    if (tone === 'formal') {
      return [
        'かしこまりました。ご依頼の件、対応させていただきます。',
        '承知いたしました。早急に対応いたします。',
        'ご依頼ありがとうございます。すぐに取り掛かります。',
      ];
    } else {
      return [
        'わかりました！対応しますね。',
        '了解です。すぐやります。',
        'OKです！取り掛かります。',
      ];
    }
  }

  /**
   * 情報提供への返信提案
   */
  private getInformationResponses(tone: 'formal' | 'casual'): string[] {
    if (tone === 'formal') {
      return [
        'ご連絡ありがとうございます。内容を確認いたしました。',
        '情報共有いただきありがとうございます。承知いたしました。',
        'ご報告ありがとうございます。確認させていただきました。',
      ];
    } else {
      return [
        'ありがとうございます！確認しました。',
        '情報ありがとう。了解です。',
        'わかりました。ありがとう！',
      ];
    }
  }

  /**
   * 挨拶への返信提案
   */
  private getGreetingResponses(tone: 'formal' | 'casual'): string[] {
    if (tone === 'formal') {
      return [
        'お世話になっております。',
        'いつもありがとうございます。',
        'お疲れ様です。',
      ];
    } else {
      return [
        'こんにちは！',
        'お疲れ様です！',
        'どうも！',
      ];
    }
  }

  /**
   * 感謝への返信提案
   */
  private getThanksResponses(tone: 'formal' | 'casual'): string[] {
    if (tone === 'formal') {
      return [
        'どういたしまして。お役に立てて幸いです。',
        'こちらこそありがとうございます。',
        'お力になれて光栄です。',
      ];
    } else {
      return [
        'どういたしまして！',
        'いえいえ、こちらこそ！',
        '全然大丈夫です！',
      ];
    }
  }

  /**
   * 一般的な返信提案
   */
  private getGeneralResponses(tone: 'formal' | 'casual'): string[] {
    if (tone === 'formal') {
      return [
        '承知いたしました。',
        'ご連絡ありがとうございます。',
        '確認させていただきます。',
      ];
    } else {
      return [
        'わかりました！',
        'ありがとう！',
        '了解です！',
      ];
    }
  }

  /**
   * カスタム提案を追加
   */
  async addCustomSuggestion(
    originalText: string,
    translatedText: string
  ): Promise<void> {
    // 将来的にユーザーのカスタム提案を保存する機能
    // データベースに保存して学習させることも可能
    console.log('Custom suggestion added:', { originalText, translatedText });
  }
}

export default new SuggestionService();

// Made with Bob

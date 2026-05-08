/**
 * メッセージをSlack/Email形式に変換するサービス
 */
class FormatterService {
  /**
   * Slack形式に変換
   */
  formatForSlack(text: string, tone: 'formal' | 'casual' = 'casual'): string {
    let formatted = text;

    // カジュアルな場合は絵文字を追加
    if (tone === 'casual') {
      // 挨拶に絵文字を追加
      formatted = formatted.replace(/^(Hi|Hello|Hey)/i, '👋 $1');
      formatted = formatted.replace(/(Thanks|Thank you)/i, '🙏 $1');
      formatted = formatted.replace(/(Good|Great|Excellent)/i, '✨ $1');
    }

    // Slackのマークダウン形式に変換
    // 太字: *text*
    // イタリック: _text_
    // コードブロック: ```code```
    // リンク: <url|text>

    return formatted;
  }

  /**
   * Email形式に変換
   */
  formatForEmail(
    text: string,
    tone: 'formal' | 'casual' = 'formal',
    includeGreeting: boolean = true,
    includeSalutation: boolean = true
  ): string {
    let formatted = '';

    // フォーマルな場合は挨拶と結びを追加
    if (tone === 'formal') {
      if (includeGreeting) {
        formatted += 'Dear [Name],\n\n';
      }

      formatted += text;

      if (includeSalutation) {
        formatted += '\n\nBest regards,\n[Your Name]';
      }
    } else {
      // カジュアルな場合
      if (includeGreeting) {
        formatted += 'Hi [Name],\n\n';
      }

      formatted += text;

      if (includeSalutation) {
        formatted += '\n\nThanks,\n[Your Name]';
      }
    }

    return formatted;
  }

  /**
   * HTMLメール形式に変換
   */
  formatForHtmlEmail(text: string, tone: 'formal' | 'casual' = 'formal'): string {
    const paragraphs = text.split('\n\n');
    let html = '<div style="font-family: Arial, sans-serif; line-height: 1.6;">\n';

    if (tone === 'formal') {
      html += '  <p>Dear [Name],</p>\n';
    } else {
      html += '  <p>Hi [Name],</p>\n';
    }

    paragraphs.forEach((para) => {
      if (para.trim()) {
        html += `  <p>${para.replace(/\n/g, '<br>')}</p>\n`;
      }
    });

    if (tone === 'formal') {
      html += '  <p>Best regards,<br>[Your Name]</p>\n';
    } else {
      html += '  <p>Thanks,<br>[Your Name]</p>\n';
    }

    html += '</div>';
    return html;
  }

  /**
   * 箇条書きを検出してフォーマット
   */
  formatBulletPoints(text: string, platform: 'chat' | 'email'): string {
    const lines = text.split('\n');
    const formatted = lines.map((line) => {
      const trimmed = line.trim();
      
      // 箇条書きのパターンを検出
      if (trimmed.match(/^[-•*]\s/)) {
        if (platform === 'chat') {
          return `• ${trimmed.replace(/^[-•*]\s/, '')}`;
        } else {
          return `- ${trimmed.replace(/^[-•*]\s/, '')}`;
        }
      }
      
      return line;
    });

    return formatted.join('\n');
  }

  /**
   * 署名を追加
   */
  addSignature(text: string, signature: string): string {
    return `${text}\n\n${signature}`;
  }

  /**
   * テンプレート変数を置換
   */
  replaceVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      result = result.replace(regex, value);
    });

    return result;
  }
}

export default new FormatterService();

// Made with Bob

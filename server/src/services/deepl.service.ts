import * as deepl from 'deepl-node';

class DeepLService {
  private translator: deepl.Translator | null = null;

  private getTranslator(): deepl.Translator {
    if (this.translator) {
      return this.translator;
    }

    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPL_API_KEY is not defined in environment variables');
    }

    this.translator = new deepl.Translator(apiKey);
    return this.translator;
  }

  /**
   * 言語コードをDeepL API形式に変換
   */
  private convertToDeepLTargetLang(lang: string): string {
    // DeepL APIは英語の場合、'en-US'または'en-GB'を要求
    // 日本語は'ja'、中国語は'zh'など
    const langMap: { [key: string]: string } = {
      'en': 'en-US',
      'pt': 'pt-BR',
      'zh': 'zh',
    };
    
    return langMap[lang] || lang;
  }

  /**
   * テキストを翻訳する
   */
  async translate(
    text: string,
    targetLang: string,
    sourceLang?: string
  ): Promise<{ translatedText: string; detectedSourceLang: string }> {
    try {
      if (!process.env.DEEPL_API_KEY) {
        throw new Error('DEEPL_API_KEY is not defined in environment variables');
      }

      // 言語コードをDeepL形式に変換
      const deeplTargetLang = this.convertToDeepLTargetLang(targetLang);

      const result = await this.getTranslator().translateText(
        text,
        (sourceLang as deepl.SourceLanguageCode | null | undefined) ?? null,
        deeplTargetLang as deepl.TargetLanguageCode,
        {
          splitSentences: '0' as any, // 文の分割を完全に無効化（0 = off）
          preserveFormatting: true, // フォーマットを保持
        }
      );

      return {
        translatedText: result.text,
        detectedSourceLang: result.detectedSourceLang || sourceLang || 'unknown',
      };
    } catch (error) {
      console.error('DeepL translation error:', error);
      throw new Error('Translation failed');
    }
  }

  /**
   * 複数のテキストを一括翻訳する
   */
  async translateBatch(
    texts: string[],
    targetLang: string,
    sourceLang?: string
  ): Promise<Array<{ translatedText: string; detectedSourceLang: string }>> {
    try {
      if (!process.env.DEEPL_API_KEY) {
        throw new Error('DEEPL_API_KEY is not defined in environment variables');
      }

      // 言語コードをDeepL形式に変換
      const deeplTargetLang = this.convertToDeepLTargetLang(targetLang);

      const results = await this.getTranslator().translateText(
        texts,
        (sourceLang as deepl.SourceLanguageCode | null | undefined) ?? null,
        deeplTargetLang as deepl.TargetLanguageCode
      );

      const normalizedResults = Array.isArray(results) ? results : [results];

      return normalizedResults.map((result) => ({
        translatedText: result.text,
        detectedSourceLang: result.detectedSourceLang || sourceLang || 'unknown',
      }));
    } catch (error) {
      console.error('DeepL batch translation error:', error);
      throw new Error('Batch translation failed');
    }
  }

  /**
   * 利用可能な言語を取得
   */
  async getSourceLanguages(): Promise<readonly deepl.Language[]> {
    try {
      if (!process.env.DEEPL_API_KEY) {
        throw new Error('DEEPL_API_KEY is not defined in environment variables');
      }
      return await this.getTranslator().getSourceLanguages();
    } catch (error) {
      console.error('Error fetching source languages:', error);
      throw new Error('Failed to fetch source languages');
    }
  }

  async getTargetLanguages(): Promise<readonly deepl.Language[]> {
    try {
      if (!process.env.DEEPL_API_KEY) {
        throw new Error('DEEPL_API_KEY is not defined in environment variables');
      }
      return await this.getTranslator().getTargetLanguages();
    } catch (error) {
      console.error('Error fetching target languages:', error);
      throw new Error('Failed to fetch target languages');
    }
  }

  /**
   * API使用状況を取得
   */
  async getUsage(): Promise<deepl.Usage> {
    try {
      if (!process.env.DEEPL_API_KEY) {
        throw new Error('DEEPL_API_KEY is not defined in environment variables');
      }
      return await this.getTranslator().getUsage();
    } catch (error) {
      console.error('Error fetching usage:', error);
      throw new Error('Failed to fetch usage information');
    }
  }
}

export default new DeepLService();

// Made with Bob

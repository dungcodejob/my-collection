import * as cheerio from 'cheerio';
import { URL } from 'url';

export interface ExtractedMetadata {
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  contentType?: string;
  contentLength?: number;
  favicon?: string;
  author?: string;
  publishedDate?: Date;
  modifiedDate?: Date;
  keywords?: string[];
  language?: string;
  canonical?: string;
  robots?: string;
  viewport?: string;
  charset?: string;
  openGraph?: OpenGraphData;
  twitterCard?: TwitterCardData;
  jsonLd?: any[];
  links?: LinkData[];
  images?: ImageData[];
  videos?: VideoData[];
  content?: string;
  screenshotUrl?: string;
}

export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
}

export interface TwitterCardData {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
  site?: string;
  creator?: string;
}

export interface LinkData {
  href: string;
  text: string;
  rel?: string;
  type?: string;
}

export interface ImageData {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface VideoData {
  src: string;
  type?: string;
  width?: number;
  height?: number;
}

export class MetadataExtractor {
  /**
   * Extract metadata from HTML content
   */
  static extractFromHtml(
    html: string,
    baseUrl: string,
    contentType?: string,
    contentLength?: number,
  ): ExtractedMetadata {
    const $ = cheerio.load(html);
    const metadata: ExtractedMetadata = {};

    // Basic metadata
    metadata.contentType = contentType;
    metadata.contentLength = contentLength;

    // Title
    metadata.title = this.extractTitle($);

    // Description
    metadata.description = this.extractDescription($);

    // Image
    metadata.imageUrl = this.extractImage($, baseUrl);

    // Site name
    metadata.siteName = this.extractSiteName($);

    // Other meta tags
    metadata.author = this.extractAuthor($);
    metadata.publishedDate = this.extractPublishedDate($);
    metadata.modifiedDate = this.extractModifiedDate($);
    metadata.keywords = this.extractKeywords($);
    metadata.language = this.extractLanguage($);
    metadata.canonical = this.extractCanonical($, baseUrl);
    metadata.robots = this.extractRobots($);
    metadata.viewport = this.extractViewport($);
    metadata.charset = this.extractCharset($);
    metadata.favicon = this.extractFavicon($, baseUrl);

    // Open Graph
    metadata.openGraph = this.extractOpenGraph($, baseUrl);

    // Twitter Card
    metadata.twitterCard = this.extractTwitterCard($, baseUrl);

    // JSON-LD
    metadata.jsonLd = this.extractJsonLd($);

    // Links
    metadata.links = this.extractLinks($, baseUrl);

    // Images
    metadata.images = this.extractImages($, baseUrl);

    // Videos
    metadata.videos = this.extractVideos($, baseUrl);

    return metadata;
  }

  /**
   * Extract title from HTML
   */
  private static extractTitle($: cheerio.CheerioAPI): string | undefined {
    // Try Open Graph title first
    let title = $('meta[property="og:title"]').attr('content');

    // Try Twitter title
    if (!title) {
      title = $('meta[name="twitter:title"]').attr('content');
    }

    // Try regular title tag
    if (!title) {
      title = $('title').text();
    }

    // Try h1 tag
    if (!title) {
      title = $('h1').first().text();
    }

    return title ? title.trim() : undefined;
  }

  /**
   * Extract description from HTML
   */
  private static extractDescription($: cheerio.CheerioAPI): string | undefined {
    // Try Open Graph description first
    let description = $('meta[property="og:description"]').attr('content');

    // Try Twitter description
    if (!description) {
      description = $('meta[name="twitter:description"]').attr('content');
    }

    // Try meta description
    if (!description) {
      description = $('meta[name="description"]').attr('content');
    }

    return description ? description.trim() : undefined;
  }

  /**
   * Extract main image from HTML
   */
  private static extractImage(
    $: cheerio.CheerioAPI,
    baseUrl: string,
  ): string | undefined {
    // Try Open Graph image first
    let image = $('meta[property="og:image"]').attr('content');

    // Try Twitter image
    if (!image) {
      image = $('meta[name="twitter:image"]').attr('content');
    }

    // Try first img tag
    if (!image) {
      image = $('img').first().attr('src');
    }

    return image ? this.resolveUrl(image, baseUrl) : undefined;
  }

  /**
   * Extract site name from HTML
   */
  private static extractSiteName($: cheerio.CheerioAPI): string | undefined {
    // Try Open Graph site name first
    let siteName = $('meta[property="og:site_name"]').attr('content');

    // Try application name
    if (!siteName) {
      siteName = $('meta[name="application-name"]').attr('content');
    }

    return siteName ? siteName.trim() : undefined;
  }

  /**
   * Extract author from HTML
   */
  private static extractAuthor($: cheerio.CheerioAPI): string | undefined {
    const author = $('meta[name="author"]').attr('content');
    return author ? author.trim() : undefined;
  }

  /**
   * Extract published date from HTML
   */
  private static extractPublishedDate($: cheerio.CheerioAPI): Date | undefined {
    const dateStr =
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="date"]').attr('content') ||
      $('time[datetime]').attr('datetime');

    return dateStr ? new Date(dateStr) : undefined;
  }

  /**
   * Extract modified date from HTML
   */
  private static extractModifiedDate($: cheerio.CheerioAPI): Date | undefined {
    const dateStr =
      $('meta[property="article:modified_time"]').attr('content') ||
      $('meta[name="last-modified"]').attr('content');

    return dateStr ? new Date(dateStr) : undefined;
  }

  /**
   * Extract keywords from HTML
   */
  private static extractKeywords($: cheerio.CheerioAPI): string[] | undefined {
    const keywords = $('meta[name="keywords"]').attr('content');
    return keywords ? keywords.split(',').map((k) => k.trim()) : undefined;
  }

  /**
   * Extract language from HTML
   */
  private static extractLanguage($: cheerio.CheerioAPI): string | undefined {
    return (
      $('html').attr('lang') ||
      $('meta[http-equiv="content-language"]').attr('content')
    );
  }

  /**
   * Extract canonical URL from HTML
   */
  private static extractCanonical(
    $: cheerio.CheerioAPI,
    baseUrl: string,
  ): string | undefined {
    const canonical = $('link[rel="canonical"]').attr('href');
    return canonical ? this.resolveUrl(canonical, baseUrl) : undefined;
  }

  /**
   * Extract robots meta tag
   */
  private static extractRobots($: cheerio.CheerioAPI): string | undefined {
    return $('meta[name="robots"]').attr('content');
  }

  /**
   * Extract viewport meta tag
   */
  private static extractViewport($: cheerio.CheerioAPI): string | undefined {
    return $('meta[name="viewport"]').attr('content');
  }

  /**
   * Extract charset
   */
  private static extractCharset($: cheerio.CheerioAPI): string | undefined {
    return (
      $('meta[charset]').attr('charset') ||
      $('meta[http-equiv="content-type"]')
        .attr('content')
        ?.match(/charset=([^;]+)/)?.[1]
    );
  }

  /**
   * Extract favicon
   */
  private static extractFavicon(
    $: cheerio.CheerioAPI,
    baseUrl: string,
  ): string | undefined {
    const favicon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      '/favicon.ico';

    return favicon ? this.resolveUrl(favicon, baseUrl) : undefined;
  }

  /**
   * Extract Open Graph data
   */
  private static extractOpenGraph(
    $: cheerio.CheerioAPI,
    baseUrl: string,
  ): OpenGraphData {
    const og: OpenGraphData = {};

    $('meta[property^="og:"]').each((_, element) => {
      const property = $(element).attr('property')?.replace('og:', '');
      const content = $(element).attr('content');

      if (property && content) {
        switch (property) {
          case 'title':
            og.title = content;
            break;
          case 'description':
            og.description = content;
            break;
          case 'image':
            og.image = this.resolveUrl(content, baseUrl);
            break;
          case 'url':
            og.url = content;
            break;
          case 'type':
            og.type = content;
            break;
          case 'site_name':
            og.siteName = content;
            break;
          case 'locale':
            og.locale = content;
            break;
        }
      }
    });

    return og;
  }

  /**
   * Extract Twitter Card data
   */
  private static extractTwitterCard(
    $: cheerio.CheerioAPI,
    baseUrl: string,
  ): TwitterCardData {
    const twitter: TwitterCardData = {};

    $('meta[name^="twitter:"]').each((_, element) => {
      const name = $(element).attr('name')?.replace('twitter:', '');
      const content = $(element).attr('content');

      if (name && content) {
        switch (name) {
          case 'card':
            twitter.card = content;
            break;
          case 'title':
            twitter.title = content;
            break;
          case 'description':
            twitter.description = content;
            break;
          case 'image':
            twitter.image = this.resolveUrl(content, baseUrl);
            break;
          case 'site':
            twitter.site = content;
            break;
          case 'creator':
            twitter.creator = content;
            break;
        }
      }
    });

    return twitter;
  }

  /**
   * Extract JSON-LD structured data
   */
  private static extractJsonLd($: cheerio.CheerioAPI): any[] {
    const jsonLdData: any[] = [];

    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const content = $(element).html();
        if (content) {
          const data = JSON.parse(content);
          jsonLdData.push(data);
        }
      } catch (error) {
        console.error('Error parsing JSON-LD:', error);
        // Ignore invalid JSON-LD
      }
    });

    return jsonLdData;
  }

  /**
   * Extract links from HTML
   */
  private static extractLinks(
    $: cheerio.CheerioAPI,
    baseUrl: string,
  ): LinkData[] {
    const links: LinkData[] = [];

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      const rel = $(element).attr('rel');
      const type = $(element).attr('type');

      if (href && text) {
        links.push({
          href: this.resolveUrl(href, baseUrl),
          text,
          rel,
          type,
        });
      }
    });

    return links.slice(0, 50); // Limit to first 50 links
  }

  /**
   * Extract images from HTML
   */
  private static extractImages(
    $: cheerio.CheerioAPI,
    baseUrl: string,
  ): ImageData[] {
    const images: ImageData[] = [];

    $('img[src]').each((_, element) => {
      const src = $(element).attr('src');
      const alt = $(element).attr('alt');
      const width = parseInt($(element).attr('width') || '0') || undefined;
      const height = parseInt($(element).attr('height') || '0') || undefined;

      if (src) {
        images.push({
          src: this.resolveUrl(src, baseUrl),
          alt,
          width,
          height,
        });
      }
    });

    return images.slice(0, 20); // Limit to first 20 images
  }

  /**
   * Extract videos from HTML
   */
  private static extractVideos(
    $: cheerio.CheerioAPI,
    baseUrl: string,
  ): VideoData[] {
    const videos: VideoData[] = [];

    $('video[src], video source[src]').each((_, element) => {
      const src = $(element).attr('src');
      const type = $(element).attr('type');
      const width = parseInt($(element).attr('width') || '0') || undefined;
      const height = parseInt($(element).attr('height') || '0') || undefined;

      if (src) {
        videos.push({
          src: this.resolveUrl(src, baseUrl),
          type,
          width,
          height,
        });
      }
    });

    return videos.slice(0, 10); // Limit to first 10 videos
  }

  /**
   * Resolve relative URL to absolute URL
   */
  private static resolveUrl(url: string, baseUrl: string): string {
    try {
      return new URL(url, baseUrl).toString();
    } catch {
      return url;
    }
  }

  /**
   * Clean and truncate text
   */
  private static cleanText(text: string, maxLength: number = 500): string {
    return text.replace(/\s+/g, ' ').trim().substring(0, maxLength);
  }
}

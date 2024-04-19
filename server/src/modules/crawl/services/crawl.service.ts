import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import { MetadataDto } from "../models/metadata.dto";

@Injectable()
export class CrawlService {
  constructor() {}

  getMetadata(link: string): Promise<MetadataDto> {
    return fetch(link)
      .then(res => res.text())
      .then(html => {
        const $ = cheerio.load(html);
        const url = new URL(link);
        const title =
          $('meta[property="og:title"]').attr("content") ||
          $("title").text() ||
          $('meta[name="title"]').attr("content");
        const description =
          $('meta[property="og:description"]').attr("content") ??
          $('meta[name="description"]').attr("content");
        // let url = $('meta[property="og:url"]').attr('content');
        // const site_name = $('meta[property="og:site_name"]').attr('content');
        const image =
          $('meta[property="og:image"]').attr("content") ||
          $('meta[property="og:image:url"]').attr("content");
        const icon =
          $('link[rel="icon"]').attr("href") ||
          $('link[rel="shortcut icon"]').attr("href");
        // const keywords =
        //   $('meta[property="og:keywords"]').attr('content') ||
        //   $('meta[name="keywords"]').attr('content');

        const metadata = new MetadataDto();
        metadata.url = link;
        metadata.domain = url.hostname;
        metadata.image = image;
        metadata.title = title;
        metadata.description = description;

        metadata.favicon = this.validURL(icon) ? icon : url.origin + icon;

        return metadata;
      });
  }
  /*
   * Per RFC 3886, URL must begin with a scheme (not limited to http/https), e. g.:
   * - www.example.com is not valid URL (missing scheme)
   * - javascript:void(0) is valid URL, although not an HTTP one
   * - http://.. is valid URL with the host being .. (whether it resolves depends on your DNS)
   * - https://example..com is valid URL, same as above
   */
  isValidHttpUrl(value: string) {
    let url;

    try {
      url = new URL(value);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }

  validURL(str: string) {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  }
}

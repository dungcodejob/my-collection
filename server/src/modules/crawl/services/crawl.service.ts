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
        metadata.favicon = icon.includes("http") ? icon : url.origin + icon;

        return metadata;
      });
  }
}

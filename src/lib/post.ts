import browser from 'webextension-polyfill';
import Mustache from 'mustache';
import axios from 'axios'

export class Post {
  template: string;
  contentType: string;
  postUrl: string;
  regexp: string;

  constructor() {
    this.template = '';
    this.contentType = 'application/json';
    this.postUrl = '';
    this.regexp = '';
  }

  async sync() {
    const storage = await browser.storage.local.get() || {};
    this.template = storage['template'] || '';
    this.contentType = storage['contentType'] || 'application/json';
    this.postUrl = storage['postUrl'] || '';
    this.regexp = storage['regexp'] || ''
  }

  get() {
    return {
      postUrl: this.postUrl,
      template: this.template,
      contentType: this.contentType,
      regexp: this.regexp,
    };
  }

  async save() {
    return browser.storage.local.set({
      template: this.template,
      postUrl: this.postUrl,
      contentType: this.contentType,
      regexp: this.regexp,
    });
  }

  isStandby() {
    return this.template && this.contentType && this.postUrl;
  }

  generate(url: string): string {
    return Mustache.render(this.template, { url });
  }

  validate(url: string): boolean {
     const pattern = new RegExp(this.regexp, 'i');
     return pattern.test(url);
  }

  isFilteredUrl(): boolean {
    return !!this.regexp
  }

  async submit(url: string) {
    await axios.post(
      this.postUrl,
      this.generate(url),
      { headers: { 'Content-Type': this.contentType } }
    );
  }
}

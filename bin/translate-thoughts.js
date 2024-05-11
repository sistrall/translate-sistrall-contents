#!/usr/bin/env node

import 'dotenv/config';

import { buildClient } from '@datocms/cma-client-node';
import * as deepl from 'deepl-node';

const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

// Make sure the API token has access to the CMA, and is stored securely
const client = buildClient({ apiToken: process.env.DATOCMS_API_TOKEN });

async function translateText(itText) {
  const { text } = await translator.translateText(itText, null, 'en-GB', {
    preserveFormatting: true,
  });

  return text;
}

function needLocalization(thought) {
  const { title, slug, text, excerpt } = thought;

  return (
    !('en' in title) && !('en' in slug) && !('en' in text) && !('en' in excerpt)
  );
}

function isLocalizable(text) {
  return typeof text === 'string' && text.length > 0;
}

async function updateThought(thought, fields) {
  const { id } = thought;

  return await client.items.update(id, fields);
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

async function localizeThought(thought) {
  const { title, slug, text, excerpt } = thought;

  const enTitle = isLocalizable(title.it) ? await translateText(title.it) : '';
  const enText = isLocalizable(text.it) ? await translateText(text.it) : '';
  const enExcerpt = isLocalizable(excerpt.it)
    ? await translateText(excerpt.it)
    : '';

  const enSlug = isLocalizable(slug.it) ? slugify(enTitle) : '';

  const fields = {
    title: {
      ...title,
      en: enTitle,
    },
    slug: {
      ...slug,
      en: enSlug,
    },
    text: {
      ...text,
      en: enText,
    },
    excerpt: {
      ...excerpt,
      en: enExcerpt,
    },
  };

  return fields;
}

async function run() {
  // We'll be building up an array of all records using an AsyncIterator, `client.items.listPagedIterator()`
  const allRecords = [];

  for await (const record of client.items.listPagedIterator({
    filter: {
      type: 'thought',
    },
  })) {
    allRecords.push(record);
  }

  for (const record of allRecords) {
    if (needLocalization(record)) {
      console.log(await updateThought(record, await localizeThought(record)));
    }
  }
}

run();

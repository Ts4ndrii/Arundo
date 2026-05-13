const fs = require("fs/promises");
const path = require("path");

const rootDir = process.cwd();
const supportedLanguages = ["uk", "pl", "de", "fr", "es", "it", "cs", "ro", "tr"];
const localeDir = path.join(rootDir, "src", "locales");
const dataDir = path.join(rootDir, "src", "data");

const protectedPaths = [
  /^header\.brand$/,
  /^wiki\.detailsCTA$/,
  /\.href$/,
  /\.id$/,
  /\.center$/,
  /\.coordinates$/,
  /\.visualClass$/,
  /^profile\.guestEmail$/,
  /^auth\.emailPlaceholder$/,
  /^auth\.socialApple$/,
  /^auth\.socialGoogle$/,
  /^auth\.socialAppleEmail$/,
  /^auth\.socialGoogleEmail$/,
];

const translationCache = new Map();

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function joinPath(prefix, key) {
  return prefix ? `${prefix}.${key}` : key;
}

function arrayPath(prefix, index) {
  return `${prefix}[${index}]`;
}

function shouldTranslate(pathValue) {
  return !protectedPaths.some((pattern) => pattern.test(pathValue));
}

function collectTexts(baseNode, currentNode, pathValue, targetTextList) {
  if (typeof baseNode === "string") {
    const currentValue = typeof currentNode === "string" ? currentNode : undefined;

    if (shouldTranslate(pathValue) && (currentValue === undefined || currentValue === baseNode)) {
      targetTextList.push(baseNode);
    }

    return;
  }

  if (Array.isArray(baseNode)) {
    const currentArray = Array.isArray(currentNode) ? currentNode : undefined;

    for (let index = 0; index < baseNode.length; index += 1) {
      collectTexts(baseNode[index], currentArray?.[index], arrayPath(pathValue, index), targetTextList);
    }

    return;
  }

  if (isPlainObject(baseNode)) {
    const currentObject = isPlainObject(currentNode) ? currentNode : undefined;

    for (const key of Object.keys(baseNode)) {
      collectTexts(baseNode[key], currentObject?.[key], joinPath(pathValue, key), targetTextList);
    }
  }
}

function applyTranslations(baseNode, currentNode, pathValue, translationMap) {
  if (typeof baseNode === "string") {
    const currentValue = typeof currentNode === "string" ? currentNode : undefined;

    if (shouldTranslate(pathValue) && (currentValue === undefined || currentValue === baseNode)) {
      return translationMap.get(baseNode) ?? baseNode;
    }

    return currentValue ?? baseNode;
  }

  if (Array.isArray(baseNode)) {
    const currentArray = Array.isArray(currentNode) ? currentNode : [];
    const nextArray = baseNode.map((item, index) => applyTranslations(item, currentArray[index], arrayPath(pathValue, index), translationMap));

    if (currentArray.length > baseNode.length) {
      nextArray.push(...currentArray.slice(baseNode.length));
    }

    return nextArray;
  }

  if (isPlainObject(baseNode)) {
    const currentObject = isPlainObject(currentNode) ? currentNode : {};
    const nextObject = { ...currentObject };

    for (const key of Object.keys(baseNode)) {
      nextObject[key] = applyTranslations(baseNode[key], currentObject[key], joinPath(pathValue, key), translationMap);
    }

    return nextObject;
  }

  return currentNode ?? baseNode;
}

function chunkTexts(texts, maxItems = 15, maxCharacters = 1800) {
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const text of texts) {
    const textSize = String(text).length;
    const wouldOverflow = currentChunk.length >= maxItems || currentSize + textSize > maxCharacters;

    if (wouldOverflow && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentSize = 0;
    }

    currentChunk.push(text);
    currentSize += textSize;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function translateBatch(texts, targetLanguage) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(texts.join("\n"))}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Translation request failed for ${targetLanguage} (${response.status})`);
  }

  const data = await response.json();
  const entries = Array.isArray(data[0]) ? data[0] : data;

  return entries.map((entry) => {
    if (Array.isArray(entry?.[0])) {
      return String(entry[0][0]).trim();
    }

    return String(entry?.[0] ?? "").trim();
  });
}

async function translateTexts(texts, targetLanguage) {
  const orderedUniqueTexts = [];
  const seen = new Set();

  for (const text of texts) {
    const key = String(text);
    const cacheKey = `${targetLanguage}::${key}`;

    if (translationCache.has(cacheKey) || seen.has(key)) {
      continue;
    }

    seen.add(key);
    orderedUniqueTexts.push(key);
  }

  for (const chunk of chunkTexts(orderedUniqueTexts)) {
    const translatedChunk = await translateBatch(chunk, targetLanguage);

    translatedChunk.forEach((translatedText, index) => {
      const sourceText = chunk[index];
      translationCache.set(`${targetLanguage}::${sourceText}`, translatedText);
    });
  }

  const translationMap = new Map();
  for (const text of texts) {
    const key = String(text);
    const cacheKey = `${targetLanguage}::${key}`;
    if (translationCache.has(cacheKey)) {
      translationMap.set(key, translationCache.get(cacheKey));
    }
  }

  return translationMap;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function translateLocaleFile(baseFilePath, targetFilePath, targetLanguage) {
  const baseJson = await readJson(baseFilePath);
  const currentJson = await readJson(targetFilePath);
  const texts = [];

  collectTexts(baseJson, currentJson, "", texts);

  if (texts.length === 0) {
    return false;
  }

  const translationMap = await translateTexts(texts, targetLanguage);
  const translatedJson = applyTranslations(baseJson, currentJson, "", translationMap);
  await writeJson(targetFilePath, translatedJson);
  return true;
}

async function translateLanguageMapFile(filePath, sourceLanguage, targetLanguages) {
  const json = await readJson(filePath);
  const sourceNode = json[sourceLanguage];

  if (!sourceNode) {
    return false;
  }

  let changed = false;

  for (const targetLanguage of targetLanguages) {
    if (targetLanguage === sourceLanguage) {
      continue;
    }

    const targetNode = json[targetLanguage];
    const texts = [];
    collectTexts(sourceNode, targetNode, targetLanguage, texts);

    if (texts.length === 0) {
      continue;
    }

    const translationMap = await translateTexts(texts, targetLanguage);
    json[targetLanguage] = applyTranslations(sourceNode, targetNode, targetLanguage, translationMap);
    changed = true;
  }

  if (changed) {
    await writeJson(filePath, json);
  }

  return changed;
}

async function translateArrayFile(baseFilePath, targetFilePath, targetLanguage) {
  const baseArray = await readJson(baseFilePath);
  const currentArray = await readJson(targetFilePath).catch(() => null);
  const texts = [];

  collectTexts(baseArray, currentArray, targetLanguage, texts);

  if (texts.length === 0) {
    return false;
  }

  const translationMap = await translateTexts(texts, targetLanguage);
  const translatedArray = applyTranslations(baseArray, currentArray, targetLanguage, translationMap);
  await writeJson(targetFilePath, translatedArray);
  return true;
}

async function ensureSpotLocaleFile(targetLanguage) {
  const sourcePath = path.join(dataDir, "spots", "en.json");
  const targetPath = path.join(dataDir, "spots", `${targetLanguage}.json`);

  const exists = await fs
    .access(targetPath)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    const sourceArray = await readJson(sourcePath);
    const texts = [];
    collectTexts(sourceArray, undefined, targetLanguage, texts);
    const translationMap = await translateTexts(texts, targetLanguage);
    const translatedArray = applyTranslations(sourceArray, undefined, targetLanguage, translationMap);
    await writeJson(targetPath, translatedArray);
    return true;
  }

  return translateArrayFile(sourcePath, targetPath, targetLanguage);
}

async function main() {
  const localeSource = path.join(localeDir, "en.json");
  const localeTargets = ["uk", ...supportedLanguages.filter((language) => language !== "uk")];

  for (const targetLanguage of localeTargets) {
    const targetPath = path.join(localeDir, `${targetLanguage}.json`);
    if (targetLanguage === "en") {
      continue;
    }

    await translateLocaleFile(localeSource, targetPath, targetLanguage);
    console.log(`Translated locale ${targetLanguage}.json`);
  }

  await translateLanguageMapFile(path.join(dataDir, "wiki", "fish-cards.json"), "en", ["uk", ...supportedLanguages]);
  console.log("Translated fish-cards.json");

  await translateLanguageMapFile(path.join(dataDir, "wiki", "water-cards.json"), "en", ["uk", ...supportedLanguages]);
  console.log("Translated water-cards.json");

  for (const targetLanguage of supportedLanguages) {
    await ensureSpotLocaleFile(targetLanguage);
  }

  console.log("Locale translation complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
# Svelte Translate Pro

## Svelte Internationalization (i18n) with Dynamic Language Loading

This project provides a flexible internationalization (i18n) solution for Svelte applications, with support for multiple languages and dynamic translation loading. It allows you to load translation files at runtime, switch languages dynamically, and retrieve translations with support for interpolation.

## Features

- Support for multiple languages.
- Dynamic loading of translation files.
- Page-specific translations.
- Interpolation of variables in translation strings.
- Reactive translation system using Svelte stores.

## Installation

To get started, simply install the package using npm or yarn:

```bash
npm install svelte-translate-pro
```

or

```bash
yarn add svelte-translate-pro
```

## Usage

### 1. Define Supported Languages

You can define the languages supported by your application using the `AppLanguages` enum:

```typescript
import { AppLanguages } from 'svelte-translate-pro';

console.log(AppLanguages.EN); // "en"
```

### 2. Load Translation Files

Use the `importTranslationFile` function to dynamically load a translation file for a given language. The file should export the translation data as the default export.

```typescript
import { importTranslationFile, AppLanguages } from 'svelte-translate-pro';

// Load French translations
await importTranslationFile(AppLanguages.FR, '/translations/fr.json');
```

#### Translation File Example (`fr.json`)

```json
{
  "navbar.title": "Bienvenue",
  "footer.contact": "Contactez-nous"
}
```

### 3. Get the Current Language

You can retrieve the current language using the `getCurrentLanguage` function.

```typescript
import { getCurrentLanguage } from 'svelte-translate-pro';

const currentLang = getCurrentLanguage();
console.log(currentLang); // "en"
```

### 4. Set Page-Specific Translations

Use `setPageSpecificTranslations` to update translations for the current page. This allows you to set translations that are specific to the page content.

```typescript
import { setPageSpecificTranslations, AppLanguages } from 'svelte-translate-pro';

setPageSpecificTranslations({
    [AppLanguages.EN]: { "title": "Welcome to the page" },
    [AppLanguages.FA]: { "title": "به صفحه خوش آمدید" }
});
```

### 5. Retrieve Translations

You can use the `$t$` store to retrieve translations reactively in your Svelte components.

```svelte
<script lang="ts">
  import { t$ } from 'svelte-translate-pro';
</script>

<h1>{$t$('navbar.title')}</h1> <!-- Displays the translation for "navbar.title" -->
```

You can also pass variables for interpolation:

```typescript
const variables = { name: "John" };
const translatedText = $t$('greeting', variables);
```

#### Example with Interpolation (`greeting` key in JSON):

```json
{
  "greeting": "Hello, {{name}}!"
}
```

### Example with Language-Specific Variables

You can also pass language-specific values for interpolation:

```typescript
$t$('greeting', { name: {
  [AppLanguages.EN]: "John",
  [AppLanguages.FA]: "جان"
}});
```

### Inline Translation

If you need to provide inline translations directly in the code, you can use the following format:

```typescript
$t$({
  [AppLanguages.EN]: "Hello, World!",
  [AppLanguages.FA]: "سلام دنیا!"
});
```

### 6. Language Switching

You can switch the language by calling the `changeLanguage` function, which updates the application's language:

```typescript
import { changeLanguage, AppLanguages } from 'svelte-translate-pro';

changeLanguage(AppLanguages.FA); // Switches to Persian (FA)
changeLanguage(AppLanguages.EN); // Switches to English (EN)
```

### 7. Debugging

When loading translations in development mode (`DEV` environment variable is true), you will see console logs indicating successful translation file loading.

```bash
DEBUG=vite-plugin-svelte:node-modules-onwarn pnpm build
```

## API Reference

### `AppLanguages`

An enum that defines the supported languages:

```typescript
export enum AppLanguages {
    EN = "en",
    FA = "fa",
    ES = "es",
    DE = "de",
    FR = "fr",
    IT = "it",
    RU = "ru",
    CN = "zh-cn",
    JP = "ja",
    AR = "ar"
}
```

### `importTranslationFile(language: AppLanguage, filePath: string)`

Dynamically loads a translation file for the specified language and updates the global translations store.

```typescript
await importTranslationFile(AppLanguages.FR, '/translations/fr.json');
```

### `getCurrentLanguage(): AppLanguage`

Gets the current language of the application.

```typescript
const lang = getCurrentLanguage(); // "en"
```

### `setPageSpecificTranslations(data: Record<AppLanguage, TranslationData>)`

Sets page-specific translations for the current page.

```typescript
setPageSpecificTranslations({
    en: { "title": "Welcome" },
    fa: { "title": "به صفحه خوش آمدید" }
});
```

### `t$`: Readable

A derived store that provides a reactive translation function.

```svelte
<h1>{$t$('navbar.title')}</h1>
```

### `TranslationObject`

Represents a translation object that can map language codes to translation strings.

```typescript
type TranslationObject = Partial<Record<AppLanguage, string>>;
```

### `TranslationData`

Represents translation data for a single language.

```typescript
type TranslationData = Record<string, string>;
```

### `reactiveTranslate`: Reactive Translations for Arrays

`reactiveTranslate`is a utility function that provides a reactive array of translated items based on the current language.

```typescript
import { reactiveTranslate } from "svelte-translate-pro";

const tabs = reactiveTranslate((t) => [
    { title: t("tabs.recieve"), id: 1 },
    { title: t("tabs.send"), id: 2 },
]);

```
```sveltehtml
<div>
    {#each $tabs as tab}
        <button>{tab.title}</button>
    {/each}
</div>
```


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please fork this repository and submit your pull requests.

---

Happy coding and enjoy using the Svelte i18n system!

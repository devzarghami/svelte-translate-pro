import {derived, get, type Readable, writable, type Writable} from "svelte/store";
import {DEV} from "esm-env";

/**
 * Enum representing supported application languages.
 * It defines the available languages in the application.
 *
 * @example
 * ```typescript
 * const language: AppLanguages = AppLanguages.FA;
 * ```
 */
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
    AR = "ar",
}

export type AppLanguage = "en" | "fa" | "es" | "de" | "fr" | "it" | "ru" | "zh-cn" | "ja" | "ar";

/**
 * Default application language.
 * This value will be used if no other language is set.
 *
 * @example
 * ```typescript
 * const defaultLang: AppLanguage = DEFAULT_LANGUAGE; // "en"
 * ```
 */
const DEFAULT_LANGUAGE: AppLanguage = AppLanguages.EN;

/**
 * Type representing translation data for a specific language.
 * It stores key-value pairs where each key corresponds to a text item, and the value is its translation.
 *
 * @example
 * ```typescript
 * const enTranslation: TranslationData = {
 *   "navbar.title": "Welcome",
 *   "footer.contact": "Contact Us"
 * };
 * ```
 */
interface TranslationData {
    [key: string]: string | TranslationData;
}

/**
 * Type representing a translation object for multiple languages.
 * Each language code maps to a translation.
 *
 * @example
 * ```typescript
 * const translations: TranslationObject = {
 *   en: "Hello",
 *   fa: "سلام"
 * };
 * ```
 */
type TranslationObject = Partial<Record<AppLanguage, string>>;

/**
 * Store to hold the current application language.
 * It can be updated by the user or automatically through the language loading mechanism.
 */
const activeLanguage: Writable<AppLanguage> = writable(DEFAULT_LANGUAGE);

/**
 * Global translations data store.
 * Holds translations for all languages, including key-value pairs.
 */
const globalTranslationsStore: Writable<Record<AppLanguage, TranslationData>> = writable(<Record<AppLanguage, TranslationData>>{});

/**
 * Page-specific translations data store.
 * Stores translations specific to the current page.
 */
const pageTranslationsStore: Writable<Record<AppLanguage, TranslationData>> = writable(<Record<AppLanguage, TranslationData>>{});

/**
 * Dynamically imports a local translation file and updates the global translations store with the data.
 * Sets the current language to the language of the loaded translation.
 *
 * @param language - The target language to load (e.g., "en", "fa").
 * @param filePathOrData
 *
 * @example
 * ```typescript
 * await loadTranslation(AppLanguages.FA, '/lib/translations/fa.json');
 * Or
 * import en from "/lib/translations/en.json"
 * await loadTranslation(AppLanguages.EN, en);
 * ```
 */
export async function loadTranslation(language: AppLanguage, filePathOrData: string | TranslationData): Promise<void> {
    try {
        if (typeof filePathOrData === "string") {
            const data = await import(filePathOrData);
            globalTranslationsStore.update((currentData: any) => ({
                ...currentData,
                [language]: data.default || data,
            }));
            if (DEV) console.log(`Translation file loaded for language: ${language}`);
        } else if (typeof filePathOrData === "object") {
            globalTranslationsStore.update((currentData: any) => ({
                ...currentData,
                [language]: filePathOrData,
            }));
            if (DEV) console.log(`Translation data loaded for language: ${language}`);
        }
        activeLanguage.set(language);
    } catch (error) {
        if (typeof filePathOrData === "string") {
            console.error(`Failed to load translation file for language "${language}" from "${filePathOrData}":`, error);
        } else if (typeof filePathOrData === "object") {
            console.error(`Failed to load translation data for language "${language}" data:${filePathOrData}:`, error);
        }
    }
}

/**
 * Retrieves the current application language.
 * This can be used to check which language is currently active.
 *
 * @returns The current application language (e.g., "en", "fa").
 *
 * @example
 * ```typescript
 * const currentLang = getActiveLanguage(); // "en"
 * ```
 */
export function getActiveLanguage(): AppLanguage {
    return get(activeLanguage);
}

/**
 * Switches the current language of the application.
 * This function updates the application's language, which is then reflected across all translations.
 *
 * @param lang - The language code to switch to (e.g., "en", "fa", "es").
 *
 * @returns void - The language is updated reactively in the store.
 *
 * @example
 * ```typescript
 * setActiveLanguage(AppLanguages.EN); // Switches to English
 * setActiveLanguage(AppLanguages.FA); // Switches to Persian
 * ```
 */
export function setActiveLanguage(lang: AppLanguage) {
    activeLanguage.set(lang);
}

/**
 * Sets the page-specific translations for the current page.
 * This function allows updating translations that are specific to one page in the application.
 *
 * @param data - The translation data for the current page, keyed by language.
 *
 * @example
 * ```typescript
 * setPageSpecificTranslations({
 *   en: { "title": "Page Title" },
 *   fa: { "title": "عنوان صفحه" }
 * });
 * ```
 */
export function setPageSpecificTranslations(data: Record<AppLanguage, TranslationData>): void {
    pageTranslationsStore.set(data);

    if (DEV) {
        console.log("Page-specific translations updated.", data);
    }
}

/**
 * Retrieves a translation for a given key, first checking page-specific translations, then global translations.
 * Supports interpolation of dynamic variables in the translation string.
 *
 * @param key - The translation key (e.g., "navbar.title") or object with language-specific values.
 * @param variables - An object of dynamic variables to interpolate into the translation.
 * @param language - The current language of the application.
 * @param globalData - The global translation data.
 * @param specificData - The page-specific translation data.
 *
 * @returns The translated string, or the key if no translation is found.
 *
 * @example
 * ```typescript
 * const translation = getTranslation("navbar.title", {}, "fa", globalTranslationsStore, pageTranslationsStore);
 * console.log(translation); // "خوش آمدید"
 * ```
 */
function getTranslation(
    key: string | TranslationObject,
    variables: Record<string, string | TranslationObject> = {},
    language: AppLanguage,
    globalData: Record<AppLanguage, TranslationData>,
    specificData: Record<AppLanguage, TranslationData>,
): string {
    let translation: string | undefined;

    if (typeof key === "object") {
        translation = key[language] || key[DEFAULT_LANGUAGE] || Object.values(key)[0] || "";
    } else {
        const keys = key.split(".");

        translation = keys.reduce(
            (obj, k) => (obj && obj[k] ? obj[k] : undefined),
            specificData[language]
        ) as unknown as string | undefined;

        if (!translation) {
            translation = keys.reduce(
                (obj, k) => (obj && obj[k] ? obj[k] : undefined),
                globalData[language]
            ) as unknown as string | undefined;
        }

        if (!translation) {
            console.warn(`Missing translation for key "${key}" in language "${language}"`);
            return key; // Fallback to the key
        }
    }

    Object.keys(variables).forEach((varKey) => {
        const value = variables[varKey];
        let localizedValue: string;

        if (typeof value === "object" && value !== null) {
            localizedValue = value[language] || value[DEFAULT_LANGUAGE] || Object.values(value)[0] || "";
        } else {
            localizedValue = String(value);
        }

        translation = translation?.replace(new RegExp(`{{${varKey}}}`, "g"), localizedValue);
    });

    return <string>(translation || key);
}

/**
 * A utility function that provides reactive translations for an array of items.
 * It translates the fields of the array items based on the current language.
 *
 * @param translateFn - A function that returns an array of objects, each of which should contain fields to be translated.
 *
 * @returns A reactive array where each item contains translated fields.
 *
 * @example
 * ```typescript
 * const tabs = reactiveTranslate((t) => [
 *   { title: t("tabs.receive"), id: 1 },
 *   { title: t("tabs.send"), id: 2 },
 * ]);
 * ```
 */
export function reactiveTranslate<T>(translateFn: (t: (key: string) => string) => T[]): Readable<T[]> {
    return derived(t$, ($t: (key: string) => string) => translateFn($t));
}

/**
 * Derived store that provides a reactive translation function.
 * This allows translations to be accessed in Svelte components and be reactive to language changes.
 *
 * @example
 * ```svelte
 * <h1>{$t$('title')}</h1> <!-- Displays the translation for the "title" key in the current language -->
 * ```
 */
export const t$: Readable<
    (key: string | TranslationObject, vars?: Record<string, string | TranslationObject>) => string
> = derived(
    [activeLanguage, globalTranslationsStore, pageTranslationsStore],
    ([$language, $globalData, $pageData]) =>
        (key: string | TranslationObject, vars: Record<string, string | TranslationObject> = {}): string =>
            getTranslation(key, vars, $language, $globalData, $pageData),
);

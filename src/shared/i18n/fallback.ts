import type { Locale } from "./locales";
import type { Messages } from "./messages/en";

type FallbackKey =
  | "error.unexpected.title"
  | "error.unexpected.text"
  | "error.reference"
  | "error.retry"
  | "error.home";

// Texts of the last-resort error page, copied so it never ships a catalog
export const FALLBACK_MESSAGES: Readonly<Record<Locale, Pick<Messages, FallbackKey>>> = {
  en: {
    "error.unexpected.title": "Something went wrong",
    "error.unexpected.text": "The forecast could not be displayed.",
    "error.reference": "Error reference: {digest}",
    "error.retry": "Try again",
    "error.home": "Back to the forecast",
  },
  uk: {
    "error.unexpected.title": "Щось пішло не так",
    "error.unexpected.text": "Не вдалося показати прогноз.",
    "error.reference": "Код помилки: {digest}",
    "error.retry": "Спробувати ще",
    "error.home": "Повернутися до прогнозу",
  },
  cs: {
    "error.unexpected.title": "Něco se pokazilo",
    "error.unexpected.text": "Předpověď se nepodařilo zobrazit.",
    "error.reference": "Kód chyby: {digest}",
    "error.retry": "Zkusit znovu",
    "error.home": "Zpět na předpověď",
  },
  de: {
    "error.unexpected.title": "Etwas ist schiefgelaufen",
    "error.unexpected.text": "Die Vorhersage konnte nicht angezeigt werden.",
    "error.reference": "Fehlerreferenz: {digest}",
    "error.retry": "Erneut versuchen",
    "error.home": "Zurück zur Vorhersage",
  },
  es: {
    "error.unexpected.title": "Algo salió mal",
    "error.unexpected.text": "No se pudo mostrar la previsión.",
    "error.reference": "Referencia del error: {digest}",
    "error.retry": "Reintentar",
    "error.home": "Volver a la previsión",
  },
  fr: {
    "error.unexpected.title": "Une erreur s’est produite",
    "error.unexpected.text": "Les prévisions n’ont pas pu être affichées.",
    "error.reference": "Référence de l’erreur : {digest}",
    "error.retry": "Réessayer",
    "error.home": "Retour aux prévisions",
  },
  it: {
    "error.unexpected.title": "Qualcosa è andato storto",
    "error.unexpected.text": "Non è stato possibile mostrare le previsioni.",
    "error.reference": "Riferimento dell’errore: {digest}",
    "error.retry": "Riprova",
    "error.home": "Torna alle previsioni",
  },
  nl: {
    "error.unexpected.title": "Er ging iets mis",
    "error.unexpected.text": "De verwachting kon niet worden getoond.",
    "error.reference": "Foutreferentie: {digest}",
    "error.retry": "Opnieuw proberen",
    "error.home": "Terug naar de verwachting",
  },
  pl: {
    "error.unexpected.title": "Coś poszło nie tak",
    "error.unexpected.text": "Nie udało się wyświetlić prognozy.",
    "error.reference": "Identyfikator błędu: {digest}",
    "error.retry": "Spróbuj ponownie",
    "error.home": "Wróć do prognozy",
  },
  pt: {
    "error.unexpected.title": "Algo correu mal",
    "error.unexpected.text": "Não foi possível mostrar a previsão.",
    "error.reference": "Referência do erro: {digest}",
    "error.retry": "Tentar novamente",
    "error.home": "Voltar à previsão",
  },
};

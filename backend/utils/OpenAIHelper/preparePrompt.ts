export function preparePrompt(userEventsData: string, availableEventsData: string): string {
  return `
Jesteś systemem rekomendacji wydarzeń. Na podstawie wydarzeń, na które użytkownik się zapisał, zarekomenduj mu 4 najbardziej pasujących wydarzeń z poniższej listy.

**Wydarzenia użytkownika (lista obiektów JSON):**
${userEventsData}

**Wszystkie dostępne wydarzenia (lista obiektów JSON):**
${availableEventsData}

Wybierz 4 najbardziej pasujących wydarzeń z dostępnych wydarzeń i zwróć je w formacie JSON, z następującymi polami dla każdego wydarzenia:

{
  "_id": "_id danego wydarzenia"
  "title": "Tytuł wydarzenia" (pobierz z danych wydarzenia),
  "description": "Opis wydarzenia" (pobierz z danych wydarzenia),
  "image": "URL do obrazu" (pobierz z danych wydarzenia),
  "startDate": "Data rozpoczęcia w formacie YYYY-MM-DD" (pobierz z danych wydarzenia),
  "endDate": "Data zakończenia w formacie YYYY-MM-DD" (pobierz z danych wydarzenia),
  "location": "Lokalizacja" (pobierz z danych wydarzenia),
  "category": "Kategoria" (pobierz z danych wydarzenia),
  "availableTickets": Liczba dostępnych biletów (liczba całkowita, pobierz z danych wydarzenia),
  "ticketPrice": Cena biletu (liczba zmiennoprzecinkowa, pobierz z danych wydarzenia),
  "matchDetails": ["Powód rekomendacji 1", "Powód rekomendacji 2"] (wyjaśnij, dlaczego to wydarzenie pasuje do preferencji użytkownika)
}

**Ważne:** Odpowiedz **tylko** poprawnym JSON-em. Nie dodawaj żadnego dodatkowego tekstu ani komentarzy.

Zwróć **tylko** listę 4 obiektów JSON, bez dodatkowego tekstu.
`;
}

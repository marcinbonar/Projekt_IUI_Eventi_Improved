export function prepareAvailableEventsDescriptions(availableEvents: any[]): string {
  return availableEvents
    .map(
      (event: any) =>
        `${event.title} (${event.category}) w ${event.location} za ${event.ticketPrice} PLN data ${event.startDate} url do zdjecia ${event.image}  dostępne bilety  ${event.availableTickets}`
    )
    .join('; ');
}

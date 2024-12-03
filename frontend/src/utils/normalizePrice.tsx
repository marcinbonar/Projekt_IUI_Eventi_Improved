export const normalizePrice=(ticketPrice:number, minTicketPrice:number, maxTicketPrice:number)=>{
  if(maxTicketPrice===minTicketPrice) return 0
  const normalized =(ticketPrice-minTicketPrice)/(maxTicketPrice-minTicketPrice)
  return parseFloat(normalized.toFixed(2))
}
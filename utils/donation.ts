/** Patrimônio que a doação devolve ao time. */
export const DONATION_TARGET = 100;

type ShouldOfferDonationParams = {
  /** `reset_permitido` da API: false quando a doação da temporada já foi usada */
  allowed?: boolean;
  patrimony?: number;
  round?: number;
  /** Rodada em que o usuário escolheu "Não receber ainda" */
  dismissedRound?: number | null;
};

/** Mostra a oferta de doação: permitida, patrimônio abaixo de C$ 100 e não adiada nesta rodada. */
export function shouldOfferDonation({
  allowed,
  patrimony,
  round,
  dismissedRound,
}: ShouldOfferDonationParams) {
  if (!allowed || patrimony == null) return false;
  if (patrimony >= DONATION_TARGET) return false;
  return round == null || dismissedRound !== round;
}

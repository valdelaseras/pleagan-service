export enum PLEA_STATUS {
  UNNOTIFIED = "Unnotified",
  NOTIFIED = "Notified",
  RESPONDED = "Responded",
  AWAITING = "Awaiting",
  COMPLIED = "Complied",
}

// note: AWAITING is in stage between responded and complied,
// where a company may have pledged a vegan product but we are
// waiting for actual launch of promised product

class ErrorEntityNotFound extends Error {
  constructor(entity: string) {
    super(`${entity} not found`);
  }
}

export class ErrorInvoiceNotFound extends ErrorEntityNotFound {
  constructor() {
    super('Invoice');
    Object.setPrototypeOf(this, ErrorInvoiceNotFound.prototype);
  }
}

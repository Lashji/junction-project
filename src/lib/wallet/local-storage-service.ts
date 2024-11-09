export interface Account {
  did: string;
  isActive: boolean;
}

export class ActiveIdentityManager {
  private storageKey = "wallet:active-identity";

  getActiveIdentity(): Account | undefined {
    const identityJson = localStorage.getItem(this.storageKey);

    if (identityJson === null) {
      return;
    }
    return JSON.parse(identityJson) as Account;
  }

  setActiveIdentity(account: Account): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(account));
    } catch (error) {
      console.error("Error saving identity", error);
    }
  }
}

export class SaveManager {
  constructor(storageKey = 'mountain_thunder_save') {
    this.storageKey = storageKey;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return {
          bestScore: 0,
          missionsCleared: 0,
          upgrades: { engine: 0, radar: 0, armor: 0 }
        };
      }
      return { ...this.empty(), ...JSON.parse(raw) };
    } catch (error) {
      return this.empty();
    }
  }

  save(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  empty() {
    return {
      bestScore: 0,
      missionsCleared: 0,
      upgrades: { engine: 0, radar: 0, armor: 0 }
    };
  }
}

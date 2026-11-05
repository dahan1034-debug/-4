export class UpgradeSystem {
  constructor(save, state, panel) {
    this.save = save;
    this.state = state;
    this.panel = panel;
    this.levels = { engine: 0, armor: 0, missiles: 0 };
    this.syncPanel();
  }

  syncPanel() {
    if (!this.panel) return;
    const stats = this.state.upgrades;
    this.panel.querySelector('[data-upgrade="engine"]').textContent = `Engine ${stats.engine} / 3`;
    this.panel.querySelector('[data-upgrade="armor"]').textContent = `Armor ${stats.armor} / 3`;
    this.panel.querySelector('[data-upgrade="missiles"]').textContent = `Missiles ${stats.missiles} / 3`;
    this.panel.querySelector('[data-stat="credits"]').textContent = `Credits ${this.state.credits}`;
  }

  toggle() {
    if (!this.panel) return;
    this.panel.hidden = !this.panel.hidden;
  }

  apply(type) {
    if (!this.state.upgrades[type]) this.state.upgrades[type] = 0;
    if (this.state.upgrades[type] >= 3) return false;
    if (this.state.credits < 35) return false;

    this.state.credits -= 35;
    this.state.upgrades[type] += 1;

    if (type === 'engine') {
      this.state.health = 100 + this.state.upgrades.armor * 12;
      this.state.missiles = 8 + this.state.upgrades.missiles * 2;
    }

    if (type === 'armor') {
      this.state.health = 100 + this.state.upgrades.armor * 12;
    }

    if (type === 'missiles') {
      this.state.missiles += 2;
    }

    this.save.save({
      bestScore: this.state.score,
      missionsCleared: this.save.load().missionsCleared || 0,
      upgrades: this.state.upgrades,
      credits: this.state.credits
    });

    this.syncPanel();
    return true;
  }
}

export class UpgradeSystem {
  constructor(save, state, panel, onUpgrade = () => {}) {
    this.save = save;
    this.state = state;
    this.panel = panel;
    this.onUpgrade = onUpgrade;
    this.bind();
    this.syncPanel();
  }

  bind() {
    if (!this.panel) return;
    this.panel.querySelectorAll('.upgrade-btn').forEach(button => {
      button.addEventListener('click', () => {
        const ok = this.apply(button.dataset.upgrade);
        this.onUpgrade(ok, button.dataset.upgrade);
      });
    });
  }

  syncPanel() {
    if (!this.panel) return;
    for (const type of ['engine', 'armor', 'missiles']) {
      const button = this.panel.querySelector(`[data-upgrade="${type}"]`);
      if (button) button.textContent = `${type[0].toUpperCase()}${type.slice(1)} ${this.state.upgrades[type] || 0} / 3`;
    }
    const credits = this.panel.querySelector('[data-stat="credits"]');
    if (credits) credits.textContent = `Credits ${this.state.credits}`;
  }

  toggle() {
    if (this.panel) this.panel.hidden = !this.panel.hidden;
  }

  apply(type) {
    const allowed = ['engine', 'armor', 'missiles'];
    if (!allowed.includes(type)) return false;
    const level = this.state.upgrades[type] || 0;
    if (level >= 3 || this.state.credits < 35) return false;
    this.state.credits -= 35;
    this.state.upgrades[type] = level + 1;
    if (type === 'armor') this.state.health = this.state.maxHealth + 12;
    if (type === 'missiles') this.state.missiles += 2;

    const previous = this.save.load();
    this.save.save({ ...previous, upgrades: { ...this.state.upgrades }, credits: this.state.credits });
    this.syncPanel();
    return true;
  }
}

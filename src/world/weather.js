export function createWeatherSystem() {
  return {
    state: 'clear',
    intensity: 0.0,
    tick(dt) {
      const patterns = ['clear', 'fog', 'snow', 'storm'];
      if (Math.random() < 0.0015) {
        this.state = patterns[Math.floor(Math.random() * patterns.length)];
      }

      if (this.state === 'clear') this.intensity = Math.max(0, this.intensity - dt * 0.15);
      else this.intensity = Math.min(1, this.intensity + dt * 0.2);
    },
    getRadarFactor() {
      if (this.state === 'fog' || this.state === 'storm') return 0.62;
      if (this.state === 'snow') return 0.75;
      return 1;
    },
    getVisualFactor() {
      if (this.state === 'fog') return 0.45;
      if (this.state === 'storm') return 0.5;
      if (this.state === 'snow') return 0.82;
      return 1;
    }
  };
}

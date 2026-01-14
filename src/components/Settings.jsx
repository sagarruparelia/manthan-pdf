function Settings({ settings, onChange }) {
  return (
    <section className="settings-box">
      <div>
        <div className="option-item">
          <input
            type="checkbox"
            id="pageNumberToggle"
            checked={settings.pageNumbers}
            onChange={(e) => onChange('pageNumbers', e.target.checked)}
          />
          <label htmlFor="pageNumberToggle">Auto Page Numbers</label>
        </div>
        <div className="option-item">
          <input
            type="checkbox"
            id="watermarkToggle"
            checked={settings.watermark}
            onChange={(e) => onChange('watermark', e.target.checked)}
          />
          <label htmlFor="watermarkToggle">Add Watermark</label>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="watermarkText">Watermark Text:</label>
        <input
          type="text"
          id="watermarkText"
          placeholder="Example: CONFIDENTIAL"
          value={settings.watermarkText}
          onChange={(e) => onChange('watermarkText', e.target.value)}
        />
      </div>
    </section>
  );
}

export default Settings;

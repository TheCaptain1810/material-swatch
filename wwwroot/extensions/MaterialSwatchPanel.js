class MaterialSwatchPanel extends Autodesk.Viewing.UI.PropertyPanel {
  constructor(ext) {
    super(ext.viewer.container, "material-swatch-panel", "Material Swatch");
    this._materialSwatchExt = ext;
  }

  setVisible(show) {
    super.setVisible(show);
    if (show) {
      this.addProperty("Loading", "...", "Materials");
      this._materialSwatchExt
        .getPresets()
        .then((presets) => {
          this.removeAllProperties();
          for (const key of presets.keys()) {
            this.addProperty(key, "Apply to selection", "Materials");
          }
        })
        .catch((err) => this.addProperty("Error", err, "Materials"));
    }
  }

  async onPropertyClick(prop) {
    const selections = this._materialSwatchExt.viewer.getAggregateSelection();
    for (const group of selections) {
      for (const dbid of group.selection) {
        this._materialSwatchExt.applyPreset(prop.name, group.model, dbid);
      }
    }
    this._materialSwatchExt.viewer.clearSelection();
    this._materialSwatchExt.viewer.impl.invalidate(true, true, true);
  }
}

export { MaterialSwatchPanel };

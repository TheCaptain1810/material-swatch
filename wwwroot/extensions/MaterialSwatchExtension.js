import { BaseExtension } from "./BaseExtension.js";
import { MaterialSwatchPanel } from "./MaterialSwatchPanel.js";

class MaterialSwatchExtension extends BaseExtension {
  constructor(viewer, options) {
    super(viewer, options);
    this._swatch = null;
    // Try to extract swatch URN from URL hash (#...)
    const hashUrn = window.location.hash
      ? window.location.hash.substring(1)
      : "";
    this._urn = hashUrn;
    this._group = null;
    this._button = null;
    this._panel = null;
  }

  async load() {
    return true;
  }

  unload() {
    this._removeUI();
    return true;
  }

  onToolbarCreated() {
    this._createUI();
  }

  _createUI() {
    this._button = this.createToolbarButton(
      "material-swatch-button",
      "https://img.icons8.com/small/32/paint-palette.png",
      "Material Swatch"
    );
    this._button.onClick = (ev) => {
      if (!this._panel) {
        this._panel = new MaterialSwatchPanel(this);
      }
      if (this._button.getState() !== Autodesk.Viewing.UI.Button.State.ACTIVE) {
        this._button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);
        this._panel.setVisible(true);
      } else {
        this._button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
        this._panel.setVisible(false);
      }
    };
    // Use a shared group for dashboard tools
    const groupId = "dashboard-group";
    let group = this.viewer.toolbar.getControl(groupId);
    if (!group) {
      group = new Autodesk.Viewing.UI.ControlGroup(groupId);
      this.viewer.toolbar.addControl(group);
    }
    group.addControl(this._button);
    this._group = group;
  }

  _removeUI() {
    if (this._panel) {
      this._panel.setVisible(false);
      this._panel = null;
    }
    if (this._group) {
      this.viewer.toolbar.removeControl(this._group);
      this._group = null;
      this._button = null;
    }
  }

  async getPresets() {
    if (!this._swatch) {
      this._swatch = await this._loadSwatchModel(this._urn);
    }
    const presets = new Map();
    const tree = this._swatch.getInstanceTree();
    const frags = this._swatch.getFragmentList();
    tree.enumNodeChildren(
      tree.getRootId(),
      function (dbid) {
        if (tree.getChildCount(dbid) === 0) {
          const name = tree.getNodeName(dbid);
          tree.enumNodeFragments(
            dbid,
            function (fragid) {
              if (!presets.has(name)) {
                presets.set(name, frags.getMaterial(fragid));
              }
            },
            true
          );
        }
      },
      true
    );
    return presets;
  }

  async applyPreset(name, targetModel, targetObjectId) {
    const presets = await this.getPresets();
    if (!presets.has(name)) {
      console.error("Material swatch not found", name);
      return;
    }
    const material = presets.get(name);
    const tree = targetModel.getInstanceTree();
    const frags = targetModel.getFragmentList();
    tree.enumNodeFragments(
      targetObjectId,
      function (fragid) {
        frags.setMaterial(fragid, material);
      },
      true
    );
    targetModel.unconsolidate();
  }

  async _loadSwatchModel(urn) {
    const viewer = this.viewer;
    return new Promise(function (resolve, reject) {
      function onSuccess(doc) {
        const viewable = doc.getRoot().getDefaultGeometry();
        viewer.addEventListener(
          Autodesk.Viewing.TEXTURES_LOADED_EVENT,
          function (ev) {
            if (ev.model._isSwatch) {
              resolve(ev.model);
            }
          }
        );
        viewer
          .loadDocumentNode(doc, viewable, {
            preserveView: true,
            keepCurrentModels: true,
            loadAsHidden: true,
          })
          .then((model) => (model._isSwatch = true));
      }
      function onError(code, msg) {
        reject(msg);
      }
      Autodesk.Viewing.Document.load("urn:" + urn, onSuccess, onError);
    });
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "MaterialSwatchExtension",
  MaterialSwatchExtension
);

export { MaterialSwatchExtension };

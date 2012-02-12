(function () {
  var moreTools = {
    toolsMenuPopup: undefined,
    moreToolsMenuPopup: undefined,
    itemsToKeep: undefined,

    applicationName: '',
    documentName: '',

    prefs: {
      showWhenEmpty: { name: 'showWhenEmpty', value: false },
      extensionToolsToKeep: { name: 'extensionToolsToKeep', value: ''},
      nativeToolsToMove: { name: 'nativeToolsToMove', value: ''},
      nativeTools: { name: 'nativeTools', value: ''}
    },

    loadPrefs: function () {
      'use strict';

      var prefBranch;

      prefBranch = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.moretools.');
      this.prefs.showWhenEmpty.value = prefBranch.getBoolPref(this.prefs.showWhenEmpty.name);
      this.prefs.extensionToolsToKeep.value = prefBranch.getCharPref(this.prefs.extensionToolsToKeep.name);
      this.prefs.nativeToolsToMove.value = prefBranch.getCharPref(this.prefs.nativeToolsToMove.name);
      this.prefs.nativeTools.value = prefBranch.getCharPref(this.prefs.nativeTools.name + '.' + this.applicationName + '.' + this.documentName);
    },

    getToolsMenuPopupSnapshot: function () {
      'use strict';

      var doc = document.ownerDocument || document;
      return doc.evaluate(
        '//xul:menupopup[@id="menu_ToolsPopup" or @id="taskPopup"]/*',
        doc,
        function () { return 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'; },
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
    },

    updateItemsToKeep: function () {
      'use strict';

      var itemsToKeepArray = this.prefs.nativeTools.value.replace(/\s*,\s*/g, ',').split(',');
      if (this.prefs.nativeToolsToMove.value.trim() !== '') {
        itemsToKeepArray = itemsToKeepArray.diff(this.prefs.nativeToolsToMove.value.replace(/\s*,\s*/g, ',').split(','));
      }
      if (this.prefs.extensionToolsToKeep.value.trim() !== '') {
        itemsToKeepArray = itemsToKeepArray.union(this.prefs.extensionToolsToKeep.value.replace(/\s*,\s*/g, ',').split(','));
      }
      this.itemsToKeep = new RegExp('^(' + itemsToKeepArray.join('|') + ')$');
    },

    dumpToolsMenuItems: function () {
      'use strict';

      var toolsMenuPopupSnapshot, i, l, message1, message2;

      toolsMenuPopupSnapshot = this.getToolsMenuPopupSnapshot();
      if (toolsMenuPopupSnapshot) {
        message1 = 'Items found in Tools menu at startup (' + toolsMenuPopupSnapshot.snapshotLength + '):\n';
        message2 = "pref('extensions.moretools.nativeTools." + this.applicationName + "." + this.documentName + "', '";
        for (i = 0, l = toolsMenuPopupSnapshot.snapshotLength; i < l; i += 1) {
          message1 += '\t' + toolsMenuPopupSnapshot.snapshotItem(i).id + '\t' + toolsMenuPopupSnapshot.snapshotItem(i).label + '\n';
          if (toolsMenuPopupSnapshot.snapshotItem(i).id !== '') {
            message2 += toolsMenuPopupSnapshot.snapshotItem(i).id + ', ';
          }
        }
        if (message2.substring(message2.length - 2) === ', ') {
          message2 = message2.slice(0, message2.length - 2);
        }
        message2 += "');";
        Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService).logStringMessage(message1);
        Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService).logStringMessage(message2);
      }
    },

    moveTools: function () {
      'use strict';

      var toolsMenuPopupSnapshot, i, l, item, moreToolsMenuIsEmpty;

      toolsMenuPopupSnapshot = this.getToolsMenuPopupSnapshot();
      if (toolsMenuPopupSnapshot) {
        for (i = 0, l = toolsMenuPopupSnapshot.snapshotLength; i < l; i += 1) {
          item = toolsMenuPopupSnapshot.snapshotItem(i);
          if (item && item.id && !this.itemsToKeep.test(item.id)) {
            if (item.tagName === 'menuseparator') {
              this.toolsMenuPopup.removeChild(item);
            } else {
              this.moreToolsMenuPopup.appendChild(item);
            }
          }
        }
      }

      moreToolsMenuIsEmpty = (this.moreToolsMenuPopup.childNodes.length === 2);

      if (moreToolsMenuIsEmpty) {
        document.getElementById('more-tools-label').setAttribute('hidden', false);
        document.getElementById('more-tools-sep').setAttribute('hidden', false);
      } else {
        document.getElementById('more-tools-label').setAttribute('hidden', true);
        document.getElementById('more-tools-sep').setAttribute('hidden', true);
      }

      if (moreToolsMenuIsEmpty && this.prefs.showWhenEmpty.value === false) {
        document.getElementById('more-tools-menu').setAttribute('hidden', true);
      } else {
        document.getElementById('more-tools-menu').setAttribute('hidden', false);
      }
    },

    startup: function () {
      'use strict';

      this.applicationName = Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULAppInfo).name.toLowerCase();
      this.documentName = document.documentURI.replace(/^chrome:\/\/[a-z\/]+\/([a-z]+)\.xul$/i, '$1');

      this.loadPrefs();

      this.toolsMenuPopup =
        document.getElementById('menu_ToolsPopup') ||  // Firefox
        document.getElementById('taskPopup');          // Thunderbird, SeaMonkey
      this.moreToolsMenuPopup = document.getElementById('more-tools-menupopup');

      // this.dumpToolsMenuItems();

      this.updateItemsToKeep();

      this.moveTools();

      this.toolsMenuPopup.addEventListener('DOMNodeInserted', moreTools_moveTools, true);
    },

    shutdown: function () {
      'use strict';
    }
  };

  function moreTools_startup() {
    'use strict';

    moreTools.startup();
  }

  function moreTools_shutdown() {
    'use strict';

    moreTools.shutdown();
  }

  function moreTools_moveTools() {
    'use strict';

    moreTools.moveTools();
  }

  window.addEventListener('load', moreTools_startup, true);
  window.addEventListener('unload', moreTools_shutdown, true);
}());
